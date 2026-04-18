# Demo Data Enrichment Guide

Run this **after** the full implementation is complete and `npm run dev` is verified working.

---

## Prerequisites

Before enriching data, confirm these work:

- [ ] `npm run dev` starts both client (`:5173`) and server (`:5000`) without errors
- [ ] MongoDB is running locally and Mongoose connects successfully
- [ ] `POST /api/auth/login` returns a valid JWT
- [ ] Admin panel is accessible at `/admin`
- [ ] Home page loads (even if empty)

---

## Step 1 — Run the Base Seed

```bash
npm run seed
```

This creates:
- 2 users (admin + regular user)
- 6 categories
- 30 products
- 2 discount codes
- 3 sample orders

Verify in MongoDB Compass:
- Open `retailportal` database
- Check collections: `users`, `categories`, `products`, `orders`, `discountcodes`
- All should have documents

---

## Step 2 — Verify the Home Page Looks Right

Open `http://localhost:5173` and confirm:

- [ ] 6 category chips appear in the CategoryTabBar
- [ ] Each category section shows product cards
- [ ] At least 1 product shows **"Out of Stock"** red badge (Cheese Burst Burger, stock: 0)
- [ ] At least 2 products show **"Only X left"** amber badge (stock ≤ 5)
- [ ] Product images load from LoremFlickr (may take 1–2 seconds on first load)
- [ ] Prices display with ₹ symbol and tax calculated correctly

If images are broken or slow, LoremFlickr may be rate-limiting. Wait 30 seconds and refresh.

---

## Step 3 — Wire Up AddOns and Combos via Admin Panel

The seed script creates products but AddOn/Combo references need to be linked.
Do this through the Admin UI so you can also demo the admin panel flow.

Log in at `/login`:
```
Email:    admin@demo.com
Password: Admin@123
```

Go to `/admin/products` → Edit each product below → set AddOns + Combos:

| Product | AddOns to set | Combo to set |
|---|---|---|
| Classic Crispy Burger | Crispy Salted Fries, Classic Cola | Classic Meal Combo |
| Spicy Zinger Burger | Peri-Peri Fries, Strawberry Lemonade | Zinger Value Meal |
| Double Smash Burger | Onion Rings, Classic Cola | Premium Double Deal |
| Paneer Tikka Wrap | Creamy Coleslaw, Iced Green Tea | — |
| Crispy Veg Burger | Crispy Salted Fries, Mango Smoothie | Snack Duo |

After saving, click any of these products on the home page → the ProductDetail modal
should show the AddOns checkbox list and Combo deal card.

---

## Step 4 — Upload Real Product Images (Optional but Recommended)

If you want actual food images instead of LoremFlickr placeholders:

1. Go to `/admin/products`
2. Edit a product → drag-and-drop a food image into the ImageUploadZone
3. Save — the image is stored in `/server/src/uploads/` and served via express.static

