## CrysGarage Admin Dashboard

Standalone administrative service for Crys Garage mastering platform.

Key goals:
- Read-only ingestion by default (Firebase Admin SDK for users, DB/log reads)
- Optional, minimal webhook integration from the main app (opt-in)
- Separate codebase and deployable independently

### Repository layout

```
crysgarage-admin/
  backend/            # FastAPI service (Python 3.9+)
  frontend/           # React + TypeScript + Vite + Tailwind admin UI
  docs/               # Integration plan, runbooks
  .env.example        # Environment variables template (no secrets)
  README.md
```

### Phase plan (gated)
- PHASE 0 — Discovery & Safety (this document, env template, integration plan)
- PHASE 1 — Backend scaffolding, DB schema + migrations, webhook + tests
- PHASE 2 — Frontend skeleton + auth + tests (unit/integration/e2e)
- PHASE 3 — Real-time ingestion (webhooks or polling worker)
- PHASE 4 — Referrer slots (create/manage, conversion funnel, optional entitlement checks)
- PHASE 5 — Production deploy (Nginx/systemd) + healthchecks
- PHASE 6 — Audit, security, CI, runbooks

### Quick start (local)
1) Copy env template
```
cp .env.example .env
```

2) Backend (dev)
```
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
alembic upgrade head
pytest -q
uvicorn app.main:app --reload --port 8082
```

3) Frontend (dev)
```
cd frontend
npm ci
npm run dev
```

### Deployment (high level)
- Backend served by systemd, proxied by Nginx at `/admin/api/`
- Frontend built static and served by Nginx at `/admin/`
- All secrets via environment variables

See `docs/INTEGRATION_PLAN.md` for data ingestion strategy and optional webhooks.



