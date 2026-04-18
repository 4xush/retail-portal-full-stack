You are a senior full-stack engineer building a KFC-style retail food e-commerce portal for a local local only.
The entire app runs locally. Target: single `npm run dev` from project root starts everything.
Stack is fully TypeScript — no plain JS files.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECH STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend:
  - React 18 + Vite
  - TailwindCSS (utility-first, no component library)
  - React Router v6 (SPA, no full-page reloads)
  - Zustand (client state: auth, cart)
  - React Query v5 / TanStack Query (server state, caching, infinite scroll)
  - React Hook Form + Zod (all forms)
  - Framer Motion (skeleton pulse, page transitions, slide-over cart drawer, badge bounce)
  - Axios (with interceptor for silent JWT refresh)

Backend:
  - Node.js 20 + Express 5 + TypeScript (tsx for dev, tsc for build)
  - Mongoose 8
  - jsonwebtoken + bcryptjs
  - Multer (image uploads, stored in /server/uploads/)
  - express-validator
  - Morgan + Helmet + CORS
  - dotenv + tsx (replaces nodemon for TS)
  - concurrently (runs client + server together from root)

Database:
  - Standard local MongoDB (MongoDB Compass compatible, port 27017)
  - Database name: "retailportal"
  - MongoDB native $text indexes for search (no Atlas CLI required)
  - Default local port: 27017

Search:
  - MongoDB $text index on products (title, description, tags)
  - Regex-based autocomplete for suggestion dropdown (fast prefix match)
  - All search via Mongoose aggregation pipeline (no Fuse.js, no client-side search)

Dev Tools:
  - Postman collection (exported as JSON in /postman/)
  - Seed script at /server/src/scripts/seed.ts
  - Text index creation handled automatically on server startup via Mongoose schema index

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOCAL SETUP (include in README)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Prerequisites:
  - Node.js 20+
  - MongoDB running locally (via MongoDB Compass or mongod service) on port 27017
  - npm

Steps:
  1. Clone the repo
  2. cp .env.example .env  (fill in secrets)
  3. npm run install:all
  4. npm run seed          (seeds DB with categories, products, users, discount codes)
  5. npm run dev           (starts client on :5173 and server on :5000 concurrently)