Good free image sources to download from:
- **Unsplash** → [unsplash.com/s/photos/burger](https://unsplash.com/s/photos/burger) (free, high quality)
- **Pexels** → [pexels.com/search/food](https://pexels.com/search/food) (free, no attribution required)

Download 400×400 or 600×600 JPGs. Recommended: upload at least 1 real image per
category to make the demo visually stronger.

---

## Step 5 — Demo the Stock Management Flow

This directly demonstrates the **Admin UX for stock updates** requirement.

1. Go to `/admin/stock-update`
2. Search for **"Cheese Burst Burger"** (currently stock: 0, shows Out of Stock on home)
3. Set delta: `+20`, reason: `"Restocked for weekend demand"`
4. Submit → verify stock updates to 20
5. Go back to home page → the "Out of Stock" badge should now be gone
6. Return to `/admin/stock-update` → the StockHistoryTable shows the delta entry

This is a great **live demo sequence** — judges see the end-to-end effect in real time.

Then do the reverse for demo purposes:
- Set delta: `-18`, reason: `"Stock correction after audit"`
- Home page now shows **"Only 2 left"** amber badge

---

## Step 6 — Place a Live Order as User

Log out of admin. Log in as user:
```
Email:    user@demo.com
Password: User@123
```

1. Add **Spicy Zinger Burger** to cart (select Peri-Peri Fries as add-on)
2. Add **Strawberry Lemonade** to cart
3. Open CartDrawer → apply discount code `SAVE10`
4. Verify discount is applied and total recalculates
5. Place Order → redirected to `/orders`
6. New order appears with status **"pending"** (amber badge)

Now log back in as admin:
1. Go to `/admin/orders`
2. Find the order just placed
3. Change status to `confirmed` → blue badge
4. Change to `preparing` → purple badge

Switch back to user session → refresh `/orders` → status badge updates live.

---

## Step 7 — Demo the Search Feature

On the home page, click the SearchBar:

1. Type `"ch"` → suggestion dropdown appears with products matching prefix (Chocolate Milkshake, Cheese Burst, etc.)
2. Type `"spicy"` → shows Spicy Zinger Burger
3. Type `"combo"` → shows combo products
4. Press Enter on a suggestion → navigates to `/search?q=...` full results page
5. Use the category filter sidebar to narrow results

---

## Step 8 — Demo the Reorder Feature

On `/orders`, find Order 1 (the delivered order from seed data):

1. Click **"Reorder"** button
2. Items are merged back into the cart automatically
3. CartIcon badge updates with item count
4. Open CartDrawer — the previous order items are ready to checkout

---

## Step 9 — Verify Postman Collection

Open Postman → Import `/postman/RetailPortal.postman_collection.json`

Run in this order to show judges a clean Postman demo:

1. **Auth → Signup** (creates a fresh test user, auto-sets `accessToken`)
2. **Auth → Login as Admin** (auto-sets `adminToken`)
3. **Categories → List All** (shows 6 categories with productCount)
4. **Products → List** (paginated, category filter working)
5. **Search → Suggest** (?q=spic → returns Spicy Zinger)
6. **Search → Full Search** (?q=burger → returns all burger products with relevance score)
7. **Orders → Place Order** (uses `accessToken`, deducts stock)
8. **Admin → Stock History** (shows the delta entries from Step 5)
9. **Admin → Update Order Status** (uses `adminToken`)

Every request should return `"success": true` with appropriate HTTP status codes.

---

## Final Demo Checklist

Run through this quickly before presenting:

- [ ] Home page loads in < 2 seconds with skeleton → content transition visible
- [ ] Category tab bar is sticky on scroll
- [ ] At least one "Out of Stock" and one "Only X left" badge visible
- [ ] SearchBar suggestion dropdown works (keyboard nav: ArrowDown, Enter, Escape)
- [ ] CartDrawer slides in from right with animation
- [ ] Cart persists after browser refresh (localStorage)
- [ ] Discount code `SAVE10` applies correctly in cart
- [ ] Admin panel sidebar collapses to icons-only
- [ ] Stock update flow shows badge change on home page
- [ ] Order status change reflects on user orders page
- [ ] Postman collection runs green (all status assertions pass)
- [ ] README setup instructions are accurate end-to-end

---

## Seed Data Reference

### Users
| Email | Password | Role |
|---|---|---|
| admin@demo.com | Admin@123 | admin |
| user@demo.com | User@123 | user |

### Discount Codes
| Code | Type | Value | Min Order |
|---|---|---|---|
| SAVE10 | percent | 10% | ₹200 |
| FLAT50 | flat | ₹50 | ₹300 |
| DEMO20 | percent | 20% | ₹150 |

### Products — Stock Levels (demo-strategic)
| Product | Stock | Badge shown |
|---|---|---|
| Cheese Burst Burger | 0 | Out of Stock (red) |
| Corn & Cheese Griller | 0 | Out of Stock (red) |
| BBQ Bacon Stacker | 3 | Only 3 left (amber) |
| Double Smash Burger | 5 | Only 5 left (amber) |
| Brownie Sundae | 3 | Only 3 left (amber) |
| All others | 10–60 | No badge |

### Sample Orders (user@demo.com)
| # | Items | Status | Discount |
|---|---|---|---|
| 1 | Crispy Burger + Fries + Cola | delivered (green) | SAVE10 |
| 2 | 2x Zinger + Onion Rings + 2x Lemonade | preparing (purple) | none |
| 3 | Family Feast Box | pending (amber) | FLAT50 |
