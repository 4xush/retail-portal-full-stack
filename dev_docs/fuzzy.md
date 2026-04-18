### Test 1 — Autocomplete (live dropdown as you type)

Click the search bar in the header and type these, watching the dropdown appear:

| What you type | What the dropdown should show |
|---|---|
| `bur` | Aloo Tikki Burger, Crispy Veg Burger… (prefix match) |
| `rings` | **Onion Rings** (mid-word match — this was broken before, now works) |
| `spicy` | Spicy Zinger Burger, Peri-Peri Fries… (matched via **tags**, not title) |
| `peri` | Peri-Peri Fries (mid-word in title) |
| `meal` | Zinger Value Meal, Classic Meal Combo |

The dropdown shows up to 8 suggestions with image thumbnail, price, and category label. Use `↑`/`↓` arrows to navigate, `Enter` to select.

---

### Test 2 — Full search page (after pressing Enter)

After typing a query, press **Enter** or click a suggestion to land on `/search?q=…`:

| What you type + Enter | Expected outcome on search page |
|---|---|
| `burger` | 9 results, `strategy: text` (exact match via `$text` index) |
| `burgr` | 9 results, `strategy: fuzzy` ← **this is the typo recovery** |
| `chcken` | ~2 results, `strategy: fuzzy` (typo for "chicken") |
| `frie` | Fries results via `$text`, `strategy: text` |
| `meal` | Zinger Value Meal, Classic Meal Combo — filter to "Combos" using the left sidebar |

---

### What the search page shows you

- **Result count** at the top: `"9 results for "burgr""`
- Product cards in a **grid** (image, name, price, Add button)
- **Left sidebar** — category checkboxes to narrow results after searching
- **Load more** button at the bottom for pagination
- Click any card → **product detail modal** with add-ons
- `strategy` field is in the API response meta (visible in DevTools Network tab)

---

### Tech behind this feature

In simple terms, the app first asks MongoDB for a **normal keyword search** (fast and accurate when your spelling matches the catalog). If that finds nothing, it **loosens the rules** and looks for **partial letter patterns** in the product name, tags, and description so small typos still return sensible results. The browser only calls two HTTP endpoints for this; everything clever happens on the server.

**Example (simple terms)**  
- You type **`burger`** and press Enter → the catalog already has that word, so you get a full list quickly (`strategy: text` in the response).  
- You type **`burgr`** (one letter wrong) → the strict search finds nothing useful, so the server tries **shorter chunks of letters** (like `bur`) inside product names; that still matches **“Burger”**, so you still see burger-style items (`strategy: fuzzy`).  
- In the search box you type **`rings`** without starting from the beginning of the name → the dropdown can still surface **“Onion Rings”** because it looks for that text **anywhere** in the title (and can use tags when needed).

**Stack (high level)**  
- **Client**: React 18, React Router (`/search?q=…`), TanStack Query (`useInfiniteQuery` for paged results), Axios (`fetchSuggestions` / `fetchSearch` in `client/src/api/search.api.ts`).  
- **Server**: Node.js + Express 5, TypeScript (`tsx` in dev), Mongoose 8 aggregation on MongoDB.  
- **Data**: Local MongoDB; products use a **`$text` index** on `title`, `description`, and `tags` (defined on the Product schema) for fast full-text search.

**API surface**  
| Endpoint | Role |
|---|---|
| `GET /api/search/suggest?q=` | Autocomplete: substring match on `title`, then backfill from `tags` if fewer than 8 hits; `populate('category')` for labels. |
| `GET /api/search?q=&page=&limit=&category=` | Full search: two-stage pipeline — **(1)** `$text` + `$meta: textScore` + category `$lookup` / filter + facet pagination; **(2)** if total is 0, **fuzzy fallback** with `$or` regex conditions on `title`, `tags`, `description`. |

**Fuzzy fallback (server logic)**  
- Implemented in `server/src/controllers/search.controller.ts` (`fullSearch` → `runTextSearch` then `runFuzzySearch`).  
- Queries are tokenized on whitespace; each token becomes a case-insensitive regex plus **overlapping n-grams** (length ≈ `max(3, floor(len × 0.7))`) so typos like `burgr` still overlap real words like `Burger`.  
- Regex metacharacters are escaped before building patterns.  
- Response **`meta.strategy`** is either `text` (index path) or `fuzzy` (fallback path) so you can verify behavior in Network tab or Postman.

**UI wiring**  
- Header **SearchBar** (`client/src/components/search/SearchBar.tsx`) debounces via `useEffect` + `fetchSuggestions`; Enter navigates to the search route.  
- **SearchPage** (`client/src/pages/SearchPage.tsx`) reads `q` / `category` from URL params and uses **`useInfiniteSearch`** (`client/src/hooks/useInfiniteProducts.ts`) to call `GET /api/search` with infinite scroll.