MONGODB_URI in .env:
  MONGODB_URI=mongodb://localhost:27017/retailportal

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJECT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosInstance.ts       ← base axios + interceptors
│   │   │   ├── auth.api.ts
│   │   │   ├── products.api.ts
│   │   │   ├── categories.api.ts
│   │   │   ├── orders.api.ts
│   │   │   └── admin.api.ts
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Skeleton.tsx       ← reusable pulse skeleton
│   │   │   │   ├── Breadcrumb.tsx
│   │   │   │   ├── Pagination.tsx
│   │   │   │   ├── LoadMore.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   └── Spinner.tsx
│   │   │   ├── search/
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   ├── SearchSuggestions.tsx  ← dropdown with category chips
│   │   │   │   └── SearchResults.tsx
│   │   │   ├── product/
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProductCardSkeleton.tsx
│   │   │   │   ├── ProductDetail.tsx      ← modal-based detail view
│   │   │   │   ├── ProductGrid.tsx
│   │   │   │   ├── AddOnModal.tsx         ← "choice to add on"
│   │   │   │   └── ComboCard.tsx
│   │   │   ├── category/
│   │   │   │   ├── CategoryTabBar.tsx     ← horizontal scroll tabs
│   │   │   │   ├── CategorySection.tsx
│   │   │   │   └── CategoryChip.tsx
│   │   │   ├── cart/
│   │   │   │   ├── CartDrawer.tsx         ← slide-over from right
│   │   │   │   ├── CartItem.tsx
│   │   │   │   └── CartIcon.tsx           ← floating header icon + badge
│   │   │   ├── order/
│   │   │   │   ├── OrderCard.tsx
│   │   │   │   └── ReorderButton.tsx
│   │   │   └── admin/
│   │   │       ├── StockUpdateForm.tsx
│   │   │       ├── StockHistoryTable.tsx
│   │   │       ├── ImageUploadZone.tsx    ← drag-and-drop
│   │   │       ├── ProductForm.tsx
│   │   │       └── CategoryForm.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useCart.ts
│   │   │   ├── useSearch.ts              ← debounced search calls
│   │   │   ├── useInfiniteProducts.ts    ← React Query infinite scroll
│   │   │   └── usePagination.ts
│   │   ├── layouts/
│   │   │   ├── PublicLayout.tsx          ← header + breadcrumb + footer
│   │   │   ├── AdminLayout.tsx           ← sidebar + topbar
│   │   │   └── UserLayout.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── OrderHistory.tsx
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Products.tsx
│   │   │   │   ├── Categories.tsx
│   │   │   │   ├── StockUpdate.tsx
│   │   │   │   └── Users.tsx
│   │   │   └── NotFound.tsx
│   │   ├── store/
│   │   │   ├── authStore.ts              ← Zustand: user, token, role
│   │   │   └── cartStore.ts              ← Zustand: items, persist to localStorage
│   │   ├── router/
│   │   │   ├── AppRouter.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── types/
│   │   │   └── index.ts                  ← shared TS interfaces (User, Product, Category, Order…)
│   │   └── utils/
│   │       ├── formatCurrency.ts
│   │       ├── calcTaxedPrice.ts         ← cost + (cost * taxPercent / 100)
│   │       └── debounce.ts
│   ├── index.html
│   ├── tsconfig.json
│   └── vite.config.ts                    ← proxy /api → localhost:5000
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                     ← mongoose connect
│   │   ├── middleware/
│   │   │   ├── auth.ts                   ← verifyJWT + verifyApiKey
│   │   │   ├── rbac.ts                   ← requireRole('admin')
│   │   │   ├── errorHandler.ts           ← global error middleware
│   │   │   ├── notFound.ts
│   │   │   └── upload.ts                 ← Multer config
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Product.ts
│   │   │   ├── Category.ts
│   │   │   ├── Order.ts
│   │   │   ├── StockHistory.ts
│   │   │   └── DiscountCode.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── productRoutes.ts
│   │   │   ├── categoryRoutes.ts
│   │   │   ├── orderRoutes.ts
│   │   │   ├── searchRoutes.ts
│   │   │   └── adminRoutes.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── product.controller.ts
│   │   │   ├── category.controller.ts
│   │   │   ├── order.controller.ts
│   │   │   ├── search.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── validators/
│   │   │   ├── auth.validators.ts
│   │   │   ├── product.validators.ts
│   │   │   └── order.validators.ts
│   │   ├── scripts/
│   │   │   └── seed.ts                   ← seeds categories, products, admin user
│   │   ├── uploads/                      ← Multer stores images here
│   │   └── index.ts
│   └── tsconfig.json
│
├── postman/
│   └── RetailPortal.postman_collection.json
├── .env.example
├── package.json                          ← root: concurrently client + server
└── README.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MONGOOSE MODELS (implement exactly)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// User.ts
{
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  passwordHash:  { type: String, required: true },
  role:          { type: String, enum: ['admin', 'user'], default: 'user' },
  apiKey:        { type: String, unique: true },   // crypto.randomUUID() on signup
  refreshToken:  { type: String },                 // single token (no multi-device)
  isActive:      { type: Boolean, default: true },
  createdAt:     { type: Date, default: Date.now }
}

// Category.ts
{
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, unique: true },     // auto-generated from name
  logo:        { type: String },                   // URL or local path
  description: { type: String },
  isActive:    { type: Boolean, default: true },
  createdAt:   { type: Date, default: Date.now }
}

// Product.ts
{
  title:       { type: String, required: true, trim: true },
  description: { type: String },
  images:      [{ type: String }],                 // array of file paths/URLs
  cost:        { type: Number, required: true, min: 0 },
  taxPercent:  { type: Number, default: 0, min: 0, max: 100 },
  category:    { type: ObjectId, ref: 'Category', required: true },
  stock:       { type: Number, default: 0, min: 0 },
  isActive:    { type: Boolean, default: true },
  tags:        [{ type: String }],                 // for search boosting
  combos:      [{ type: ObjectId, ref: 'Product' }],
  addOns:      [{ type: ObjectId, ref: 'Product' }],
  createdAt:   { type: Date, default: Date.now }
}
// Add text index on Product schema:
// ProductSchema.index({ title: 'text', description: 'text', tags: 'text' },
//                     { weights: { title: 10, tags: 5, description: 1 } })

// StockHistory.ts
{
  product:     { type: ObjectId, ref: 'Product', required: true },
  delta:       { type: Number, required: true },   // positive = added, negative = removed
  reason:      { type: String, required: true },
  updatedBy:   { type: ObjectId, ref: 'User', required: true },
  stockBefore: { type: Number },
  stockAfter:  { type: Number },
  timestamp:   { type: Date, default: Date.now }
}

