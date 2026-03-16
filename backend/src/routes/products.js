const express = require('express');
const multer = require('multer');
const pool = require('../config/db');
const { authenticate, isAdmin } = require('../middleware/auth');
const { uploadToS3, deleteFromS3, getPresignedUploadUrl } = require('../services/s3');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ════════════════════════════════════════════════════════
// GET /api/products  — improved filters
// ════════════════════════════════════════════════════════
router.get('/', async (req, res) => {
  try {
    const {
      category, featured, search, min_price, max_price,
      sort, page = 1, limit = 12,
      material, in_stock, tags,        // NEW filters
      rating_min,                       // NEW: minimum avg rating
    } = req.query;

    const offset = (page - 1) * limit;
    let conditions = ['p.is_active = true'];
    let params = [];
    let idx = 1;

    if (category) {
      // Support comma-separated multiple categories: ?category=rings,earrings
      const cats = category.split(',').map(c => c.trim()).filter(Boolean);
      if (cats.length === 1) {
        conditions.push(`c.slug = $${idx++}`);
        params.push(cats[0]);
      } else {
        const placeholders = cats.map(() => `$${idx++}`).join(',');
        conditions.push(`c.slug IN (${placeholders})`);
        params.push(...cats);
      }
    }

    if (featured === 'true') conditions.push(`p.is_featured = true`);

    if (search) {
      conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx} OR p.material ILIKE $${idx} OR $${idx} = ANY(p.tags))`);
      params.push(`%${search}%`);
      idx++;
    }

    if (min_price) { conditions.push(`COALESCE(p.sale_price, p.base_price) >= $${idx++}`); params.push(min_price); }
    if (max_price) { conditions.push(`COALESCE(p.sale_price, p.base_price) <= $${idx++}`); params.push(max_price); }

    // NEW: material filter (comma-separated)
    if (material) {
      const mats = material.split(',').map(m => m.trim()).filter(Boolean);
      const placeholders = mats.map(() => `$${idx++}`).join(',');
      conditions.push(`p.material ILIKE ANY(ARRAY[${mats.map(() => `$${idx - mats.length + mats.indexOf(mats[mats.length-1])}`)}])`);
      // simpler approach:
      conditions.pop();
      const matConditions = mats.map(() => `p.material ILIKE $${idx++}`);
      conditions.push(`(${matConditions.join(' OR ')})`);
      params.push(...mats.map(m => `%${m}%`));
    }

    // NEW: in_stock filter
    if (in_stock === 'true') conditions.push(`p.stock > 0`);

    // NEW: tags filter
    if (tags) {
      const tagList = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      const placeholders = tagList.map(() => `$${idx++}`).join(',');
      conditions.push(`p.tags && ARRAY[${placeholders}]::text[]`);
      params.push(...tagList);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'p.created_at DESC';
    if (sort === 'price_asc')    orderBy = 'COALESCE(p.sale_price, p.base_price) ASC';
    if (sort === 'price_desc')   orderBy = 'COALESCE(p.sale_price, p.base_price) DESC';
    if (sort === 'popular')      orderBy = 'p.is_featured DESC, p.created_at DESC';
    if (sort === 'rating')       orderBy = 'avg_rating DESC NULLS LAST';
    if (sort === 'newest')       orderBy = 'p.created_at DESC';
    if (sort === 'name_asc')     orderBy = 'p.name ASC';
    if (sort === 'discount')     orderBy = '(p.base_price - COALESCE(p.sale_price, p.base_price)) DESC';

    // Count query (for pagination)
    const countResult = await pool.query(
      `SELECT COUNT(DISTINCT p.id) FROM products p LEFT JOIN categories c ON p.category_id = c.id ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);

    const query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image,
        (SELECT json_agg(pi2.image_url ORDER BY pi2.sort_order) FROM product_images pi2 WHERE pi2.product_id = p.id) as all_images,
        ROUND(AVG(r.rating)::numeric, 1) as avg_rating,
        COUNT(DISTINCT r.id) as review_count,
        EXISTS(SELECT 1 FROM product_sizes ps WHERE ps.product_id = p.id) as has_sizes
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON r.product_id = p.id AND r.is_approved = true
      ${whereClause}
      GROUP BY p.id, c.name, c.slug
      ${rating_min ? `HAVING ROUND(AVG(r.rating)::numeric,1) >= ${parseFloat(rating_min)}` : ''}
      ORDER BY ${orderBy}
      LIMIT $${idx++} OFFSET $${idx}
    `;

    const result = await pool.query(query, params);
    res.json({
      success: true,
      data: result.rows,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
      filters_applied: { category, material, tags, in_stock, min_price, max_price, sort, search },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════
// GET /api/products/filter-options  — for building filter UI
// ════════════════════════════════════════════════════════
router.get('/filter-options', async (req, res) => {
  try {
    const [cats, mats, priceRange, tags] = await Promise.all([
      pool.query(`SELECT c.name, c.slug, COUNT(p.id) as count
        FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.is_active=true
        WHERE c.is_active=true GROUP BY c.id ORDER BY c.sort_order, c.name`),
      pool.query(`SELECT DISTINCT material FROM products WHERE is_active=true AND material IS NOT NULL ORDER BY material`),
      pool.query(`SELECT MIN(COALESCE(sale_price,base_price)) as min, MAX(COALESCE(sale_price,base_price)) as max FROM products WHERE is_active=true`),
      pool.query(`SELECT DISTINCT unnest(tags) as tag FROM products WHERE is_active=true ORDER BY tag`),
    ]);
    res.json({
      success: true,
      data: {
        categories: cats.rows,
        materials: mats.rows.map(r => r.material),
        price_range: { min: parseFloat(priceRange.rows[0].min), max: parseFloat(priceRange.rows[0].max) },
        tags: tags.rows.map(r => r.tag),
        sort_options: [
          { value: 'newest', label: 'Newest First' },
          { value: 'popular', label: 'Most Popular' },
          { value: 'price_asc', label: 'Price: Low to High' },
          { value: 'price_desc', label: 'Price: High to Low' },
          { value: 'rating', label: 'Top Rated' },
          { value: 'discount', label: 'Best Discount' },
          { value: 'name_asc', label: 'Name A-Z' },
        ],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════
// GET /api/products/:slug  — single product with sizes
// ════════════════════════════════════════════════════════
router.get('/:slug', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug,
        ROUND(AVG(r.rating)::numeric, 1) as avg_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON r.product_id = p.id AND r.is_approved = true
      WHERE p.slug = $1 AND p.is_active = true
      GROUP BY p.id, c.name, c.slug
    `, [req.params.slug]);

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Product not found' });

    const product = result.rows[0];

    const [images, variants, sizes, reviews] = await Promise.all([
      pool.query('SELECT * FROM product_images WHERE product_id=$1 ORDER BY sort_order, id', [product.id]),
      pool.query('SELECT * FROM product_variants WHERE product_id=$1 ORDER BY id', [product.id]),
      pool.query('SELECT * FROM product_sizes WHERE product_id=$1 ORDER BY sort_order, id', [product.id]),
      pool.query(`SELECT r.*, u.name as user_name, u.avatar_url as user_avatar
        FROM reviews r JOIN users u ON r.user_id=u.id
        WHERE r.product_id=$1 AND r.is_approved=true
        ORDER BY r.created_at DESC LIMIT 20`, [product.id]),
    ]);

    product.images = images.rows;
    product.variants = variants.rows;
    product.sizes = sizes.rows;
    product.reviews = reviews.rows;

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════
// POST /api/products/upload-image-presign  (Admin)
// Get a presigned S3 URL so frontend uploads directly to S3
// ════════════════════════════════════════════════════════
router.post('/upload-image-presign', authenticate, isAdmin, async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ success: false, message: 'filename required' });

    const result = await getPresignedUploadUrl(filename, 'products');
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Presign error:', err.message);
    res.status(500).json({ success: false, message: 'Could not generate upload URL. Check AWS credentials in .env' });
  }
});

