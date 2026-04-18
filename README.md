# Retail Portal — KFC-style food e-commerce (hackathon demo)

Full-stack TypeScript monorepo: **React 18 + Vite + Tailwind** (client) and **Express 5 + Mongoose** (server), **MongoDB** (local, MongoDB Compass compatible).

## Prerequisites

- Node.js **20+**
- **npm**
- **MongoDB** running locally on port **27017** (e.g. via Compass / `mongod`)

## Setup

1. Clone the repository.

2. Copy environment file and set secrets (JWT values must be **at least 32 characters**):

   ```bash
   cp .env.example .env
   # Edit .env — set JWT_SECRET and JWT_REFRESH_SECRET
   ```

3. Install all dependencies:

   ```bash
   npm run install:all
   ```

4. Seed the database (users, categories, products, discount codes, sample orders):

   ```bash
   npm run seed
   ```

5. Start client + server together:

   ```bash
   npm run dev
   ```

- **Client:** http://localhost:5173  
- **API:** http://localhost:5000  
- **Health:** http://localhost:5000/api/health  

Vite proxies `/api` to the server when `VITE_API_BASE_URL` is unset; if you set `VITE_API_BASE_URL=http://localhost:5000` in `.env`, the client calls the API directly (CORS is enabled on the server).

## Demo accounts (after seed)

| Role  | Email            | Password   |
|-------|------------------|------------|
| Admin | admin@demo.com   | Admin@123  |
| User  | user@demo.com    | User@123   |

## Scripts

| Script            | Description                                      |
|-------------------|--------------------------------------------------|
| `npm run dev`     | Runs API (`:5000`) and SPA (`:5173`) together  |
| `npm run seed`    | Idempotent seed (safe to run multiple times)   |
| `npm run install:all` | `npm i` in root, `client`, and `server`    |

## Postman

Import `postman/RetailPortal.postman_collection.json` (v2.1).  
Collection variables: `baseUrl`, `accessToken`, `adminToken`, `apiKey` — login requests set tokens via test scripts.

## Project layout

- `client/` — React SPA  
- `server/` — Express API + Mongoose models  
- `postman/` — API collection  
- `dev_docs/` — requirements, master spec, seed enrichment guide  

## Search

Product search uses MongoDB **`$text`** index (defined on the Product schema) plus **regex prefix** suggestions. No MongoDB Atlas CLI required.

## License

Demo / educational use.
