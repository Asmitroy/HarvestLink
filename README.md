# 🌾 HarvestLink

**HarvestLink** is a full-stack agricultural marketplace platform that connects **farmers**, **buyers**, and **logistics operators** in a unified real-time supply-chain dashboard. It streamlines produce listing, demand aggregation, and route optimization — all in one place.

---

## ✨ Features

- 🧑‍🌾 **Farmer Dashboard** — List produce, set pricing, track listing status (listed → matched → assigned → fulfilled)
- 🏢 **Buyer Dashboard** — Post demand, browse active supply listings, track fulfillment
- 🚚 **Logistics Dashboard** — Visualize supply/demand nodes, optimize delivery routes on an interactive map
- 🔐 **JWT Authentication** — Role-based access control (farmer / buyer / logistics)
- 📊 **Live Mandi Ticker** — Real-time crop price feed simulation
- 🗺️ **Route Map** — Logistics route visualization between supply and demand nodes
- 🔔 **Toast Notifications** — In-app feedback for every user action
- ☁️ **Vercel-Ready** — Deployed as a serverless full-stack app

---

## 🛠️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, React Router v7, Vite 5   |
| Styling     | Tailwind CSS v3, PostCSS            |
| Backend     | Node.js, Express 5                  |
| Database    | PostgreSQL via Supabase (`pg` pool) |
| Auth        | JWT (`jsonwebtoken`), bcryptjs      |
| Deployment  | Vercel (serverless)                 |
| Dev Tools   | Concurrently, dotenv                |

---

## 📁 Project Structure

```
HarvestLink/
├── api/                   # Vercel serverless entry point
│   └── index.js
├── server/                # Express backend
│   ├── index.js           # Server bootstrap & route registration
│   ├── middleware/
│   │   └── auth.js        # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js        # POST /api/auth/login, GET /api/auth/me
│   │   ├── listings.js    # CRUD for produce listings
│   │   └── demand.js      # CRUD for demand pool
│   └── db/
│       ├── database.js    # pg pool connection
│       ├── schema.sql     # Database schema (users, listings, demand)
│       ├── seed.js        # JS seed script
│       └── seed.sql       # SQL seed data
├── src/                   # React frontend
│   ├── main.jsx           # App entry point
│   ├── App.jsx            # Route definitions
│   ├── index.css          # Global styles
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── components/        # Shared UI components
│   │   ├── Login.jsx
│   │   ├── DashboardShell.jsx
│   │   ├── TopNav.jsx
│   │   ├── FarmerPane.jsx
│   │   ├── BuyerPane.jsx
│   │   ├── LogisticsPane.jsx
│   │   ├── RouteMap.jsx
│   │   ├── DemandCard.jsx
│   │   ├── StatusBar.jsx
│   │   ├── Toast.jsx
│   │   ├── PersonaSwitcher.jsx
│   │   └── ProtectedRoute.jsx
│   └── pages/
│       ├── FarmerDashboard.jsx
│       ├── BuyerDashboard.jsx
│       └── AdminDashboard.jsx
├── app.js                 # Vanilla JS for the static landing shell
├── index.html             # HTML entry point
├── style.css              # Global CSS for landing shell
├── vercel.json            # Vercel deployment config
├── vite.config.js         # Vite build config
├── tailwind.config.js     # Tailwind configuration
├── .env.example           # Environment variable template
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- A **Supabase** project (PostgreSQL) or any hosted PostgreSQL database

### 1. Clone the repository

```bash
git clone https://github.com/your-username/HarvestLink.git
cd HarvestLink
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Supabase / PostgreSQL connection string
DATABASE_URL=postgresql://postgres:<your-password>@db.<your-project-ref>.supabase.co:5432/postgres?sslmode=require

# JWT secret (use a strong random string in production)
JWT_SECRET=your-super-secret-key

# Server
PORT=3001
NODE_ENV=development
```

### 4. Set up the database

Run the schema against your PostgreSQL database:

```bash
# Using psql
psql $DATABASE_URL -f server/db/schema.sql

# Seed with sample data (optional)
npm run db:seed
```

### 5. Start the development servers

Run both the API server and Vite frontend simultaneously:

```bash
npm run dev:full
```

Or run them separately:

```bash
# Terminal 1 — API server (port 3001)
npm run dev:server

# Terminal 2 — Vite dev server (port 5173)
npm run dev
```

Open your browser at **http://localhost:5173**.

---

## 📡 API Endpoints

### Public

| Method | Endpoint          | Description                        |
|--------|-------------------|------------------------------------|
| GET    | `/api/health`     | Health check — verifies DB connectivity |
| POST   | `/api/auth/login` | Login with email + password (returns JWT) |
| GET    | `/api/auth/me`    | Get current authenticated user info |

### Protected *(Bearer JWT required)*

| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | `/api/listings/active`| Get all active produce listings    |
| POST   | `/api/listings`       | Create a new produce listing       |
| GET    | `/api/demand/active`  | Get all open demand requests       |
| POST   | `/api/demand`         | Post a new demand request          |

---

## 🗃️ Database Schema

### `users`
| Column         | Type    | Description                          |
|----------------|---------|--------------------------------------|
| id             | INTEGER | Primary key                          |
| name           | TEXT    | Full name                            |
| role           | TEXT    | `farmer` / `buyer` / `logistics`     |
| email          | TEXT    | Unique login email                   |
| password_hash  | TEXT    | bcrypt hashed password               |
| location       | TEXT    | Location label                       |
| location_lat   | REAL    | Latitude                             |
| location_lng   | REAL    | Longitude                            |

### `produce_listings`
| Column      | Type    | Description                                           |
|-------------|---------|-------------------------------------------------------|
| id          | INTEGER | Primary key                                           |
| farmer_id   | INTEGER | FK → users                                            |
| crop        | TEXT    | Crop name                                             |
| qty         | REAL    | Quantity available                                    |
| price       | REAL    | Price per kg                                          |
| status      | TEXT    | `listed` → `matched` → `assigned` → `fulfilled`      |

### `demand_pool`
| Column        | Type    | Description                                         |
|---------------|---------|-----------------------------------------------------|
| id            | INTEGER | Primary key                                         |
| buyer_id      | INTEGER | FK → users                                          |
| crop          | TEXT    | Crop requested                                      |
| requested_qty | REAL    | Total quantity needed                               |
| matched_qty   | REAL    | Quantity matched so far                             |
| target_price  | REAL    | Maximum price buyer is willing to pay               |
| status        | TEXT    | `open` → `matching` → `ready` → `fulfilled`         |
| deadline      | TEXT    | Deadline for fulfilment                             |
| is_priority   | INTEGER | Priority flag (0/1)                                 |

---

## 🏗️ Building for Production

```bash
npm run build
```

The static frontend assets are output to `dist/`. The Express server handles API routes via Vercel's serverless functions.

### Deploying to Vercel

1. Push to GitHub
2. Import your repo on [vercel.com](https://vercel.com)
3. Set environment variables in the Vercel dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
4. Deploy — Vercel will handle the rest using `vercel.json`

---

## 🔒 Security Notes

- Never commit `.env` to version control (it's already in `.gitignore`)
- Change `JWT_SECRET` to a strong, unique random string in production
- Use `sslmode=require` in your `DATABASE_URL` for Supabase

---

## 📄 License

This project is licensed under the terms in the [LICENSE](./LICENSE) file.

---

> Built with ❤️ to empower India's agricultural supply chain.