// ════════════════════════════════════════════════════════
// POST /api/products/upload-image  (Admin)
// Direct upload through server (alternative to presigned)
// ════════════════════════════════════════════════════════
router.post('/upload-image', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file provided' });

    const { url, key } = await uploadToS3(req.file.buffer, req.file.originalname, 'products');
    res.json({ success: true, data: { url, key } });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ success: false, message: 'Image upload failed. Check AWS credentials in .env' });
  }
});

// ════════════════════════════════════════════════════════
// POST /api/products  (Admin — create product)
// ════════════════════════════════════════════════════════
router.post('/', authenticate, isAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      name, slug, description, short_description, category_id,
      base_price, sale_price, material, stock, is_featured, tags,
      images = [],           // array of { url, alt_text, is_primary }
      sizes = [],            // array of { label, price_modifier, stock }
      allow_custom_text = false,
      custom_text_label = 'Custom Engraving / Note',
      custom_text_max_length = 50,
    } = req.body;

    const result = await client.query(`
      INSERT INTO products (name, slug, description, short_description, category_id, base_price, sale_price,
        material, stock, is_featured, tags, allow_custom_text, custom_text_label, custom_text_max_length)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *
    `, [name, slug, description, short_description, category_id, base_price, sale_price,
        material, stock, is_featured, tags, allow_custom_text, custom_text_label, custom_text_max_length]);

    const product = result.rows[0];

    // Insert images
    for (let i = 0; i < images.length; i++) {
      await client.query(
        'INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES ($1,$2,$3,$4,$5)',
        [product.id, images[i].url, images[i].alt_text || name, images[i].is_primary || i === 0, i]
      );
    }

    // Insert sizes
    for (let i = 0; i < sizes.length; i++) {
      await client.query(
        'INSERT INTO product_sizes (product_id, label, price_modifier, stock, sort_order) VALUES ($1,$2,$3,$4,$5)',
        [product.id, sizes[i].label, sizes[i].price_modifier || 0, sizes[i].stock || stock, i]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  } finally {
    client.release();
  }
});

