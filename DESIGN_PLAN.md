# Swarovski Design Implementation Plan
## Gap Analysis & Phased Roadmap

---

## Current System Overview

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| State | Zustand with persistence |
| Backend | Node.js + Express + PostgreSQL |
| Payments | Razorpay + Cash on Delivery |
| Shipping | Shiprocket API |
| Storage | AWS S3 |
| Auth | JWT + Google OAuth |

**What to keep:** All backend APIs, database schema, auth, payment, shipping integrations, admin panel — only the UI layer changes.

---

## What's Already Built (Keep & Restyle)

- Authentication (email + Google OAuth)
- Product listing with filters
- Product detail pages
- Cart (Zustand-driven drawer)
- Wishlist (toggle + sync)
- Checkout with Razorpay and COD
- Order management
- Product reviews
- Returns and exchanges
- Admin panel (products, orders, categories, coupons, customers)
- Pincode serviceability check

---

## Gap Analysis by Page

---

### PHASE 1 — Design System & Global Layout

| Item | Current State | Target (Swarovski) | Status |
|------|-------------|-------------------|--------|
| Background color | White `#ffffff` | Warm beige `#F5F0EB` | ❌ Missing |
| Primary text | Black `#1c1c1c` | Black `#000000` | ⚠️ Update |
| Accent/sale color | Red `#e32c2b` | None (remove) | ❌ Remove |
| Heading font | Helvetica Neue (sans-serif) | Serif (Playfair Display or similar) | ❌ Missing |
| Body font | Helvetica Neue | Clean sans-serif (keep) | ✅ Keep |
| Navbar layout | Logo left-aligned, nav links inline | Centered logo, hamburger left, icons right | ❌ Rebuild |
| Top info bar | Single announcement bar | Two-tier (stores/shipping/club + announcement) | ❌ Rebuild |
| Hamburger menu | Basic dropdown | Full-screen flyout with 3-level columns + image | ❌ New |
| Search panel | Basic overlay | Full-screen with Recommendations + Bestsellers grid | ❌ Rebuild |
| Footer | Dark multi-column | Dark columns + black brand bar at very bottom | ⚠️ Update |
| Button style | Rounded with red/black | Sharp corners, solid black, full-width | ⚠️ Update |
| Border radius | Slight rounding | Zero (sharp corners throughout) | ⚠️ Update |

**Tasks:**
- [ ] Update `tailwind.config.js` — beige palette, remove red tokens, add serif font family
- [ ] Install Playfair Display via Google Fonts (`next/font`)
- [ ] Rebuild `Navbar.tsx` — centered logo, two-tier top bar, hamburger + icons
- [ ] Build `MegaMenu.tsx` — full-screen flyout with 3-column category navigation + image
- [ ] Rebuild `SearchPanel.tsx` — recommendations list + bestsellers product grid
- [ ] Update `Footer.tsx` — add bottom black brand bar with logo
- [ ] Update `globals.css` — beige bg, sharp corners, button styles

---

### PHASE 2 — Homepage

| Section | Current | Target | Status |
|---------|---------|--------|--------|
| Hero banner | Basic hero exists | Campaign-style full-width + overlay CTA | ⚠️ Redesign |
| Brand story section | Not present | "Masters of Light Since 1895" centered text block | ❌ New |
| Category grid row 1 | Basic category cards | 4+4 two-row grid with large lifestyle images | ⚠️ Redesign |
| Named product carousels | "Featured products" generic | "Embrace the Fantasy" collection-themed carousels | ⚠️ Redesign |
| Mid-page gift banner | Not present | Full-width promotional editorial banner | ❌ New |
| Category grid row 2 | Not present | Second 4-item grid (Jewelry / Watches / Decorations / Accessories) | ❌ New |
| Editorial cards | Not present | "World of [Brand]" — 3 cards with image + title + Discover more | ❌ New |
| Services strip | Not present | 4-icon bar (Live Chat / Book Appointment / Customer Service / Gift Services) | ❌ New |
| Newsletter/Club CTA | Not present | Beige signup section with club membership CTA | ❌ New |

**Tasks:**
- [ ] Rebuild homepage hero with full-width campaign banner + text overlay
- [ ] Add brand story section (centered serif heading + paragraph)
- [ ] Rebuild category grid — 2 rows of 4, lifestyle-style images, label overlays
- [ ] Build named collection carousels with prev/next arrows
- [ ] Add mid-page editorial gift banner
- [ ] Add second category grid (4 categories)
- [ ] Build "World of Brand" editorial 3-card section
- [ ] Build services strip with 4 icons
- [ ] Build newsletter/club signup section

---

### PHASE 3 — Product Listing Page (PLP)

