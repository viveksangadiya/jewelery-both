const { S3Client, PutObjectCommand, DeleteObjectCommand, GetBucketLocationCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { randomUUID } = require('crypto');
const path = require('path');

const BUCKET = process.env.AWS_S3_BUCKET;

let s3Client = null;

async function getS3Client() {
  if (s3Client) return s3Client;

  const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };

  let region = process.env.AWS_REGION;

  if (!region) {
    try {
      const discovery = new S3Client({ region: 'us-east-1', credentials });
      const res = await discovery.send(new GetBucketLocationCommand({ Bucket: BUCKET }));
      region = res.LocationConstraint || 'us-east-1';
      process.env.AWS_REGION = region;
      console.log(`✅ S3 bucket region detected: ${region}`);
    } catch (err) {
      console.warn('⚠️  Could not detect S3 region, using us-east-1:', err.message);
      region = 'us-east-1';
    }
  }

  s3Client = new S3Client({ region, credentials });
  return s3Client;
}

const mimeMap = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif',
};

// ── Sanitize filename ─────────────────────────────────────
// Removes spaces, special chars — S3 keys with spaces cause presigned URL issues
function sanitizeFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  // strip everything except alphanumeric, dash, underscore
  const base = path.basename(originalName, ext)
    .replace(/\s+/g, '_')           // spaces → underscores
    .replace(/[^a-zA-Z0-9_\-]/g, '') // remove all other special chars
    .slice(0, 50);                    // cap length
  return `${base || 'image'}${ext}`;
}

function buildPublicUrl(key) {
  const region = process.env.AWS_REGION || 'us-east-1';
  return process.env.AWS_CDN_URL
    ? `${process.env.AWS_CDN_URL}/${key}`
    : `https://${BUCKET}.s3.${region}.amazonaws.com/${key}`;
}

async function uploadToS3(fileBuffer, originalName, folder = 'products') {
  const client = await getS3Client();
  const safe = sanitizeFilename(originalName);
  const ext = path.extname(safe).toLowerCase() || '.jpg';
  const key = `${folder}/${randomUUID()}${ext}`;
  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeMap[ext] || 'image/jpeg',
  }));
  return { url: buildPublicUrl(key), key };
}

async function deleteFromS3(keyOrUrl) {
  const client = await getS3Client();
  let key = keyOrUrl;
  if (keyOrUrl.startsWith('http')) key = new URL(keyOrUrl).pathname.replace(/^\//, '');
  try {
    await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch (err) {
    console.error('S3 delete failed:', err.message);
  }
}

async function getPresignedUploadUrl(originalName, folder = 'products') {
  const client = await getS3Client();
  const safe = sanitizeFilename(originalName);
  const ext = path.extname(safe).toLowerCase() || '.jpg';
  const key = `${folder}/${randomUUID()}${ext}`;
  const contentType = mimeMap[ext] || 'image/jpeg';

  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 300 }
  );

  return { uploadUrl, publicUrl: buildPublicUrl(key), key, contentType };
}

module.exports = { uploadToS3, deleteFromS3, getPresignedUploadUrl };