// ════════════════════════════════════════════════════════
// PUT /api/products/:id  (Admin — update product)
// ════════════════════════════════════════════════════════
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      name, description, short_description, base_price, sale_price,
      material, stock, is_featured, is_active,
      images, sizes, tags,
      allow_custom_text, custom_text_label, custom_text_max_length,
    } = req.body;

    // Normalize tags — accept both array and comma-string
    const tagsArray = Array.isArray(tags)
      ? tags
      : (tags || '').split(',').map(t => t.trim()).filter(Boolean);

    const result = await client.query(`
      UPDATE products SET name=$1, description=$2, short_description=$3, base_price=$4,
      sale_price=$5, material=$6, stock=$7, is_featured=$8, is_active=$9,
      allow_custom_text=$10, custom_text_label=$11, custom_text_max_length=$12,
      tags=$13, updated_at=NOW()
      WHERE id=$14 RETURNING *
    `, [name, description, short_description, base_price, sale_price, material, stock,
        is_featured, is_active, allow_custom_text, custom_text_label, custom_text_max_length,
        tagsArray, req.params.id]);

    // Replace images if provided
    if (images !== undefined) {
      // Get old images to delete from S3
      const oldImages = await client.query('SELECT image_url FROM product_images WHERE product_id=$1', [req.params.id]);
      for (const row of oldImages.rows) {
        await deleteFromS3(row.image_url).catch(() => {});
      }
      await client.query('DELETE FROM product_images WHERE product_id=$1', [req.params.id]);
      for (let i = 0; i < images.length; i++) {
        await client.query(
          'INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES ($1,$2,$3,$4,$5)',
          [req.params.id, images[i].url, images[i].alt_text || name, images[i].is_primary || i === 0, i]
        );
      }
    }

    // Replace sizes if provided
    if (sizes !== undefined) {
      // Nullify cart_items references before deleting sizes (avoids FK violation)
      await client.query(`
        UPDATE cart_items SET size_id = NULL
        WHERE size_id IN (SELECT id FROM product_sizes WHERE product_id = $1)
      `, [req.params.id]);
      await client.query('DELETE FROM product_sizes WHERE product_id=$1', [req.params.id]);
      for (let i = 0; i < sizes.length; i++) {
        await client.query(
          'INSERT INTO product_sizes (product_id, label, price_modifier, stock, sort_order) VALUES ($1,$2,$3,$4,$5)',
          [req.params.id, sizes[i].label, sizes[i].price_modifier || 0, sizes[i].stock || stock, i]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PUT /products/:id error:', err.message, err.detail || '');
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  } finally {
    client.release();
  }
});

