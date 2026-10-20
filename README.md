# e-UCUA · Unsafe Condition / Unsafe Act reporting

Behaviour and condition monitoring system for **Tok Bali Supply Base (TBSB)**. Staff and visitors
report unsafe acts, unsafe conditions and safe observations; staff earn monthly points and appear
on a leaderboard.

| Layer    | Stack |
|----------|-------|
| Frontend | React 19 · TypeScript · Vite · Tailwind CSS · TanStack Query · React Hook Form + Zod · React Router |
| Backend  | FastAPI · Pydantic v2 · psycopg2 (pooled) · PyJWT · bcrypt |
| Database | PostgreSQL 16 |
| Ops      | Docker Compose (Postgres + API + nginx) · GitHub Actions CI |

---

## Project structure

```
UCUA-System/
├── backend/
│   ├── app/
│   │   ├── main.py              # App factory: middleware, error handlers, static files, routers
│   │   ├── core/                # config (env settings), security (JWT, bcrypt), logging, exceptions
│   │   ├── db/database.py       # Connection pool + per-request transaction dependency
│   │   ├── api/
│   │   │   ├── deps.py          # Shared dependencies (current user, DB connection)
│   │   │   └── routes/          # auth, users, reports, lookups, feedback, dashboard
│   │   ├── schemas/             # Pydantic request/response models
│   │   ├── services/            # Business logic (auth, reports, points, profile, file storage)
│   │   ├── repositories/        # All SQL lives here
│   │   └── utils/time.py        # Malaysia-time helpers
│   ├── db/schema.sql            # Idempotent schema (safe on existing DBs)
│   ├── db/seed_dev.sql          # Sample locations/companies for local dev
│   ├── scripts/seed_users.py    # Bulk-create staff accounts from JSON
│   ├── tests/                   # unit/ (no DB) and integration/ (real Postgres)
│   ├── requirements.txt / requirements-dev.txt / pyproject.toml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/                 # App providers + route table (lazy-loaded pages)
│   │   ├── components/ui/       # Design-system primitives (Button, Input, Card, ChoiceCards, FileDropzone…)
│   │   ├── components/layout/   # AppLayout (sidebar), AuthLayout, PublicLayout, PageHeader
│   │   ├── features/            # auth, reports, dashboard, profile, feedback, lookups
│   │   │   └── <feature>/       #   api.ts · schemas.ts · components/ · pages/
│   │   ├── lib/                 # API client, env, token storage, error helpers
│   │   ├── pages/               # Home, 404
│   │   └── types/api.ts         # Backend response types
│   ├── nginx.conf               # SPA fallback + /api proxy for production
│   └── Dockerfile
├── docker-compose.yml
└── .github/workflows/ci.yml
```

---

## Running locally (development)

**Prerequisites:** Python 3.11+, Node 20.19+, PostgreSQL (or Docker).

### 1. Database

