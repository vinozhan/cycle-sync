# CycleSync

A full-stack MERN web application that promotes cycling through safe route planning, community hazard reporting, route reviews, ride tracking, and a gamification rewards system. Built in alignment with **UN Sustainable Development Goal 11: Sustainable Cities and Communities**.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js 22, Express.js 5, MongoDB with Mongoose 9 |
| **Frontend** | React 19, Vite 7, Tailwind CSS v4 |
| **Authentication** | JWT (access + refresh tokens), bcryptjs |
| **Maps** | Leaflet, react-leaflet |
| **External APIs** | OpenRouteService (cycling directions), OpenWeatherMap (weather advisory) |
| **Testing** | Jest 30, Supertest, mongodb-memory-server, Artillery.io |
| **Deployment** | Render (backend), Vercel (frontend), MongoDB Atlas |

## Features

- **Route Management** — Create, browse, and preview cycling routes with OpenRouteService directions, distance, difficulty, and surface type filtering
- **Safety Hazard Reporting** — Report road hazards with location, severity, and category; admin review workflow with status tracking
- **Community Reviews** — Rate and review routes with safety, scenery, and difficulty accuracy scores
- **Ride Tracking** — Start, complete, and cancel rides; view ride history and statistics with streak tracking
- **Weather Advisory** — Real-time weather conditions and cycling safety recommendations for any location
- **Gamification & Rewards** — Earn badges and points for cycling milestones (distance, rides, reviews, reports)
- **User Profiles** — View achievements, cycling stats, points breakdown, and ride history
- **Admin Dashboard** — Manage users, verify routes, review hazard reports, and configure rewards
- **Interactive Maps** — Leaflet-based maps for route visualization, hazard markers, and nearby route discovery
- **Responsive Design** — Mobile-friendly UI with Tailwind CSS

## Project Structure

```
/
├── render.yaml              # Render deployment config
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── config/          # DB, CORS, Swagger, env validation
│       ├── models/          # Mongoose schemas
│       ├── routes/          # Express route definitions
│       ├── controllers/     # Request/response handlers
│       ├── services/        # Business logic layer
│       ├── middleware/      # Auth, authorization, validation, error handling
│       ├── validators/      # express-validator chains
│       ├── utils/           # ApiError, ApiResponse, pagination
│       ├── app.js           # Express app setup
│       ├── server.js        # Entry point with graceful shutdown
│       └── seed.js          # Admin account seeder
│   └── tests/
│       ├── unit/            # Service and middleware tests
│       ├── integration/     # API endpoint tests
│       └── performance/     # Artillery.io load/stress tests
│
└── frontend/
    ├── package.json
    ├── vercel.json          # Vercel deployment config
    ├── vite.config.js
    └── src/
        ├── components/      # Reusable UI components
        ├── pages/           # Page-level components
        ├── context/         # React Context providers
        ├── hooks/           # Custom hooks
        ├── services/        # API service layer (axios)
        ├── utils/           # Formatters, validators, constants
        ├── App.jsx          # Root component with routing
        ├── main.jsx         # Vite entry point
        └── index.css        # Tailwind CSS v4 import
```

## Getting Started

### Prerequisites