// ════════════════════════════════════════════════════════
// DELETE /api/products/:id/image/:imageId  (Admin)
// ════════════════════════════════════════════════════════
router.delete('/:id/image/:imageId', authenticate, isAdmin, async (req, res) => {
  try {
    const img = await pool.query('SELECT * FROM product_images WHERE id=$1 AND product_id=$2', [req.params.imageId, req.params.id]);
    if (!img.rows.length) return res.status(404).json({ success: false, message: 'Image not found' });

    await deleteFromS3(img.rows[0].image_url);
    await pool.query('DELETE FROM product_images WHERE id=$1', [req.params.imageId]);
    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════
// GET /api/products/:id/sizes  (Admin)
// ════════════════════════════════════════════════════════
router.get('/:id/sizes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM product_sizes WHERE product_id=$1 ORDER BY sort_order', [req.params.id]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/products/:id/similar ────────────────────────
router.get('/:id/similar', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 8;

    const current = await pool.query(
      'SELECT category_id, material FROM products WHERE id = $1', [id]
    );
    if (current.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const { category_id, material } = current.rows[0];

    const BASE_SELECT = `
      SELECT p.id, p.name, p.slug, p.base_price, p.sale_price,
        p.material, p.stock, p.is_featured,
        ROUND(AVG(r.rating)::numeric, 1) AS avg_rating,
        COUNT(DISTINCT r.id) AS review_count,
        pi.image_url AS primary_image
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
      LEFT JOIN reviews r ON r.product_id = p.id AND r.is_approved = true
    `;

    // Strategy 1: same category
    let rows = (await pool.query(
      BASE_SELECT + ` WHERE p.id != $1 AND p.is_active = true AND p.category_id = $2
      GROUP BY p.id, pi.image_url ORDER BY p.is_featured DESC, p.created_at DESC LIMIT $3`,
      [id, category_id, limit]
    )).rows;

    // Strategy 2: same material
    if (rows.length < limit && material) {
      const exclude = [parseInt(id), ...rows.map(r => r.id)];
      const fill = (await pool.query(
        BASE_SELECT + ` WHERE p.id != ALL($1::int[]) AND p.is_active = true AND p.material = $2
        GROUP BY p.id, pi.image_url ORDER BY p.is_featured DESC, p.created_at DESC LIMIT $3`,
        [exclude, material, limit - rows.length]
      )).rows;
      rows = [...rows, ...fill];
    }

    // Strategy 3: featured fallback
    if (rows.length < limit) {
      const exclude = [parseInt(id), ...rows.map(r => r.id)];
      const fill = (await pool.query(
        BASE_SELECT + ` WHERE p.id != ALL($1::int[]) AND p.is_active = true AND p.is_featured = true
        GROUP BY p.id, pi.image_url ORDER BY p.created_at DESC LIMIT $2`,
        [exclude, limit - rows.length]
      )).rows;
      rows = [...rows, ...fill];
    }

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