Start just the database from Docker Compose (needs the root `.env`; see
[Running with Docker](#running-with-docker-production-like)). It listens on `127.0.0.1:5432` and
is created with the schema and sample dropdown data:

```bash
docker compose up -d db
```

To use an existing PostgreSQL instead, point `DATABASE_URL` in `backend/.env` at it and create any
missing tables (safe on an existing database: it only adds what's missing):

```bash
psql "$DATABASE_URL" -f backend/db/schema.sql
```

### 2. Backend → http://localhost:8001 (API docs at `/docs`)

```powershell
cd backend
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements-dev.txt
copy .env.example .env            # then set DATABASE_URL and JWT_SECRET_KEY
.venv\Scripts\python -m app       # dev server with auto-reload on 127.0.0.1:8001
```

The port is 8001 (not uvicorn's usual 8000) so it doesn't collide with other local FastAPI
projects, and `python -m app` refuses to start if the port is already taken. On Windows, a plain
`uvicorn` command can silently share a busy port, and requests then reach the wrong app (404s).
Change it with `PORT=` in `backend/.env` plus `VITE_PROXY_TARGET` in `frontend/.env.local`.

Calling the venv's Python directly means you don't need to activate the virtual environment
(which PowerShell often blocks). On macOS/Linux use `.venv/bin/python`.

### 3. Frontend → http://localhost:5173

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` and `/uploads` to the backend, so no CORS setup is needed.

### Creating staff accounts in bulk

```powershell
cd backend
.venv\Scripts\python -m scripts.seed_users scripts\users.example.json
```

---

## Running with Docker (production-like)

```bash
cp .env.example .env     # set POSTGRES_PASSWORD and JWT_SECRET_KEY
docker compose up --build
```

Open http://localhost:8080. nginx serves the app and proxies `/api` + `/uploads` to the API.
The database schema is applied automatically the first time the `pgdata` volume is created.
Uploaded files persist in the `uploads` and `report_images` volumes.

---

## Configuration

Backend settings come from environment variables (or `backend/.env`); see
[backend/.env.example](backend/.env.example). The important ones:

| Variable | Default | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/postgres` | |
| `JWT_SECRET_KEY` | insecure placeholder | **Required** when `ENVIRONMENT=production` (startup fails otherwise) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated |
| `TIMEZONE` | `Asia/Kuala_Lumpur` | Used for report timestamps and the monthly points reset |
| `MAX_UPLOAD_SIZE_MB` / `MAX_IMAGES_PER_REPORT` | `10` / `5` | |

Frontend: see [frontend/.env.example](frontend/.env.example) (`VITE_API_URL` is only needed if
the API is on a different origin).

---

## API

All endpoints are under `/api/v1`. Interactive docs: http://localhost:8001/docs (disabled in production).

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/login` | – | Get a JWT (`staff_id`, `password`) |
| POST | `/auth/register` | – | Create a staff account |
| POST | `/auth/reset-password` | – | Set a new password |
| GET / PUT | `/users/me` | ✓ | Read / update own profile |
| POST | `/users/me/avatar` | ✓ | Upload profile picture (JPEG/PNG/WebP) |
| POST | `/reports/staff` | ✓ | Submit a staff observation (multipart, optional `images`) |
| POST | `/reports/visitor` | – | Submit a visitor observation |
| GET | `/lookups/locations`, `/lookups/companies` | – | Dropdown data |
| POST | `/feedback` | ✓ | Send feedback |
| GET | `/dashboard` | ✓ | Own monthly points + leaderboard |
| GET | `/health`, `/health/ready` | – | Liveness / readiness (checks DB) |

### Points rules
+1 per report · +1 per day with at least one report · +5 per day with 3+ reports. Resets on the
1st of each month (Malaysia time). Computed from `data_bank`, so they're always accurate. The
`points` table is still updated on every report for any external tools that read it.

---

## Quality checks

```bash
# Backend
cd backend
ruff check . && ruff format --check .
pytest                                   # unit tests
TEST_DATABASE_URL=postgresql://postgres:test@localhost:55432/postgres pytest   # + end-to-end (disposable DB!)

# Frontend
cd frontend
npm run lint && npm run typecheck && npm test && npm run build
```

CI runs all of the above on every push and pull request.

---

## Upgrading from v1

* **API paths changed** (e.g. `/login` → `/api/v1/auth/login`, `/form_visitor` → `/api/v1/reports/visitor`).
  The frontend in this repo is already updated.
* **Old page URLs still work**: `/form-visitor`, `/form-staff`, `/alert-staff`, `/alert-visitor` and
  `/edit-profile` redirect to their new locations, so printed QR codes and bookmarks keep working.
* **Database:** no migration needed. The same tables and columns are used; `schema.sql` only adds
  what's missing.
* **Sessions:** the JWT secret now comes from `JWT_SECRET_KEY`, so users signed in before the
  upgrade must sign in again once.