// Order.ts
{
  user:         { type: ObjectId, ref: 'User', required: true },
  items: [{
    product:  { type: ObjectId, ref: 'Product' },
    qty:      { type: Number, min: 1 },
    snapshot: {                                    // price snapshot at order time
      title:      String,
      cost:       Number,
      taxPercent: Number,
      image:      String
    }
  }],
  discountCode:   { type: String },
  discountAmount: { type: Number, default: 0 },
  subtotal:       { type: Number },
  tax:            { type: Number },
  total:          { type: Number },
  status:         { type: String, enum: ['pending','confirmed','preparing','delivered','cancelled'], default: 'pending' },
  createdAt:      { type: Date, default: Date.now }
}

// DiscountCode.ts
{
  code:          { type: String, required: true, unique: true, uppercase: true },
  discountType:  { type: String, enum: ['percent', 'flat'], required: true },
  discountValue: { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  usageLimit:    { type: Number, default: null }, // null = unlimited
  usedCount:     { type: Number, default: 0 },
  expiresAt:     { type: Date },
  isActive:      { type: Boolean, default: true }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEARCH — IMPLEMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
No Atlas CLI. No $search aggregation. Use standard MongoDB features.

1. AUTOCOMPLETE SUGGESTION (GET /api/search/suggest?q=term)
   - Use regex prefix match on title: { title: { $regex: `^${term}`, $options: 'i' } }
   - Limit 8 results, project: _id, title, images, cost, taxPercent, category
   - Populate category (name, slug)
   - Target < 100ms (index on title field)

2. FULL SEARCH (GET /api/search?q=term&category=slug&page=1&limit=20)
   - Use $text search: { $text: { $search: term } }
   - Add { score: { $meta: 'textScore' } } to projection, sort by it
   - If category provided: add { 'category._id': categoryId } to match after $lookup
   - Paginate with skip/limit
   - Populate category

Both endpoints live in search.controller.ts and are called via searchRoutes.ts.
The $text index is defined on the Product schema (see models section above) and
created automatically when Mongoose connects — no manual setup step needed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API ROUTES — FULL SPECIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AUTH
  POST   /api/auth/signup          body: { name, email, password }
                                   returns: { user, accessToken, refreshToken, apiKey }
  POST   /api/auth/login           body: { email, password }
                                   returns: { user, accessToken, refreshToken }
  POST   /api/auth/refresh         body: { refreshToken }
                                   returns: { accessToken }
  POST   /api/auth/logout          body: { refreshToken } → clears refreshToken in DB

SEARCH (public)
  GET    /api/search/suggest       ?q=term
                                   returns: { suggestions: [{ _id, title, cost, taxPercent,
                                             images, category: { name, slug } }] }
  GET    /api/search               ?q=term&category=slug&page=1&limit=20
                                   returns: { data: [...products], meta: { total, page, limit } }

CATEGORIES (public read, admin write)
  GET    /api/categories           returns all active categories with productCount
  GET    /api/categories/:slug     returns category + first 8 products
  POST   /api/categories           [admin] body: multipart/form-data { name, description, logo }
  PUT    /api/categories/:id       [admin] body: multipart/form-data
  DELETE /api/categories/:id       [admin] soft delete: isActive=false

PRODUCTS (public read, admin write)
  GET    /api/products             ?category=slug&page=1&limit=8&sortBy=createdAt
                                   returns paginated products with category populated
  GET    /api/products/:id         returns full product with addOns + combos populated
  POST   /api/products             [admin] multipart/form-data:
                                   { title, description, cost, taxPercent,
                                     category, stock, tags (CSV), images[] }
  PUT    /api/products/:id         [admin] multipart/form-data (same fields)
  DELETE /api/products/:id         [admin] soft delete
  PATCH  /api/products/:id/stock   [admin] body: { delta: Number, reason: String }
                                   → updates product.stock, creates StockHistory doc

ORDERS (authenticated user)
  GET    /api/orders               [user] paginated own orders ?page=1&limit=10&status=
  GET    /api/orders/:id           [user] full order detail
  POST   /api/orders               [user] body: { items: [{ productId, qty }], discountCode?: String }
                                   → validates stock, applies discount, calculates totals,
                                     deducts stock atomically, creates order
  POST   /api/orders/:id/reorder   [user] → returns { cartItems } ready to merge into cart

ADMIN
  GET    /api/admin/products       ?page=1&limit=20&search=&category=&isActive=
  GET    /api/admin/categories     ?page=1&limit=20
  GET    /api/admin/stock-history  ?product=id&page=1&limit=20
  GET    /api/admin/users          ?page=1&limit=20
  GET    /api/admin/orders         ?page=1&limit=20&status=
  PUT    /api/admin/orders/:id     body: { status }
  POST   /api/admin/discount-codes body: { code, discountType, discountValue,
                                          minOrderValue, usageLimit, expiresAt }
  GET    /api/admin/discount-codes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSE FORMAT (enforce on every endpoint)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Success:
{
  "success": true,
  "data": { ... } | [ ... ],
  "meta": { "page": 1, "limit": 20, "total": 143 }   // only on paginated endpoints
}

Error:
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",       // machine-readable SCREAMING_SNAKE_CASE
    "message": "Product not found",    // human-readable
    "status": 404
  }
}