| Item | Current | Target | Status |
|------|---------|--------|--------|
| Filter layout | Sidebar accordion | Horizontal top filter bar with dropdown pills | ❌ Rebuild |
| Result count | Not shown | "X Results" shown in filter bar | ❌ New |
| Sort dropdown | In sidebar | Inline in filter bar (top right) | ⚠️ Move |
| Grid columns | 3 columns desktop | 4 columns desktop, 2 mobile | ⚠️ Update |
| Product card | Name + price, red discount badge | Name + descriptor line + price, "X Colors" badge | ⚠️ Update |
| Inline promo banners | Not present | Collection/editorial cards inserted mid-grid | ❌ New |
| Pagination | Page-based | Load more button / infinite scroll | ⚠️ Update |
| Filter chips | Not present | Active filter chips with × remove | ❌ New |

**Tasks:**
- [ ] Build `FilterBar.tsx` — horizontal pill dropdowns (category, price, material, color, sort)
- [ ] Add result count display
- [ ] Update grid to 4 columns (`grid-cols-4`) with responsive breakpoints
- [ ] Update `ProductCard.tsx` — add "X Colors" badge, descriptor subtitle, remove red badge
- [ ] Add inline `PromoBanner` card every N products in the grid
- [ ] Replace pagination with "Load More" button

---

### PHASE 4 — Product Detail Page (PDP)

| Item | Current | Target | Status |
|------|---------|--------|--------|
| Image gallery layout | Basic image list | Large primary + 4-thumbnail grid, 360° badge | ⚠️ Redesign |
| Color variant selector | Text dropdown | Circular color swatch buttons | ❌ New |
| Delivery options | Pincode checker only | "Delivery to address" + "Click & Collect" radio buttons | ⚠️ Update |
| Accordion sections | None | Description / Shipping & returns / Care & maintenance / Gift-giving / Book appointment | ❌ New |
| Article details | Not shown | Article no., collection, dimensions in description | ❌ New |
| "Complete the Look" | Not present | Horizontal product carousel | ❌ New |
| "You May Also Like" | Basic similar products | Styled carousel with arrows | ⚠️ Redesign |
| Shop by Category strip | Not present | 4-category strip at bottom | ❌ New |
| Recently Viewed | Not present | Recently viewed products row | ❌ New |

**Tasks:**
- [ ] Redesign image gallery — large primary + thumbnail strip, 360° label
- [ ] Build color swatch selector component (circular, with tooltip)
- [ ] Add delivery option radio buttons (delivery to address / click & collect)
- [ ] Build accordion component for product info sections
- [ ] Add article number, collection, material, dimensions to description accordion
- [ ] Build "Complete the Look" horizontal carousel
- [ ] Rebuild "You May Also Like" as styled carousel with arrows
- [ ] Add recently viewed products (store in localStorage)

---

### PHASE 5 — Cart Page

| Item | Current | Target | Status |
|------|---------|--------|--------|
| Cart format | Side drawer (`CartDrawer.tsx`) | Full `/cart` page, left/right layout | ❌ Rebuild |
| Cart item | Image + name + quantity + remove | + heart/wishlist icon, round quantity stepper | ⚠️ Update |
| Gift packaging | Not present | Checkbox + fee (₹290) | ❌ New |
| Gift note | Not present | Checkbox + free text field (free) | ❌ New |
| Gift receipt | Not present | Checkbox for digital gift receipt | ❌ New |
| Order summary | In drawer | Right sidebar card (subtotal / shipping / total) | ⚠️ Move |
| Promo code | Only at checkout | In cart page with Apply button | ❌ Move here |
| Payment logos | Not shown | Accepted payment methods shown in summary | ❌ New |
| "You May Also Like" | Not present | Product carousel below cart items | ❌ New |

**Tasks:**
- [ ] Create `/cart` page with two-column layout (items left, summary right)
- [ ] Move cart state from drawer to page route (keep `CartDrawer` for quick view)
- [ ] Add gift packaging section with checkbox + price
- [ ] Add gift note section with checkbox + textarea
- [ ] Add gift receipt checkbox with legal text
- [ ] Move promo code input from checkout to cart page
- [ ] Add payment method logos row in order summary
- [ ] Add "You May Also Like" product carousel below cart

---

### PHASE 6 — Checkout Flow

