-- ============================================================
--  HASTKALA — Full PostgreSQL Dump with Dummy Data
--  Import in pgAdmin: Right-click DB → Restore → or run via
--  Query Tool → Open File → hastkala_dump.sql → Execute
-- ============================================================

-- Drop & recreate schema cleanly
DROP TABLE IF EXISTS
  coupon_usages, return_items, return_requests, wishlists,
  reviews, order_items, orders, cart_items,
  product_sizes, product_variants, product_images,
  products, categories, coupons, users
CASCADE;

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password      VARCHAR(255),
  phone         VARCHAR(20),
  role          VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  is_verified   BOOLEAN DEFAULT false,
  google_id     VARCHAR(255) UNIQUE,
  avatar_url    VARCHAR(500),
  auth_provider VARCHAR(20) DEFAULT 'local',
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email     ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

INSERT INTO users (name, email, password, phone, role, is_verified, auth_provider) VALUES
-- admin (password: Admin@123)
('Admin HastKala',   'admin@hastkala.in',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9800000001', 'admin',    true,  'local'),
-- customers (password: Test@1234)
('Priya Sharma',     'priya@example.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9812345678', 'customer', true,  'local'),
('Meera Patel',      'meera@example.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9823456789', 'customer', true,  'local'),
('Anjali Gupta',     'anjali@example.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9834567890', 'customer', true,  'local'),
('Sunita Verma',     'sunita@example.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9845678901', 'customer', false, 'local'),
('Kavita Singh',     'kavita@example.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9856789012', 'customer', true,  'local'),
('Deepa Joshi',      'deepa@example.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9867890123', 'customer', true,  'local'),
('Ritu Agarwal',     'ritu@example.com',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9878901234', 'customer', true,  'local'),
('Nisha Mehta',      'nisha@example.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9889012345', 'customer', false, 'local'),
('Pooja Yadav',      'pooja@example.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9890123456', 'customer', true,  'local');

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url   VARCHAR(500),
  is_active   BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);

INSERT INTO categories (name, slug, description, image_url, sort_order) VALUES
('Door Torans',    'door-torans',   'Traditional and modern door torans handcrafted by artisans',     'https://images.unsplash.com/photo-1609766856923-5038fcd63e62?w=600&q=80', 1),
('Festival Decor', 'festival',      'Festive decorations for Diwali, Navratri, Puja and more',        'https://images.unsplash.com/photo-1574017989479-a5b8df17e98e?w=600&q=80', 2),
('Wedding',        'wedding',       'Bridal entrance decor and wedding torans',                       'https://images.unsplash.com/photo-1583753961571-9d3aa6bb00c6?w=600&q=80', 3),
('Wall Hangings',  'wall-hangings', 'Boho, macrame and woven art for interiors',                     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',   4),
('Fabric Torans',  'fabric-torans', 'Thread, cloth and fabric craft torans',                         'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80', 5),
('Gift Sets',      'gift-sets',     'Curated craft hampers and artisan gift boxes',                   'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80',   6);

-- ============================================================
-- 3. PRODUCTS
-- ============================================================
CREATE TABLE products (
  id                    SERIAL PRIMARY KEY,
  name                  VARCHAR(255) NOT NULL,
  slug                  VARCHAR(255) UNIQUE NOT NULL,
  description           TEXT,
  short_description     VARCHAR(500),
  category_id           INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  base_price            DECIMAL(10,2) NOT NULL,
  sale_price            DECIMAL(10,2),
  material              VARCHAR(255),
  weight_grams          INTEGER,
  stock                 INTEGER DEFAULT 0,
  is_featured           BOOLEAN DEFAULT false,
  is_active             BOOLEAN DEFAULT true,
  tags                  TEXT[],
  sku                   VARCHAR(100),
  allow_custom_text     BOOLEAN DEFAULT false,
  custom_text_label     VARCHAR(255) DEFAULT 'Custom Message / Name',
  custom_text_max_length INTEGER DEFAULT 50,
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_slug     ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active   ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);

DO $$
DECLARE
  c_door     INTEGER;
  c_festival INTEGER;
  c_wedding  INTEGER;
  c_wall     INTEGER;
  c_fabric   INTEGER;
  c_gift     INTEGER;
BEGIN
  SELECT id INTO c_door     FROM categories WHERE slug = 'door-torans';
  SELECT id INTO c_festival FROM categories WHERE slug = 'festival';
  SELECT id INTO c_wedding  FROM categories WHERE slug = 'wedding';
  SELECT id INTO c_wall     FROM categories WHERE slug = 'wall-hangings';
  SELECT id INTO c_fabric   FROM categories WHERE slug = 'fabric-torans';
  SELECT id INTO c_gift     FROM categories WHERE slug = 'gift-sets';

-- ── DOOR TORANS (10) ───────────────────────────────────────────────────────
INSERT INTO products (name, slug, description, short_description, category_id, base_price, sale_price, material, weight_grams, stock, is_featured, tags, sku) VALUES
('Rajasthani Mirror Work Toran',       'rajasthani-mirror-work-toran',       'Vibrant hand-stitched toran from Rajasthan with shisha mirror work and beadwork. Each piece is unique, crafted by skilled artisans using traditional techniques passed down through generations. Perfect for everyday doors and festive occasions alike.',                    'Vibrant mirror-work toran from Rajasthan.',           c_door,     899,  699,  'Cotton, Mirror Glass', 180, 45, true,  ARRAY['mirror','rajasthani','traditional','beaded'],   'DT-001'),
('Golden Thread Zari Toran',           'golden-thread-zari-toran',           'Luxurious golden zari thread toran with intricate embroidery patterns. Adds a regal touch to your entrance, ideal for festivals and ceremonies. Handcrafted by artisans in Gujarat.',                                                                                          'Zari embroidered golden toran.',                      c_door,    1299,  999,  'Silk, Zari Thread',    240, 30, true,  ARRAY['zari','gold','embroidered','luxury'],           'DT-002'),
('Mogra Flower Tassel Toran',          'mogra-flower-tassel-toran',          'Fresh and fragrant design with mogra flower motifs and silk tassels. A timeless classic that brings auspiciousness to your home. Available in multiple colour options.',                                                                                                         'Mogra motif tassel toran.',                           c_door,     599,  NULL, 'Cotton, Silk Tassels', 120, 60, false, ARRAY['mogra','tassel','flower','classic'],            'DT-003'),
('Peacock Embroidered Toran',          'peacock-embroidered-toran',           'Beautiful peacock motif toran with vibrant colours and detailed embroidery. The peacock symbolises grace and beauty in Indian tradition.',                                                                                                                                       'Embroidered peacock motif toran.',                    c_door,     799,  649,  'Cotton, Thread',       150, 50, true,  ARRAY['peacock','embroidered','colorful'],             'DT-004'),
('Beaded Mango Motif Toran',           'beaded-mango-motif-toran',           'Traditional mango (aam) motif toran with colourful seed beads. A symbol of prosperity and new beginnings, perfect for all occasions.',                                                                                                                                          'Beaded mango motif door toran.',                      c_door,     699,  NULL, 'Beads, Cotton Thread', 160, 40, false, ARRAY['beaded','mango','aam','traditional'],           'DT-005'),
('Gota Patti Festive Toran',           'gota-patti-festive-toran',           'Dazzling gota patti work toran with gold and silver metallic ribbon. Brings a festive sparkle to your entrance. Crafted by Jaipur artisans specialising in gota work.',                                                                                                         'Gota patti work toran for festivals.',                c_door,    1099,  849,  'Gota Patti, Cotton',   200, 35, true,  ARRAY['gota','festive','shiny','jaipur'],              'DT-006'),
('Marigold Inspired Fabric Toran',     'marigold-inspired-fabric-toran',     'Bright marigold-inspired toran with layered fabric flowers. Brings the warmth and joy of fresh flowers without the upkeep. Ideal for daily use.',                                                                                                                                'Marigold fabric flower toran.',                       c_door,     499,  399,  'Cotton Fabric',        130, 80, false, ARRAY['marigold','fabric','flower','daily'],           'DT-007'),
('Bohemian Pom Pom Toran',             'bohemian-pom-pom-toran',             'Playful bohemian toran with multi-coloured pom poms and geometric patterns. Adds a fun and modern twist to your décor while keeping the handmade spirit alive.',                                                                                                                 'Boho pom pom toran.',                                 c_door,     649,  NULL, 'Cotton, Wool',         140, 55, false, ARRAY['boho','pom-pom','colorful','modern'],          'DT-008'),
('Antique Brass Bell Toran',           'antique-brass-bell-toran',           'Elegant toran with antique brass bells that create a pleasing sound when the door opens. Bells are believed to ward off negative energy. Pairs perfectly with any door.',                                                                                                        'Brass bell toran with auspicious chime.',             c_door,    1499,  1199, 'Cotton, Brass Bells',  350, 25, true,  ARRAY['brass','bells','antique','premium'],            'DT-009'),
('Tribal Kutchi Toran',                'tribal-kutchi-toran',                'Authentic Kutch tribal toran featuring traditional embroidery motifs in vivid colours. Each piece reflects the unique artistry of Kutchi craftswomen.',                                                                                                                           'Authentic Kutchi embroidery toran.',                  c_door,     999,  799,  'Cotton, Silk Thread',  190, 20, true,  ARRAY['kutch','tribal','authentic','embroidered'],     'DT-010'),

-- ── FESTIVAL DECOR (8) ────────────────────────────────────────────────────
('Diwali Deepak Toran',                'diwali-deepak-toran',                'Celebrate Diwali with this stunning deepak (lamp) motif toran in gold and orange. Handcrafted to bring the spirit of the festival of lights to your doorstep.',                                                                                                                  'Diwali deepak motif golden toran.',                   c_festival, 799,  599,  'Cotton, Zari',         160, 70, true,  ARRAY['diwali','deepak','lamp','festival'],            'FD-001'),
('Navratri Garba Toran',               'navratri-garba-toran',               'Vibrant Navratri toran with garba dance and dandiya motifs. Brings the energy and joy of Navratri to your home. Available in traditional red and green.',                                                                                                                        'Navratri garba dance motif toran.',                   c_festival, 699,  549,  'Cotton, Thread',       150, 50, true,  ARRAY['navratri','garba','dance','festival'],          'FD-002'),
('Ganesh Chaturthi Toran Set',         'ganesh-chaturthi-toran-set',         'Set of 2 torans with Lord Ganesha motifs for Ganesh Chaturthi. Brings blessings and prosperity. Includes one door toran and one window toran.',                                                                                                                                 'Set of 2 Ganesha motif torans.',                      c_festival,1299,  999,  'Cotton, Mirror',       280, 40, true,  ARRAY['ganesh','set','festival','religious'],          'FD-003'),
('Holi Rangoli Toran',                 'holi-rangoli-toran',                 'Colourful rangoli-inspired toran perfect for Holi celebrations. Features traditional rangoli patterns in bright festival colours.',                                                                                                                                               'Colourful rangoli toran for Holi.',                   c_festival, 599,  NULL, 'Cotton, Thread',       130, 60, false, ARRAY['holi','rangoli','colorful','festival'],         'FD-004'),
('Janmashtami Peacock Toran',          'janmashtami-peacock-toran',          'Celebrate Lord Krishna''s birth with this peacock-feather inspired toran in blue and green. Perfect for Janmashtami and throughout the year.',                                                                                                                                   'Peacock feather toran for Janmashtami.',              c_festival, 849,  699,  'Cotton, Beads',        175, 35, false, ARRAY['krishna','peacock','blue','janmashtami'],       'FD-005'),
('Puja Thali Toran',                   'puja-thali-toran',                   'Auspicious toran with puja thali, kalash and om motifs. Perfect for the puja room door or main entrance. Brings divine blessings to your home.',                                                                                                                                 'Sacred puja motif toran.',                            c_festival, 749,  NULL, 'Cotton, Zari Thread',  155, 45, false, ARRAY['puja','religious','kalash','om'],               'FD-006'),
('Onam Floral Toran',                  'onam-floral-toran',                  'Inspired by the traditional Kerala pookalam, this fabric toran features layers of flower motifs in the classic Onam style. Celebrates the harvest festival with authentic Kerala artistry.',                                                                                    'Kerala-inspired floral toran for Onam.',              c_festival, 699,  549,  'Cotton Fabric',        145, 30, false, ARRAY['onam','kerala','floral','harvest'],             'FD-007'),
('Dussehra Victory Toran',             'dussehra-victory-toran',             'Triumph of good over evil celebrated in this striking toran with bow and arrow motifs in vibrant saffron and green. Perfect for Dussehra and Vijayadashami.',                                                                                                                    'Victory motif toran for Dussehra.',                   c_festival, 649,  NULL, 'Cotton, Thread',       135, 55, true,  ARRAY['dussehra','victory','festival','saffron'],      'FD-008'),

-- ── WEDDING (7) ───────────────────────────────────────────────────────────
('Royal Kalira Bridal Toran',          'royal-kalira-bridal-toran',          'Exquisite bridal toran featuring traditional kalira motifs in gold and ivory. Designed to adorn the wedding entrance with regal elegance. Handcrafted by bridal specialist artisans in Rajasthan.',                                                                             'Gold and ivory kalira bridal toran.',                 c_wedding, 2499, 1999, 'Silk, Gold Thread',    400, 20, true,  ARRAY['bridal','kalira','wedding','gold','royal'],     'WD-001'),
('Rose Gold Marigold Wedding Toran',   'rose-gold-marigold-wedding-toran',   'Romantic rose gold and peach marigold toran perfect for modern wedding entrances. Combines tradition with contemporary aesthetics for today''s bride.',                                                                                                                          'Rose gold marigold wedding toran.',                   c_wedding, 1899, 1499, 'Fabric, Thread',       320, 25, true,  ARRAY['wedding','marigold','rose-gold','modern'],      'WD-002'),
('Pearl Beaded Mandap Toran',          'pearl-beaded-mandap-toran',          'Luxurious pearl-beaded toran for the wedding mandap. Drapes beautifully and adds a timeless elegance to the sacred ceremony space.',                                                                                                                                             'Pearl beaded mandap entrance toran.',                 c_wedding, 3499, 2799, 'Pearls, Silk',         550, 15, true,  ARRAY['pearl','mandap','luxury','ceremony'],           'WD-003'),
('Mehndi Night Yellow Toran',          'mehndi-night-yellow-toran',          'Cheerful yellow and green toran specially designed for the mehndi ceremony. Brings the fun and colour of the mehndi night to your décor.',                                                                                                                                       'Yellow mehndi ceremony toran.',                       c_wedding, 1199, 899,  'Cotton, Thread',       200, 40, true,  ARRAY['mehndi','yellow','ceremony','fun'],             'WD-004'),
('Sangeet Tassel Toran',               'sangeet-tassel-toran',               'Vibrant multi-colour tassel toran for the sangeet night. Long flowing tassels in festive colours create a joyful atmosphere for the musical celebration.',                                                                                                                       'Vibrant tassel toran for sangeet.',                   c_wedding, 1499, 1199, 'Cotton, Silk Tassels', 280, 30, false, ARRAY['sangeet','tassel','vibrant','music'],           'WD-005'),
('Haldi Floral Toran',                 'haldi-floral-toran',                 'Sunny yellow floral toran crafted for the haldi ceremony. Features marigold and sunflower motifs in bright, auspicious yellow.',                                                                                                                                                 'Yellow floral haldi ceremony toran.',                 c_wedding,  999,  749,  'Cotton Fabric',        175, 50, false, ARRAY['haldi','yellow','floral','ceremony'],           'WD-006'),
('Grand Reception Toran',              'grand-reception-toran',              'Statement-making grand toran for wedding reception entrances. Extra-long design with layered beadwork, mirror work and gold zari embroidery. Makes the perfect first impression.',                                                                                               'Grand statement toran for reception entrance.',       c_wedding, 4999, 3999, 'Silk, Beads, Zari',    700, 10, true,  ARRAY['reception','grand','statement','premium'],      'WD-007'),

-- ── WALL HANGINGS (6) ────────────────────────────────────────────────────
('Bohemian Macrame Wall Hanging',      'bohemian-macrame-wall-hanging',      'Large handwoven macrame wall hanging in natural cotton. Perfect for living rooms and bedrooms. Brings a warm, earthy boho vibe to any space.',                                                                                                                                   'Natural cotton boho macrame wall hanging.',           c_wall,    1299, 999,  'Cotton Cord',          450, 30, true,  ARRAY['macrame','boho','natural','cotton','large'],    'WH-001'),
('Mandala Woven Dreamcatcher',         'mandala-woven-dreamcatcher',         'Intricate mandala-patterned dreamcatcher with feather and bead accents. Believed to catch negative dreams and bring peaceful sleep. Beautiful in any bedroom.',                                                                                                                  'Mandala dreamcatcher with feathers.',                 c_wall,     699,  549,  'Cotton, Feathers, Beads', 120, 55, true, ARRAY['dreamcatcher','mandala','feather','bedroom'],   'WH-002'),
('Warli Art Canvas Wall Hanging',      'warli-art-canvas-wall-hanging',      'Hand-painted Warli tribal art on canvas depicting village life and nature. Each piece is a one-of-a-kind creation by Warli artisans from Maharashtra.',                                                                                                                          'Handpainted Warli tribal art wall hanging.',          c_wall,    1899, 1499, 'Canvas, Paint',        350, 20, true,  ARRAY['warli','tribal','painting','maharashtra'],      'WH-003'),
('Tassel Fringe Boho Wall Art',        'tassel-fringe-boho-wall-art',        'Layered tassel and fringe wall art in earthy tones. Adds texture and warmth to plain walls. Handcrafted in Rajasthan.',                                                                                                                                                          'Layered tassel fringe boho wall art.',                c_wall,     899,  NULL, 'Cotton, Jute',         280, 40, false, ARRAY['tassel','fringe','boho','earthy'],              'WH-004'),
('Patchwork Kantha Wall Hanging',      'patchwork-kantha-wall-hanging',      'Colourful kantha patchwork wall hanging made from upcycled fabric. Each piece tells a story through its unique combination of colours and patterns from Bengal.',                                                                                                                'Kantha patchwork wall hanging.',                      c_wall,    1099, 849,  'Cotton Fabric',        300, 25, false, ARRAY['kantha','patchwork','upcycled','bengal'],       'WH-005'),
('Bamboo Wind Chime Wall Decor',       'bamboo-wind-chime-wall-decor',       'Natural bamboo wind chime with hand-painted designs. Creates soothing sounds and adds a natural aesthetic to any room or balcony.',                                                                                                                                              'Bamboo wind chime with hand-painted designs.',        c_wall,     599,  NULL, 'Bamboo, Cotton',       200, 60, false, ARRAY['bamboo','wind-chime','natural','balcony'],      'WH-006'),

-- ── FABRIC TORANS (5) ────────────────────────────────────────────────────
('Bandhani Fabric Toran',              'bandhani-fabric-toran',              'Authentic Bandhani tie-dye fabric toran from Gujarat. The traditional resist-dyeing technique creates beautiful circular patterns in vibrant colours.',                                                                                                                          'Authentic Bandhani tie-dye toran.',                   c_fabric,  749,  599,  'Cotton (Bandhani)',    165, 50, true,  ARRAY['bandhani','tie-dye','gujarat','colorful'],      'FT-001'),
('Ikat Woven Toran',                   'ikat-woven-toran',                   'Handwoven Ikat toran with geometric patterns created by the traditional resist-dyeing weaving technique. Crafted in Odisha, each piece carries the heritage of master weavers.',                                                                                                 'Handwoven Ikat toran from Odisha.',                   c_fabric,  999,  799,  'Cotton (Ikat)',        185, 35, true,  ARRAY['ikat','woven','odisha','geometric'],            'FT-002'),
('Kalamkari Block Print Toran',        'kalamkari-block-print-toran',        'Hand block-printed Kalamkari toran featuring mythological motifs in natural dyes. Each piece is printed by hand using traditional wooden blocks, making every toran unique.',                                                                                                    'Hand block-printed Kalamkari toran.',                 c_fabric,  849,  NULL, 'Cotton (Kalamkari)',   170, 40, false, ARRAY['kalamkari','block-print','natural-dye'],        'FT-003'),
('Madhubani Painted Fabric Toran',     'madhubani-painted-fabric-toran',     'Fabric toran hand-painted with Madhubani folk art motifs from Bihar. Features peacocks, flowers and geometric borders in the classic Madhubani style using natural pigments.',                                                                                                   'Madhubani folk art painted fabric toran.',            c_fabric, 1199,  949,  'Cotton Fabric, Paint', 210, 28, true,  ARRAY['madhubani','folk-art','bihar','painted'],       'FT-004'),
('Phulkari Embroidered Toran',         'phulkari-embroidered-toran',         'Colourful Phulkari embroidered toran from Punjab. Phulkari meaning flower work features dense colourful embroidery on plain cotton base using silk threads.',                                                                                                                    'Phulkari embroidered toran from Punjab.',             c_fabric, 1099,  849,  'Cotton, Silk Thread',  220, 32, false, ARRAY['phulkari','punjab','embroidered','silk'],       'FT-005'),

-- ── GIFT SETS (4) ────────────────────────────────────────────────────────
('Artisan Home Decor Gift Box',        'artisan-home-decor-gift-box',        'Curated gift box featuring a door toran, a small wall hanging and a pack of incense. Beautifully packaged in a handmade jute box. Perfect for housewarmings and Diwali gifting.',                                                                                              'Curated toran + wall hanging gift box.',              c_gift,   1999, 1699, 'Mixed Craft Materials', 600, 25, true,  ARRAY['gift','housewarming','diwali','curated'],       'GS-001'),
('Festival Decor Hamper',              'festival-decor-hamper',              'Complete festival décor hamper with a toran, diyas, a small rangoli stencil and scented candles. Everything you need to decorate your home for any Indian festival.',                                                                                                            'Complete festival décor hamper.',                     c_gift,   2499, 1999, 'Mixed Materials',       800, 20, true,  ARRAY['festival','hamper','diwali','complete'],        'GS-002'),
('Couple Wedding Gift Set',            'couple-wedding-gift-set',            'Thoughtful wedding gift set including a bridal toran, a pair of decorative pots and hand-painted coasters. Comes in a premium fabric-covered box with a personalised message card.',                                                                                            'Premium couple wedding gift set.',                    c_gift,   3499, 2999, 'Mixed Craft Materials', 950, 15, true,  ARRAY['wedding','couple','gift','premium'],            'GS-003'),
('Mini Craft Discovery Kit',           'mini-craft-discovery-kit',           'A lovely introduction to Indian craft with a mini toran, a small macrame, and a packet of natural dye fabric. Perfect for art lovers and gifting to children who love crafts.',                                                                                                  'Mini craft discovery gift kit.',                     c_gift,    999,  799,  'Mixed Materials',       400, 40, false, ARRAY['craft','kids','discovery','educational'],       'GS-004');

END $$;

-- ============================================================
-- 4. PRODUCT IMAGES
-- ============================================================
CREATE TABLE product_images (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url   VARCHAR(500) NOT NULL,
  alt_text    VARCHAR(255),
  is_primary  BOOLEAN DEFAULT false,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- Primary images for all products (using Unsplash placeholders)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT p.id,
  CASE
    WHEN p.slug LIKE '%mirror%'   THEN 'https://images.unsplash.com/photo-1609766856923-5038fcd63e62?w=800&q=85'
    WHEN p.slug LIKE '%zari%'     THEN 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=85'
    WHEN p.slug LIKE '%wedding%' OR p.slug LIKE '%bridal%' OR p.slug LIKE '%mandap%' THEN 'https://images.unsplash.com/photo-1583753961571-9d3aa6bb00c6?w=800&q=85'
    WHEN p.slug LIKE '%festival%' OR p.slug LIKE '%diwali%' OR p.slug LIKE '%navratri%' THEN 'https://images.unsplash.com/photo-1574017989479-a5b8df17e98e?w=800&q=85'
    WHEN p.slug LIKE '%macrame%'  THEN 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85'
    WHEN p.slug LIKE '%wall%'     THEN 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85'
    WHEN p.slug LIKE '%gift%' OR p.slug LIKE '%hamper%' THEN 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=85'
    ELSE 'https://images.unsplash.com/photo-1609766856923-5038fcd63e62?w=800&q=85'
  END,
  p.name, true, 0
FROM products p;

-- Secondary images
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT p.id,
  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
  p.name || ' - Detail', false, 1
FROM products p;

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT p.id,
  'https://images.unsplash.com/photo-1583753961571-9d3aa6bb00c6?w=800&q=80',
  p.name || ' - Lifestyle', false, 2
FROM products p;

-- ============================================================
-- 5. PRODUCT VARIANTS (colour for some products)
-- ============================================================
CREATE TABLE product_variants (
  id             SERIAL PRIMARY KEY,
  product_id     INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name           VARCHAR(100) NOT NULL,
  value          VARCHAR(100) NOT NULL,
  price_modifier DECIMAL(10,2) DEFAULT 0,
  stock          INTEGER DEFAULT 0,
  sort_order     INTEGER DEFAULT 0
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);

INSERT INTO product_variants (product_id, name, value, price_modifier, stock, sort_order)
SELECT p.id, 'Colour', 'Red & Gold',    0,   15, 0 FROM products p WHERE p.slug = 'rajasthani-mirror-work-toran'
UNION ALL
SELECT p.id, 'Colour', 'Blue & Silver', 0,   15, 1 FROM products p WHERE p.slug = 'rajasthani-mirror-work-toran'
UNION ALL
SELECT p.id, 'Colour', 'Green & Gold',  0,   15, 2 FROM products p WHERE p.slug = 'rajasthani-mirror-work-toran'
UNION ALL
SELECT p.id, 'Colour', 'Ivory & Gold',  0,   10, 0 FROM products p WHERE p.slug = 'royal-kalira-bridal-toran'
UNION ALL
SELECT p.id, 'Colour', 'Red & Gold',    0,   10, 1 FROM products p WHERE p.slug = 'royal-kalira-bridal-toran'
UNION ALL
SELECT p.id, 'Colour', 'Natural',      0,   15, 0 FROM products p WHERE p.slug = 'bohemian-macrame-wall-hanging'
UNION ALL
SELECT p.id, 'Colour', 'Cream White',  50,  15, 1 FROM products p WHERE p.slug = 'bohemian-macrame-wall-hanging';

-- ============================================================
-- 6. PRODUCT SIZES
-- ============================================================
CREATE TABLE product_sizes (
  id             SERIAL PRIMARY KEY,
  product_id     INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label          VARCHAR(100) NOT NULL,
  price_modifier DECIMAL(10,2) DEFAULT 0,
  stock          INTEGER DEFAULT 0,
  sort_order     INTEGER DEFAULT 0
);

CREATE INDEX idx_product_sizes_product ON product_sizes(product_id);

-- Sizes for select products that have size options
INSERT INTO product_sizes (product_id, label, price_modifier, stock, sort_order)
SELECT p.id, '36 inches (Standard)',  0,   20, 0 FROM products p WHERE p.slug = 'rajasthani-mirror-work-toran'
UNION ALL
SELECT p.id, '48 inches (Long)',      150, 15, 1 FROM products p WHERE p.slug = 'rajasthani-mirror-work-toran'
UNION ALL
SELECT p.id, '60 inches (Extra Long)', 300, 10, 2 FROM products p WHERE p.slug = 'rajasthani-mirror-work-toran'
UNION ALL
SELECT p.id, '36 inches (Standard)', 0,   12, 0 FROM products p WHERE p.slug = 'golden-thread-zari-toran'
UNION ALL
SELECT p.id, '48 inches (Long)',     200, 10, 1 FROM products p WHERE p.slug = 'golden-thread-zari-toran'
UNION ALL
SELECT p.id, '48 inches',  0,   10, 0 FROM products p WHERE p.slug = 'royal-kalira-bridal-toran'
UNION ALL
SELECT p.id, '60 inches',  500, 10, 1 FROM products p WHERE p.slug = 'royal-kalira-bridal-toran'
UNION ALL
SELECT p.id, 'Small (24 inches)',   0,   15, 0 FROM products p WHERE p.slug = 'bohemian-macrame-wall-hanging'
UNION ALL
SELECT p.id, 'Medium (36 inches)', 300, 10, 1 FROM products p WHERE p.slug = 'bohemian-macrame-wall-hanging'
UNION ALL
SELECT p.id, 'Large (48 inches)',  700,  5, 2 FROM products p WHERE p.slug = 'bohemian-macrame-wall-hanging';

-- ============================================================
-- 7. COUPONS
-- ============================================================
CREATE TABLE coupons (
  id              SERIAL PRIMARY KEY,
  code            VARCHAR(50) UNIQUE NOT NULL,
  type            VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value           DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(10,2) DEFAULT 0,
  max_discount    DECIMAL(10,2),
  usage_limit     INTEGER,
  used_count      INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  expires_at      TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_coupons_code   ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);

INSERT INTO coupons (code, type, value, min_order_value, max_discount, usage_limit, expires_at) VALUES
('WELCOME10',   'percentage', 10,  500,  500,  NULL, NOW() + INTERVAL '1 year'),
('FLAT200',     'fixed',      200, 999,  NULL, 200,  NOW() + INTERVAL '6 months'),
('DIWALI20',    'percentage', 20,  1000, 1000, 500,  NOW() + INTERVAL '60 days'),
('HASTKALA15',  'percentage', 15,  799,  750,  NULL, NOW() + INTERVAL '3 months'),
('WEDDING500',  'fixed',      500, 2999, NULL, 100,  NOW() + INTERVAL '6 months'),
('FIRST50',     'fixed',      50,  499,  NULL, NULL, NOW() + INTERVAL '1 year'),
('EXPIRED10',   'percentage', 10,  0,    NULL, NULL, NOW() - INTERVAL '1 day');

-- ============================================================
-- 8. ORDERS
-- ============================================================
CREATE TABLE orders (
  id                 SERIAL PRIMARY KEY,
  order_number       VARCHAR(50) UNIQUE NOT NULL,
  user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status             VARCHAR(50) DEFAULT 'pending'
                     CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  subtotal           DECIMAL(10,2) NOT NULL,
  discount           DECIMAL(10,2) DEFAULT 0,
  shipping_cost      DECIMAL(10,2) DEFAULT 0,
  total_amount       DECIMAL(10,2) NOT NULL,
  payment_method     VARCHAR(50),
  payment_status     VARCHAR(30) DEFAULT 'pending'
                     CHECK (payment_status IN ('pending','paid','failed','refunded')),
  payment_id         VARCHAR(255),
  shipping_address   JSONB,
  coupon_id          INTEGER REFERENCES coupons(id),
  shiprocket_order_id VARCHAR(100),
  shipment_id        VARCHAR(100),
  awb_code           VARCHAR(100),
  courier_name       VARCHAR(200),
  tracking_url       VARCHAR(500),
  notes              TEXT,
  created_at         TIMESTAMP DEFAULT NOW(),
  updated_at         TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user       ON orders(user_id);
CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_orders_number     ON orders(order_number);
CREATE INDEX idx_orders_shiprocket ON orders(shiprocket_order_id);
CREATE INDEX idx_orders_awb        ON orders(awb_code);

INSERT INTO orders (order_number, user_id, status, subtotal, discount, shipping_cost, total_amount, payment_method, payment_status, payment_id, shipping_address, created_at) VALUES
('HK-A1B2C-XY12', 2, 'delivered',  1598,  0,   0,   1598,  'razorpay', 'paid',    'pay_demo001', '{"name":"Priya Sharma","address":"12 MG Road","city":"Jaipur","state":"Rajasthan","pincode":"302001","phone":"9812345678"}', NOW() - INTERVAL '30 days'),
('HK-D3E4F-AB34', 2, 'delivered',   699,  0,  99,    798,  'upi',      'paid',    'pay_demo002', '{"name":"Priya Sharma","address":"12 MG Road","city":"Jaipur","state":"Rajasthan","pincode":"302001","phone":"9812345678"}', NOW() - INTERVAL '15 days'),
('HK-G5H6I-CD56', 3, 'shipped',    2499,  200,  0,  2299,  'razorpay', 'paid',    'pay_demo003', '{"name":"Meera Patel","address":"5 Patel Nagar","city":"Surat","state":"Gujarat","pincode":"395001","phone":"9823456789"}', NOW() - INTERVAL '5 days'),
('HK-J7K8L-EF78', 3, 'processing',  849,  0,   99,   948,  'cod',      'pending', NULL,          '{"name":"Meera Patel","address":"5 Patel Nagar","city":"Surat","state":"Gujarat","pincode":"395001","phone":"9823456789"}', NOW() - INTERVAL '2 days'),
('HK-M9N0O-GH90', 4, 'delivered',  4999,  500,  0,  4499,  'razorpay', 'paid',    'pay_demo005', '{"name":"Anjali Gupta","address":"8 Laxmi Nagar","city":"Pune","state":"Maharashtra","pincode":"411001","phone":"9834567890"}', NOW() - INTERVAL '45 days'),
('HK-P1Q2R-IJ12', 4, 'confirmed',  1299,  0,    0,  1299,  'upi',      'paid',    'pay_demo006', '{"name":"Anjali Gupta","address":"8 Laxmi Nagar","city":"Pune","state":"Maharashtra","pincode":"411001","phone":"9834567890"}', NOW() - INTERVAL '1 day'),
('HK-S3T4U-KL34', 5, 'cancelled',   599,  0,   99,   698,  'razorpay', 'refunded','pay_demo007', '{"name":"Sunita Verma","address":"3 Shivaji Marg","city":"Nagpur","state":"Maharashtra","pincode":"440001","phone":"9845678901"}', NOW() - INTERVAL '20 days'),
('HK-V5W6X-MN56', 6, 'delivered',  1999,  0,    0,  1999,  'razorpay', 'paid',    'pay_demo008', '{"name":"Kavita Singh","address":"22 Sector 15","city":"Chandigarh","state":"Punjab","pincode":"160015","phone":"9856789012"}', NOW() - INTERVAL '10 days'),
('HK-Y7Z8A-OP78', 7, 'pending',     749,  0,   99,   848,  'cod',      'pending', NULL,          '{"name":"Deepa Joshi","address":"7 Civil Lines","city":"Allahabad","state":"UP","pincode":"211001","phone":"9867890123"}',  NOW() - INTERVAL '1 hour'),
('HK-B9C0D-QR90', 9, 'delivered',  3499,  0,    0,  3499,  'razorpay', 'paid',    'pay_demo010', '{"name":"Pooja Yadav","address":"14 Residency Road","city":"Lucknow","state":"UP","pincode":"226001","phone":"9890123456"}', NOW() - INTERVAL '60 days');

-- ============================================================
-- 9. ORDER ITEMS
-- ============================================================
CREATE TABLE order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER REFERENCES products(id) ON DELETE SET NULL,
  variant_id  INTEGER,
  quantity    INTEGER NOT NULL DEFAULT 1,
  unit_price  DECIMAL(10,2) NOT NULL,
  size_label  VARCHAR(100),
  custom_text VARCHAR(500),
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order   ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

INSERT INTO order_items (order_id, product_id, quantity, unit_price, size_label)
SELECT o.id, p.id, 1, p.sale_price, '36 inches (Standard)'
FROM orders o, products p
WHERE o.order_number = 'HK-A1B2C-XY12' AND p.slug = 'rajasthani-mirror-work-toran';

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, p.sale_price
FROM orders o, products p
WHERE o.order_number = 'HK-A1B2C-XY12' AND p.slug = 'golden-thread-zari-toran';

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, p.base_price
FROM orders o, products p
WHERE o.order_number = 'HK-D3E4F-AB34' AND p.slug = 'mogra-flower-tassel-toran';

INSERT INTO order_items (order_id, product_id, quantity, unit_price, size_label)
SELECT o.id, p.id, 1, p.sale_price, '60 inches'
FROM orders o, products p
WHERE o.order_number = 'HK-G5H6I-CD56' AND p.slug = 'royal-kalira-bridal-toran';

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, p.sale_price
FROM orders o, products p
WHERE o.order_number = 'HK-G5H6I-CD56' AND p.slug = 'mehndi-night-yellow-toran';

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, p.base_price
FROM orders o, products p
WHERE o.order_number = 'HK-J7K8L-EF78' AND p.slug = 'navratri-garba-toran';

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, p.sale_price
FROM orders o, products p
WHERE o.order_number = 'HK-M9N0O-GH90' AND p.slug = 'grand-reception-toran';

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, p.sale_price
FROM orders o, products p
WHERE o.order_number = 'HK-P1Q2R-IJ12' AND p.slug = 'golden-thread-zari-toran';

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, p.base_price
FROM orders o, products p
WHERE o.order_number = 'HK-S3T4U-KL34' AND p.slug = 'mogra-flower-tassel-toran';

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, p.sale_price
FROM orders o, products p
WHERE o.order_number = 'HK-V5W6X-MN56' AND p.slug = 'artisan-home-decor-gift-box';

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, p.base_price
FROM orders o, products p
WHERE o.order_number = 'HK-Y7Z8A-OP78' AND p.slug = 'puja-thali-toran';

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, p.sale_price
FROM orders o, products p
WHERE o.order_number = 'HK-B9C0D-QR90' AND p.slug = 'pearl-beaded-mandap-toran';

-- ============================================================
-- 10. CART ITEMS
-- ============================================================
CREATE TABLE cart_items (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id  INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
  size_id     INTEGER REFERENCES product_sizes(id) ON DELETE SET NULL,
  quantity    INTEGER NOT NULL DEFAULT 1,
  custom_text VARCHAR(500),
  created_at  TIMESTAMP DEFAULT NOW(),
  CONSTRAINT cart_items_unique UNIQUE (user_id, product_id, variant_id, size_id)
);

CREATE INDEX idx_cart_user    ON cart_items(user_id);
CREATE INDEX idx_cart_product ON cart_items(product_id);

INSERT INTO cart_items (user_id, product_id, quantity)
SELECT u.id, p.id, 1
FROM users u, products p
WHERE u.email = 'priya@example.com' AND p.slug = 'peacock-embroidered-toran';

INSERT INTO cart_items (user_id, product_id, quantity)
SELECT u.id, p.id, 2
FROM users u, products p
WHERE u.email = 'priya@example.com' AND p.slug = 'mogra-flower-tassel-toran';

INSERT INTO cart_items (user_id, product_id, quantity)
SELECT u.id, p.id, 1
FROM users u, products p
WHERE u.email = 'meera@example.com' AND p.slug = 'festival-decor-hamper';

-- ============================================================
-- 11. WISHLIST
-- ============================================================
CREATE TABLE wishlists (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlists_user    ON wishlists(user_id);
CREATE INDEX idx_wishlists_product ON wishlists(product_id);

INSERT INTO wishlists (user_id, product_id)
SELECT u.id, p.id FROM users u, products p
WHERE u.email = 'priya@example.com'  AND p.slug = 'royal-kalira-bridal-toran'
UNION ALL
SELECT u.id, p.id FROM users u, products p
WHERE u.email = 'priya@example.com'  AND p.slug = 'gota-patti-festive-toran'
UNION ALL
SELECT u.id, p.id FROM users u, products p
WHERE u.email = 'meera@example.com'  AND p.slug = 'grand-reception-toran'
UNION ALL
SELECT u.id, p.id FROM users u, products p
WHERE u.email = 'anjali@example.com' AND p.slug = 'bohemian-macrame-wall-hanging'
UNION ALL
SELECT u.id, p.id FROM users u, products p
WHERE u.email = 'kavita@example.com' AND p.slug = 'artisan-home-decor-gift-box';

-- ============================================================
-- 12. REVIEWS
-- ============================================================
CREATE TABLE reviews (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id    INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       VARCHAR(150),
  comment     TEXT,
  is_approved BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

CREATE INDEX idx_reviews_product  ON reviews(product_id);
CREATE INDEX idx_reviews_user     ON reviews(user_id);
CREATE INDEX idx_reviews_approved ON reviews(product_id, is_approved);

INSERT INTO reviews (product_id, user_id, rating, title, comment, is_approved)
SELECT p.id, u.id, 5,
  'Absolutely stunning! Exactly as described',
  'I ordered the mirror work toran for Diwali and it looks absolutely gorgeous on our main door. The craftsmanship is incredible — the mirrors are firmly stitched and the colours are vibrant. Got so many compliments from guests. Will definitely order again!',
  true
FROM products p, users u WHERE p.slug = 'rajasthani-mirror-work-toran' AND u.email = 'priya@example.com';

INSERT INTO reviews (product_id, user_id, rating, title, comment, is_approved)
SELECT p.id, u.id, 5,
  'Perfect for our daughter''s wedding',
  'We ordered the Royal Kalira Bridal Toran for our daughter''s wedding. It arrived beautifully packaged and looked stunning at the entrance. The gold work is exquisite and it photographed beautifully. Everyone kept asking where we got it from!',
  true
FROM products p, users u WHERE p.slug = 'royal-kalira-bridal-toran' AND u.email = 'anjali@example.com';

INSERT INTO reviews (product_id, user_id, rating, title, comment, is_approved)
SELECT p.id, u.id, 4,
  'Great quality, fast delivery',
  'The Gota Patti toran is beautiful! The golden shimmer is exactly as shown. Only minor thing is it''s slightly smaller than I expected but for the price it''s excellent value. The packaging was also very nice.',
  true
FROM products p, users u WHERE p.slug = 'gota-patti-festive-toran' AND u.email = 'meera@example.com';

INSERT INTO reviews (product_id, user_id, rating, title, comment, is_approved)
SELECT p.id, u.id, 5,
  'Love the boho vibe',
  'The macrame wall hanging transformed my bedroom! It''s well-made, the knots are tight and the cotton is soft and natural-looking. Arrived quickly and well packed. Exactly what I was looking for.',
  true
FROM products p, users u WHERE p.slug = 'bohemian-macrame-wall-hanging' AND u.email = 'kavita@example.com';

INSERT INTO reviews (product_id, user_id, rating, title, comment, is_approved)
SELECT p.id, u.id, 5,
  'Amazing gift — loved by the couple',
  'Bought the Artisan Home Decor Gift Box as a housewarming gift. The presentation was beautiful and the quality of each item inside was excellent. The couple loved it! Will be my go-to for gifting from now on.',
  true
FROM products p, users u WHERE p.slug = 'artisan-home-decor-gift-box' AND u.email = 'kavita@example.com';

INSERT INTO reviews (product_id, user_id, rating, title, comment, is_approved)
SELECT p.id, u.id, 4,
  'Authentic Bandhani quality',
  'As a Gujarati, I know good Bandhani when I see it! This toran is genuinely authentic — the tie-dye circles are perfectly formed and the colours are vivid. Good length too. One star less only because I wish there were more colour options.',
  true
FROM products p, users u WHERE p.slug = 'bandhani-fabric-toran' AND u.email = 'meera@example.com';

INSERT INTO reviews (product_id, user_id, rating, title, comment, is_approved)
SELECT p.id, u.id, 5,
  'The sound of the bells is so calming',
  'Bought the Brass Bell Toran for our pooja room door. Every time the door opens the gentle chime of the bells is so calming and auspicious. High quality bells, strong thread. Very happy with this purchase.',
  true
FROM products p, users u WHERE p.slug = 'antique-brass-bell-toran' AND u.email = 'deepa@example.com';

INSERT INTO reviews (product_id, user_id, rating, title, comment, is_approved)
SELECT p.id, u.id, 5,
  'Warli art is spectacular',
  'The Warli Art Canvas Wall Hanging is a conversation piece. Every guest who comes home asks about it. The artist''s signature is at the bottom which makes it feel even more special. Genuine Warli art with authentic motifs.',
  true
FROM products p, users u WHERE p.slug = 'warli-art-canvas-wall-hanging' AND u.email = 'pooja@example.com';

-- ============================================================
-- 13. COUPON USAGES
-- ============================================================
CREATE TABLE coupon_usages (
  id        SERIAL PRIMARY KEY,
  coupon_id INTEGER NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id  INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  used_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE(coupon_id, user_id)
);

-- ============================================================
-- 14. RETURN REQUESTS
-- ============================================================
CREATE TABLE return_requests (
  id                  SERIAL PRIMARY KEY,
  return_number       VARCHAR(50) UNIQUE NOT NULL,
  order_id            INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                VARCHAR(20) NOT NULL DEFAULT 'return'
                      CHECK (type IN ('return', 'exchange')),
  status              VARCHAR(30) NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','approved','rejected','picked_up','received','refunded','exchanged')),
  reason              VARCHAR(100) NOT NULL,
  description         TEXT,
  refund_amount       DECIMAL(10,2),
  refund_method       VARCHAR(50),
  refund_status       VARCHAR(30) DEFAULT 'pending'
                      CHECK (refund_status IN ('pending','processing','completed')),
  admin_notes         TEXT,
  rejection_reason    TEXT,
  shiprocket_return_id VARCHAR(100),
  return_shipment_id  VARCHAR(100),
  return_awb          VARCHAR(100),
  pickup_scheduled_at TIMESTAMP,
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_returns_order  ON return_requests(order_id);
CREATE INDEX idx_returns_user   ON return_requests(user_id);
CREATE INDEX idx_returns_status ON return_requests(status);

CREATE TABLE return_items (
  id            SERIAL PRIMARY KEY,
  return_id     INTEGER NOT NULL REFERENCES return_requests(id) ON DELETE CASCADE,
  order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  quantity      INTEGER NOT NULL DEFAULT 1,
  reason        TEXT
);

INSERT INTO return_requests (return_number, order_id, user_id, type, status, reason, description, refund_amount, refund_method, refund_status)
SELECT 'RET-001', o.id, u.id, 'return', 'refunded',
  'Product damaged in transit',
  'The toran arrived with a broken thread and some mirrors were missing. Raising a return request.',
  698, 'original_payment', 'completed'
FROM orders o, users u
WHERE o.order_number = 'HK-S3T4U-KL34' AND u.email = 'sunita@example.com';

-- ============================================================
-- SEQUENCES RESET (ensures SERIAL works after bulk inserts)
-- ============================================================
SELECT setval('users_id_seq',            (SELECT MAX(id) FROM users));
SELECT setval('categories_id_seq',       (SELECT MAX(id) FROM categories));
SELECT setval('products_id_seq',         (SELECT MAX(id) FROM products));
SELECT setval('product_images_id_seq',   (SELECT MAX(id) FROM product_images));
SELECT setval('product_variants_id_seq', (SELECT MAX(id) FROM product_variants));
SELECT setval('product_sizes_id_seq',    (SELECT MAX(id) FROM product_sizes));
SELECT setval('coupons_id_seq',          (SELECT MAX(id) FROM coupons));
SELECT setval('orders_id_seq',           (SELECT MAX(id) FROM orders));
SELECT setval('order_items_id_seq',      (SELECT MAX(id) FROM order_items));
SELECT setval('cart_items_id_seq',       (SELECT MAX(id) FROM cart_items));
SELECT setval('wishlists_id_seq',        (SELECT MAX(id) FROM wishlists));
SELECT setval('reviews_id_seq',          (SELECT MAX(id) FROM reviews));
SELECT setval('return_requests_id_seq',  (SELECT MAX(id) FROM return_requests));

-- ============================================================
-- QUICK SANITY CHECK
-- ============================================================
SELECT 'users'            AS tbl, COUNT(*) FROM users
UNION ALL SELECT 'categories',  COUNT(*) FROM categories
UNION ALL SELECT 'products',    COUNT(*) FROM products
UNION ALL SELECT 'images',      COUNT(*) FROM product_images
UNION ALL SELECT 'variants',    COUNT(*) FROM product_variants
UNION ALL SELECT 'sizes',       COUNT(*) FROM product_sizes
UNION ALL SELECT 'coupons',     COUNT(*) FROM coupons
UNION ALL SELECT 'orders',      COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'cart_items',  COUNT(*) FROM cart_items
UNION ALL SELECT 'wishlists',   COUNT(*) FROM wishlists
UNION ALL SELECT 'reviews',     COUNT(*) FROM reviews
UNION ALL SELECT 'returns',     COUNT(*) FROM return_requests;