Error codes to implement (minimum):
  VALIDATION_ERROR          422
  INVALID_CREDENTIALS       401
  TOKEN_EXPIRED             401
  INVALID_TOKEN             401
  FORBIDDEN                 403
  USER_NOT_FOUND            404
  PRODUCT_NOT_FOUND         404
  CATEGORY_NOT_FOUND        404
  ORDER_NOT_FOUND           404
  DUPLICATE_EMAIL           409
  DUPLICATE_CODE            409
  INSUFFICIENT_STOCK        400
  DISCOUNT_INVALID          400
  DISCOUNT_EXPIRED          400
  DISCOUNT_USAGE_EXCEEDED   400
  INTERNAL_ERROR            500

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUTH MIDDLEWARE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
auth.ts checks in order:
  1. Authorization: Bearer <jwt>  → verify with JWT_SECRET → attach req.user
  2. x-api-key: <key>             → lookup User by apiKey → attach req.user
  3. Neither present              → 401 INVALID_TOKEN

rbac.ts:
  requireRole = (...roles: string[]) => (req, res, next) =>
    roles.includes(req.user.role) ? next() : res.status(403).json(...)

JWT config:
  ACCESS_TOKEN_EXPIRES  = '15m'
  REFRESH_TOKEN_EXPIRES = '7d'
  Generate apiKey on signup using crypto.randomUUID()

Axios interceptors (client/src/api/axiosInstance.ts):
  Request:  inject Authorization: Bearer <accessToken> from Zustand authStore
  Response: on 401 → call POST /api/auth/refresh with refreshToken from localStorage
            → on success: update authStore, retry original request
            → on failure: clear authStore, redirect to /login

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOME PAGE — KFC-STYLE LAYOUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Theme: dark red (#C8102E) + white + off-white (#FAF9F6) inspired by KFC.
Use bold typography, high-contrast product cards, warm accents.

Layout:
  [Header: Logo | SearchBar | CartIcon | Auth buttons]
  [CategoryTabBar: horizontal scroll, one chip per category — sticky below header]
  [Hero banner: gradient or static food image with CTA text]
  [For each category in order:]
    [CategorySection]
      ├── Category logo (40×40) + name (h2) + "View all →" link
      ├── Horizontal scroll row of ProductCards (snap scrolling)
      └── LoadMore button (fetches next page for that category)
  [Footer: minimal, brand color]

CategoryTabBar:
  - Sticky below header (z-40)
  - Clicking a chip: smooth-scrolls to that category section (useRef + scrollIntoView)
  - Active chip: filled bg (#C8102E), white text
  - Overflow: scroll horizontally, hide scrollbar (scrollbar-hide utility)

ProductCard:
  - Rounded-2xl card, subtle drop shadow, hover: scale-105 transition
  - Image: aspect-square, object-cover, lazy loaded (loading="lazy")
  - Badge: "Out of Stock" (red pill) if stock === 0 | "Only X left" (amber pill) if stock ≤ 5
  - Title: font-semibold, line-clamp-2
  - Price: taxed price = cost + (cost × taxPercent / 100), format as ₹X.XX
  - "Add" button: rounded pill, brand red background
    → if product has addOns, open AddOnModal first
    → else add directly to cart
  - Clicking image/title → open ProductDetail modal

ProductDetail modal:
  - Full-screen on mobile, centered max-w-2xl on desktop
  - Image (large, aspect-video or square), description
  - Price breakdown: base + tax = final
  - AddOns: checkbox list with individual prices
  - Combos: if defined, show deal card with savings highlighted
  - Qty stepper (−/+) + "Add to Cart" CTA (full-width red button)

ProductCardSkeleton:
  - Exact same card dimensions as ProductCard
  - Framer Motion: animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.4 }}
  - Show 4 skeletons per category while loading

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEARCH UX — FRONTEND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
useSearch hook:
  - Maintains inputValue (raw), debouncedValue (400ms)
  - inputValue ≥ 2 chars → hits GET /api/search/suggest?q= (fast prefix)
  - debouncedValue change → hits GET /api/search?q= (full $text results)
  - Returns: { suggestions, results, isLoading, isSuggesting }

