## AppSec Security Dashboard

A full‑stack security dashboard (React + Express) for managing services and visualizing scanner findings (Critical/High/Medium/Low), risk scoring, and analytics.

## Highlights

- **Multi‑engine data**: Mend (SCA, SAST, Containers), Escape (WebApps, APIs), Crowdstrike (Images, Containers)
- **Risk Assessments**: CIA triad inputs, calculated final risk score, risk level
- **Dashboards**: Risk distribution, findings by engine, KPIs
- **Services**: List with risk context; deep service detail views
- **Auth**: Session‑based auth with protected API routes

## Architecture

### Frontend
- React + TypeScript, Wouter router
- Shadcn/UI (Radix primitives), Tailwind CSS
- React Query for data fetching
- Built with Vite to `dist/public`

### Backend
- Express + TypeScript (ESM)
- REST API, request logging middleware
- Serves SPA statically in production

### Database
- PostgreSQL via Drizzle ORM/Drizzle Kit
- Tables: `applications`, `risk_assessments`, and per‑engine findings tables

## Requirements

- Node.js 20+
- Docker (for local Postgres or full Docker Compose)

## Quick start (clone and run locally)

### A) Run with Docker Compose (production‑like)
```bash
git clone <your_repo_url> appsec-dashboard
cd appsec-dashboard

# Build and start Postgres + app image
docker compose up -d --build

# Apply DB schema from your host (runtime image has prod deps only)
export DATABASE_URL=postgresql://appsec_user:appsec_password@localhost:5432/appsec_dashboard
npm install
npm run db:push

# (Re)start the app if needed
docker compose restart app

# Open
open http://localhost:3000
```

### B) Developer mode with hot reload (Docker)
```bash
docker compose -f docker-compose.dev.yml up --build
# In another terminal, push schema (once):
export DATABASE_URL=postgresql://appsec_user:appsec_password@localhost:5432/appsec_dashboard
npm install
npm run db:push
# App on http://localhost:3000
```

### C) Direct Node.js locally (Postgres via Docker)
```bash
git clone <your_repo_url> appsec-dashboard
cd appsec-dashboard

# Start only Postgres
docker compose up -d postgres

# Configure env and push schema
export DATABASE_URL=postgresql://appsec_user:appsec_password@localhost:5432/appsec_dashboard
npm install
npm run db:push

# Start dev server (Express + Vite dev for client)
npm run dev
# App on http://localhost:5000
```

## Credentials

- Default admin: `admin`
- Password: `password@hh`

## API (core)

- `POST /api/login`
- `GET /api/applications`
- `GET /api/services-with-risk-scores`
- `GET /api/dashboard/metrics`
- Per‑engine findings: `/api/mend/{sca|sast|containers}`, `/api/escape/{webapps|apis}`, `/api/crowdstrike/{images|containers}`

## Scripts

- `npm run dev` — development (HMR)
- `npm run build` — build client and server bundles
- `npm start` — run production server (serves `dist/public` and API)
- `npm run db:push` — apply Drizzle schema to the database

## Troubleshooting

- App container exits with “Cannot find package 'vite' imported from /app/dist/index.js”:
  - Rebuild after pulling latest changes (we load Vite only in dev now):
    ```bash
    docker compose down
    docker compose build --no-cache app
    docker compose up -d postgres
    export DATABASE_URL=postgresql://appsec_user:appsec_password@localhost:5432/appsec_dashboard
    npm run db:push
    docker compose up -d app
    ```
- DB errors at startup: ensure `DATABASE_URL` is correct and Postgres is `healthy`; run `npm run db:push`.

## Security notes

- Session cookies must be `secure` in real production behind HTTPS
- Validate inputs server‑side; Drizzle helps prevent SQL injection
- Store secrets in env vars or secret managers