| Item | Current | Target | Status |
|------|---------|--------|--------|
| Step indicator | Basic text | Numbered circles with connecting lines (Login → Shipment → Payment → Review) | ❌ Rebuild |
| Checkout layout | Full-width form | Two-column (form left, bag summary right) throughout | ⚠️ Update |
| Delivery options | None | Standard / Express / Click & Collect with prices + date ranges | ❌ New |
| OTP consent | Not present | Carrier OTP consent checkbox | ❌ New |
| Address form salutation | Not present | Mrs/Ms — Mr. radio buttons | ❌ New |
| Payment step | Razorpay redirect | UPI / Card Payments / Gift Card selection with logos | ⚠️ Redesign |
| Billing address | Not present | "Same as shipping" checkbox + display | ❌ New |
| Review step | Not present | Full order summary (email, delivery, shipping, billing, payment, items) + T&C checkbox | ❌ New |
| Final CTA | "Place Order" | "Buy Now" button | ⚠️ Rename |
| Right sidebar | Not present | Sticky bag summary (item thumbnail, name, qty, subtotal, shipping, total) | ❌ New |

**Tasks:**
- [ ] Build `CheckoutStepper.tsx` — 4-step progress indicator with checkmarks
- [ ] Add right-side sticky bag summary to all checkout steps
- [ ] Build delivery options step with Standard/Express/Click & Collect
- [ ] Add OTP consent checkbox
- [ ] Add salutation radio (Mrs/Ms / Mr.) to address form
- [ ] Redesign payment step — UPI / Card / Gift Card radio selection
- [ ] Add billing address section (same as shipping toggle)
- [ ] Build Review step page — all details listed with Edit links + T&C checkbox
- [ ] Rename final CTA to "Buy Now"

---

### PHASE 7 — My Account

| Item | Current | Target | Status |
|------|---------|--------|--------|
| Account layout | Basic list/form | Profile banner image + 2-column section card grid | ❌ Rebuild |
| Profile incomplete banner | Not present | Dismissible progress banner with "Complete Profile" CTA | ❌ New |
| Club membership card | Not present | Branded club card with Bronze/Silver/Gold tier + "View status" | ❌ New |
| Account nav tabs | Not present | Horizontal tab bar (Overview, Account Details, Preferences, Club, Crystal Society, Wishlist, Appointments) | ❌ New |
| Account Details | Basic profile form | Personal info card + QR code card + Address cards + Credit Card + Login/Password | ❌ Rebuild |
| QR code | Not present | Personal QR code (member ID) with Apple/Google Wallet buttons | ❌ New |
| Preferences page | Not present | Communication Preference Center (channels + marketing + interests) | ❌ New |
| Wishlist page | Drawer only | Standalone `/account/wishlist` full page | ❌ New |
| Order History page | Basic list | Tabs (Online orders / In-Store orders), empty state, "Continue Shopping" | ⚠️ Redesign |
| Crystal Society | Not present | Membership section with join CTA | ❌ New |
| Appointments | Not present | `/account/appointments` page | ❌ New |
| Profile complete modal | Not present | Multi-step modal (salutation + name + phone + DOB → next step) | ❌ New |
| Account section cards | Not present | 8-card grid linking to each sub-section | ❌ New |

**Tasks:**
- [ ] Rebuild `/account` overview page — profile banner + 8-card grid
- [ ] Add dismissible "Profile Incomplete" banner with progress bar
- [ ] Build club membership card (tier display, view status link)
- [ ] Build `AccountTabs.tsx` horizontal navigation
- [ ] Rebuild `/account/profile` — 3-column card layout (personal info, QR code, address, credit card, login)
- [ ] Build QR code display card with member ID
- [ ] Create `/account/preferences` — communication preference center + interests checkboxes
- [ ] Create standalone `/account/wishlist` page
- [ ] Rebuild `/account/orders` — online/in-store tabs, empty state with "Continue Shopping"
- [ ] Build profile completion multi-step modal
- [ ] Create `/account/appointments` placeholder page

---

### PHASE 8 — Additional Pages

| Page | Current | Target | Status |
|------|---------|--------|--------|
| Track Order | `/track-order` exists | Centered form + "Check other sections" link grid | ⚠️ Redesign |
| Contact | `/contact` exists | Needs beige styling update | ⚠️ Restyle |
| Shipping policy | `/shipping` exists | Needs beige styling update | ⚠️ Restyle |
| Size guide | `/size-guide` exists | Needs beige styling update | ⚠️ Restyle |
| Returns | `/returns` exists | Needs beige styling update | ⚠️ Restyle |

**Tasks:**
- [ ] Redesign Track Order page — centered form layout + "Check other sections" + "Not yet solved?" CTA
- [ ] Restyle Contact, Shipping, Size Guide, Returns pages to beige design system

---

## Complete Task Checklist

### Phase 1 — Design System
- [ ] Update `tailwind.config.js` with beige palette + serif font + remove red tokens
- [ ] Install Playfair Display via `next/font/google`
- [ ] Rebuild `Navbar.tsx` — centered logo, two-tier top bar, hamburger + search + bag + wishlist icons
- [ ] Build `MegaMenu.tsx` — full-screen overlay, 3-column layout, category image
- [ ] Rebuild `SearchPanel.tsx` — recommendation keywords + bestseller product grid
- [ ] Update `Footer.tsx` — add solid black brand bar with centered logo at bottom
- [ ] Update `globals.css` — beige background, zero border-radius, updated button styles
- [ ] Update `AnnouncementBar.tsx` — two-tier layout