SearchBar.tsx:
  - Always visible in header, full-width on mobile
  - Rounded pill input, focus ring brand red, search icon left, clear (×) right
  - On focus: SearchSuggestions dropdown fades in (Framer Motion opacity + y)
  - Keyboard nav: ArrowUp/Down moves highlight, Enter selects, Escape closes

SearchSuggestions.tsx:
  - Max 8 rows from /api/search/suggest
  - Each row: [32×32 thumbnail] [product title] [CategoryChip]
  - "See all results for 'term' →" link at bottom
  - While loading: 4 skeleton rows

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CART — ZUSTAND STORE + DRAWER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cartStore.ts (Zustand + persist → localStorage key 'retailportal-cart'):
  state:
    items: Array<{ productId, title, image, cost, taxPercent, qty, addOns: [] }>
  actions:
    addItem(product, qty, addOns)
    removeItem(productId)
    updateQty(productId, qty)
    clearCart()
    getTotal()      → sum of (item.cost × (1 + item.taxPercent/100)) × item.qty
    getItemCount()  → sum of item.qty

CartIcon (header):
  - Shopping bag icon + red badge with itemCount
  - Framer Motion scale bounce when itemCount changes
  - Click → open CartDrawer

CartDrawer:
  - Framer Motion slide-in from right (x: '100%' → 0), 300ms ease-out
  - Backdrop overlay with blur (click to close)
  - CartItem rows: image, title, qty stepper, remove button, line total
  - Order summary: subtotal, tax, total
  - Discount code input + "Apply" → inline validation via POST /api/orders
  - "Place Order" CTA (full-width, brand red)
    → POST /api/orders → on success: clearCart() + navigate('/orders')

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDER HISTORY PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/orders page:
  - Paginated list via GET /api/orders
  - Each OrderCard:
    - Order ID (last 8 chars), date, status badge (color-coded pill)
    - Item count + total amount
    - Expandable section: item snapshots with image + qty + price
    - "Reorder" button → POST /api/orders/:id/reorder → merges into cartStore
  - Status badge colors:
      pending   → amber
      confirmed → blue
      preparing → purple
      delivered → green
      cancelled → red
  - Empty state: illustration + "No orders yet" + "Browse Menu" CTA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADMIN PANEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AdminLayout:
  - Collapsible left sidebar (icons + labels → icons-only on toggle)
  - Sidebar links: Dashboard, Products, Categories, Stock Update, Orders, Users, Discount Codes
  - Topbar: page title + logged-in username + logout

Admin Dashboard (/admin):
  - Summary cards: total products, categories, users, orders today
  - Recent orders table (last 10)

Admin Products (/admin/products):
  - Searchable (regex via /api/admin/products?search=), filterable by category + isActive
  - Table: thumbnail, title, category, cost, stock, isActive toggle, Edit/Delete
  - Pagination: 20 per page
  - "Add Product" → ProductForm modal

ProductForm modal:
  - React Hook Form + Zod validation, visible field errors inline
  - Fields: title, description, cost, taxPercent, category (select), stock, tags (CSV → array),
            addOns (multi-select from product list), combos (multi-select)
  - ImageUploadZone: drag-and-drop or click to select multiple images
    - Preview grid with remove-per-image button
    - Uploaded via multipart/form-data to Multer
    - Served via express.static from /server/src/uploads
  - Submit: POST or PUT → invalidate React Query cache → close modal

Stock Update (/admin/stock-update):
  - Search products by name (suggest endpoint)
  - Select product → shows current stock prominently
  - Form: delta (+/-) number + reason textarea
  - Submit → PATCH /api/products/:id/stock
  - StockHistoryTable below: date/time, delta (green/red), reason, updated by