- **Node.js** >= 22.0.0
- **MongoDB** — Local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **API Keys** — [OpenRouteService](https://openrouteservice.org/dev/#/signup) and [OpenWeatherMap](https://openweathermap.org/api)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/<your-username>/cyclesync.git
   cd cyclesync
   ```

2. **Install dependencies**

   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**

   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your values

   # Frontend
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your API URL
   ```

4. **Seed the admin account**

   ```bash
   cd backend
   npm run seed
   ```

   This creates an admin account with default credentials:
   - **Email:** `admin@cyclesync.lk`
   - **Password:** `Admin@123`

   You can override these with `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables.

5. **Start development servers**

   ```bash
   # Backend (from /backend)
   npm run dev

   # Frontend (from /frontend, in a separate terminal)
   npm run dev
   ```

   - Backend runs at `http://localhost:5000`
   - Frontend runs at `http://localhost:5173`
   - API docs at `http://localhost:5000/api-docs`

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment mode (`development`, `production`, `test`) |
| `PORT` | No | `5000` | Server port |
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Yes | — | Secret key for signing access tokens |
| `JWT_REFRESH_SECRET` | Yes | — | Secret key for signing refresh tokens |
| `ORS_API_KEY` | No | `""` | OpenRouteService API key for cycling directions |
| `OWM_API_KEY` | No | `""` | OpenWeatherMap API key for weather data |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed CORS origin(s), comma-separated |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | — | Backend API base URL (e.g., `http://localhost:5000/api`) |

## API Endpoints

Base URL: `/api` | Swagger docs: `/api-docs` | Health check: `GET /health`

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register a new account | No |
| POST | `/auth/login` | Login and receive tokens | No |
| POST | `/auth/refresh` | Refresh access token via cookie | No |
| POST | `/auth/logout` | Logout and invalidate tokens | Yes |
| GET | `/auth/me` | Get current user profile | Yes |

### Users (`/api/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users` | List all users (paginated) | Admin |
| GET | `/users/:id` | Get user by ID | Yes |
| PUT | `/users/:id` | Update user profile | Owner/Admin |
| PATCH | `/users/change-password` | Change own password | Yes |
| DELETE | `/users/:id` | Deactivate user | Admin |
| PATCH | `/users/:id/reactivate` | Reactivate user | Admin |
| GET | `/users/:id/achievements` | Get user's earned rewards | Yes |
| GET | `/users/:id/stats` | Get user's cycling stats | Yes |

### Routes (`/api/routes`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/routes` | List routes (filterable, paginated) | No |
| GET | `/routes/nearby` | Find routes near coordinates | No |
| POST | `/routes/preview` | Preview route between two points | Yes |
| GET | `/routes/:id` | Get single route | No |
| POST | `/routes` | Create a route | Yes |
| PUT | `/routes/:id` | Update a route | Owner/Admin |
| DELETE | `/routes/:id` | Delete a route | Owner/Admin |
| PATCH | `/routes/:id/verify` | Verify a route | Admin |
| GET | `/routes/:id/weather` | Get weather at route start | Yes |

### Reports (`/api/reports`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/reports` | List hazard reports (filterable) | Yes |
| GET | `/reports/:id` | Get single report | Yes |
| POST | `/reports` | Create a hazard report | Yes |
| PUT | `/reports/:id` | Update own report | Owner |
| DELETE | `/reports/:id` | Delete a report | Owner/Admin |
| PATCH | `/reports/:id/status` | Update report status | Admin |

### Reviews (`/api/reviews`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/reviews` | List reviews (filterable) | No |
| GET | `/reviews/:id` | Get single review | No |
| POST | `/reviews` | Create a route review | Yes |
| PUT | `/reviews/:id` | Update own review | Owner |
| DELETE | `/reviews/:id` | Delete a review | Owner/Admin |

### Rewards (`/api/rewards`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/rewards` | List all rewards | Yes |
| GET | `/rewards/:id` | Get single reward | Yes |
| POST | `/rewards` | Create a reward | Admin |
| PUT | `/rewards/:id` | Update a reward | Admin |
| DELETE | `/rewards/:id` | Delete a reward | Admin |
| POST | `/rewards/check/:userId` | Evaluate and grant rewards | Admin |

### Rides (`/api/rides`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/rides/stats` | Get ride statistics | Yes |
| GET | `/rides/active` | Get active ride | Yes |
| GET | `/rides` | List ride history | Yes |
| GET | `/rides/:id` | Get single ride | Yes |
| POST | `/rides/start` | Start a ride | Yes |
| PATCH | `/rides/:id/complete` | Complete a ride | Yes |
| PATCH | `/rides/:id/cancel` | Cancel a ride | Yes |

### Weather (`/api/weather`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/weather?lat=...&lng=...` | Get weather and cycling advisory | Yes |

### Response Format

All endpoints return responses in this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

Error responses include an `errors` array when applicable:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```

## Testing

All tests run from the `backend/` directory.

```bash
# Run all tests
npm test

# Unit tests only (services, middleware)
npm run test:unit

# Integration tests only (API endpoints)
npm run test:integration

# Tests with coverage report
npm run test:coverage

# Performance load test (Artillery.io)
npm run test:perf

# Stress test (Artillery.io)
npm run test:stress
```

Tests use **mongodb-memory-server** for an isolated in-memory database — no external MongoDB instance required.

## Deployment

### Backend — Render

1. **Create a new Web Service** on [Render](https://render.com)
2. **Connect your repository** and set:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Health Check Path:** `/health`
3. **Add environment variables** in the Render dashboard:

   | Variable | Value |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `JWT_ACCESS_SECRET` | A strong random secret |
   | `JWT_REFRESH_SECRET` | A different strong random secret |
   | `ORS_API_KEY` | Your OpenRouteService API key |
   | `OWM_API_KEY` | Your OpenWeatherMap API key |
   | `CORS_ORIGIN` | Your Vercel frontend URL (e.g., `https://cyclesync.vercel.app`) |

4. **Deploy** — Render will build and start the service automatically

> A `render.yaml` file is included in the project root for Infrastructure as Code setup. You can also use the Render dashboard's "Blueprint" feature to auto-configure from this file.

**Live API:** `https://<your-render-service>.onrender.com`

### Frontend — Vercel

1. **Import the project** on [Vercel](https://vercel.com)
2. **Configure build settings:**
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. **Add environment variable:**

   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | Your Render backend URL + `/api` (e.g., `https://cyclesync-api.onrender.com/api`) |

4. **Deploy** — Vercel will build and deploy automatically

> The `vercel.json` file handles SPA routing (rewrites) and security headers.

**Live App:** `https://<your-vercel-project>.vercel.app`

### Database — MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write permissions
3. Whitelist IP addresses (use `0.0.0.0/0` for Render's dynamic IPs)
4. Copy the connection string and set it as `MONGODB_URI` in Render

### Post-Deployment

After both services are deployed:

1. **Seed the admin account:**
   ```bash
   # Run locally with production MONGODB_URI, or use Render's shell
   MONGODB_URI=<atlas-uri> node backend/src/seed.js
   ```

2. **Verify the health check:** `GET https://<your-render-url>/health`

3. **Test the frontend** loads and can communicate with the backend