### Phase 2 — Homepage
- [ ] Campaign-style hero banner with text overlay
- [ ] Brand story text section
- [ ] Two-row category grid (8 items)
- [ ] Named collection carousels (2–3 themed carousels)
- [ ] Mid-page gift editorial banner
- [ ] Second 4-item category grid
- [ ] "World of Brand" editorial 3-card section
- [ ] Services strip (4 icons)
- [ ] Newsletter / Club signup section

### Phase 3 — PLP
- [ ] `FilterBar.tsx` — horizontal pills + sort
- [ ] Result count display
- [ ] 4-column product grid
- [ ] Update `ProductCard.tsx` — color badge + descriptor
- [ ] Inline promo card every N rows
- [ ] Load More button

### Phase 4 — PDP
- [ ] Redesign image gallery layout
- [ ] Color swatch selector
- [ ] Delivery option radios
- [ ] Accordion info sections
- [ ] "Complete the Look" carousel
- [ ] "You May Also Like" carousel
- [ ] Recently Viewed row

### Phase 5 — Cart
- [ ] Full `/cart` page
- [ ] Gift packaging checkbox + fee
- [ ] Gift note checkbox + textarea
- [ ] Gift receipt checkbox
- [ ] Promo code input
- [ ] Payment logos
- [ ] "You May Also Like" carousel

### Phase 6 — Checkout
- [ ] `CheckoutStepper.tsx` component
- [ ] Sticky bag summary sidebar
- [ ] Delivery options step (Standard / Express / Click & Collect)
- [ ] OTP consent checkbox
- [ ] Salutation radio in address form
- [ ] Payment step redesign (UPI / Card / Gift Card)
- [ ] Billing address with same-as-shipping toggle
- [ ] Review step
- [ ] "Buy Now" CTA

### Phase 7 — My Account
- [ ] Overview page with 8-card grid
- [ ] Profile incomplete banner
- [ ] Club membership card
- [ ] `AccountTabs.tsx`
- [ ] Account Details page (personal info + QR + address + payment + login)
- [ ] QR code display
- [ ] Preferences page
- [ ] Standalone Wishlist page
- [ ] Order History page (tabs)
- [ ] Profile completion modal
- [ ] Appointments placeholder

### Phase 8 — Other Pages
- [ ] Track Order redesign
- [ ] Restyle Contact, Shipping, Size Guide, Returns

---

## Color Reference

| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#F5F0EB` | Page background, section fills |
| `black` | `#000000` | Text, CTAs, nav |
| `white` | `#FFFFFF` | Cards, product images bg |
| `border` | `#E0D9D0` | Card borders, dividers |
| `text-secondary` | `#6B6B6B` | Descriptor text, labels |
| `text-muted` | `#999999` | Meta text, small captions |

---

## Typography Reference

| Element | Font | Weight | Style |
|---------|------|--------|-------|
| H1, H2 headings | Playfair Display | 400 | Serif |
| H3, H4 subheadings | Playfair Display | 400 | Serif |
| Body text | Helvetica Neue / Arial | 400 | Sans-serif |
| Button labels | Helvetica Neue | 500 | Uppercase, 0.1em tracking |
| Product names | Helvetica Neue | 400 | Sans-serif |
| Prices | Helvetica Neue | 400 | Sans-serif |
| Nav links | Helvetica Neue | 400 | Sans-serif |

---

## Effort Summary

| Phase | Pages / Components | Estimated Tasks |
|-------|--------------------|----------------|
| 1 — Design System | 5 global components | 8 |
| 2 — Homepage | 1 page, 9 sections | 9 |
| 3 — PLP | 1 page, 4 components | 6 |
| 4 — PDP | 1 page, 7 components | 7 |
| 5 — Cart | 1 page, 5 features | 7 |
| 6 — Checkout | 4 steps rebuilt | 9 |
| 7 — My Account | 8 sub-pages | 11 |
| 8 — Other Pages | 5 pages restyled | 5 |
| **Total** | | **~62 tasks** |

---

## Recommended Start Order

```
Phase 1 (Design System) → Phase 2 (Homepage) → Phase 3 (PLP)
→ Phase 4 (PDP) → Phase 5 (Cart) → Phase 6 (Checkout)
→ Phase 7 (Account) → Phase 8 (Other pages)
```

> Start with Phase 1 — every other phase depends on the color palette, typography, and navbar being correct first.
