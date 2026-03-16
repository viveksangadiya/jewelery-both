# Lumière Jewelry Store

Full-stack jewelry e-commerce built with Node.js + Next.js 14.

## Stack
- **Backend**: Node.js, Express, PostgreSQL
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Zustand
- **Storage**: AWS S3
- **Payments**: Razorpay + COD
- **Shipping**: Shiprocket
- **Auth**: JWT + Google OAuth

## Setup

### 1. Database migrations (run in order)
```bash
psql your_db < backend/src/config/schema.sql
psql your_db < backend/src/config/shiprocket_migration.sql
psql your_db < backend/src/config/features_migration.sql
psql your_db < backend/src/config/wishlist_migration.sql
psql your_db < backend/src/config/reviews_migration.sql
psql your_db < backend/src/config/returns_migration.sql
psql your_db < backend/src/config/seed_products.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Fill in .env values
npm install
npm run dev
```

### 3. Frontend
```bash
cd frontend
cp .env.local.example .env.local
# Fill in .env.local values
npm install
npm run dev
```

## Routes registered in index.js
- /api/auth
- /api/products
- /api/categories
- /api/cart
- /api/orders
- /api/payment
- /api/wishlist
- /api/shiprocket
- /api/reviews
- /api/returns