Admin Categories (/admin/categories):
  - Card grid: logo, name, product count, Edit/Delete
  - CategoryForm modal: name, description, logo upload

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BREADCRUMB NAVIGATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Breadcrumb.tsx renders based on current route + search params:
  Home                              → /
  Home > Burgers                    → /?category=burgers
  Home > Search: "chick"            → /search?q=chick
  Home > Orders                     → /orders
  Admin > Products                  → /admin/products

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEED SCRIPT (server/src/scripts/seed.ts)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Seeds in order (idempotent — checks before inserting):

1. Admin user:
   email: admin@demo.com | password: Admin@123 | role: admin

2. Regular user:
   email: user@demo.com | password: User@123 | role: user

3. Categories (6):
   Burgers, Sides, Drinks, Desserts, Combos, Veg Specials
   (each with name, slug, description, placeholder logo URL from picsum.photos)

4. Products (30 total, 5 per category):
   Realistic food titles + descriptions, costs ₹50–₹500, taxPercent (5 or 12),
   stock (random 0–50), food tags, 2 addOns + 1 combo reference per product
   Use picsum.photos URLs as placeholder images

5. Discount codes:
   SAVE10  → 10% off, min order ₹200
   FLAT50  → ₹50 flat off, min order ₹300

6. Sample orders (3) for user@demo.com with status variety

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENVIRONMENT VARIABLES (.env.example)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Server
PORT=5000
MONGODB_URI=mongodb://localhost:27017/retailportal
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
NODE_ENV=development

# Client (Vite)
VITE_API_BASE_URL=http://localhost:5000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROOT PACKAGE.JSON SCRIPTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "scripts": {
    "dev":         "concurrently \"npm run server\" \"npm run client\"",
    "server":      "cd server && npx tsx watch src/index.ts",
    "client":      "cd client && npm run dev",
    "seed":        "cd server && npx tsx src/scripts/seed.ts",
    "install:all": "npm i && cd client && npm i && cd ../server && npm i"
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TYPESCRIPT CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
server/tsconfig.json:
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}

client/tsconfig.json: standard Vite React TS template config
  - strict: true
  - target: "ES2020"
  - lib: ["ES2020", "DOM", "DOM.Iterable"]
  - include: ["src"]

Shared types live in client/src/types/index.ts. The server models implicitly
define the shape; no shared package needed for hackathon scope.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POSTMAN COLLECTION REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Export as v2.1 collection. Must include:

Folders:
  Auth       → signup, login, refresh, logout
  Search     → suggest, full search, category-filtered search
  Categories → list, get by slug, create (admin), update, delete
  Products   → list, get by id, create (admin), update, stock patch, delete
  Orders     → list, get by id, place order, reorder
  Admin      → product list, stock history, users, orders, discount codes

Collection-level variables:
  baseUrl     = http://localhost:5000
  accessToken = (set by login test script)
  adminToken  = (set by admin login test script)
  apiKey      = (set by signup test script)

Pre-request scripts on login/signup requests:
  → Auto-set accessToken / adminToken / apiKey collection variables from response

Tests on each request:
  → Status code assertion
  → response.success === true
  → Key fields present in data

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUALITY CHECKLIST — DO NOT SKIP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Every API endpoint returns the standard success/error envelope
□ Every form has React Hook Form + Zod validation with visible inline errors
□ Every data-fetching component has a Skeleton loading state
□ ProductCard and CategorySection have skeleton variants shown during fetch
□ SearchBar suggestion dropdown works with keyboard navigation
□ Cart persists across page refresh (localStorage via Zustand persist)
□ JWT refresh is silent — user never sees a 401 flash
□ Admin routes return 403 when accessed by role 'user'
□ Stock PATCH creates a StockHistory document every time
□ Order creation deducts stock atomically (findOneAndUpdate with $inc)
□ $text index on Product is defined in schema (auto-created on connect)
□ Images served correctly at /uploads/* via express.static
□ All list endpoints are paginated (no unbounded queries)
□ README has complete local setup instructions
□ .env.example has all variables with placeholder values
□ Seed script is idempotent (safe to run multiple times)
□ No plain .js files — entire project is TypeScript
□ Home page loads with KFC-style dark red theme, category tab bar, product rows
□ CartDrawer slides in from right with Framer Motion
□ ProductCard shows skeleton pulse before data loads
