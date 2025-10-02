## CrysGarage Production

Modern audio mastering platform with admin dashboard, visitor tracking, payments analytics, waitlist onboarding, and a Python mastering microservice.

### Monorepo Layout
- `crysgarage-frontend/`: Main site (React + Vite + Tailwind)
- `crysgarage-admin/`
  - `frontend/`: Admin dashboard (React + Vite + Tailwind)
  - `backend/`: Admin API (FastAPI + SQLAlchemy + aiosqlite)
- `audio-mastering-service/`: Mastering API (FastAPI + Matchering)
- `waitlist-backend/`: Waitlist API (FastAPI + SQLite)
- `waitlist-frontend/`: Static HTML form (deployed under Nginx)

### Key Features
- Admin authentication (JWT) and role support
- Real-time Firebase user sync into Admin Users
- Visitor tracking with accurate IP geolocation and UA parsing
- Payments tracking and analytics (endpoints + admin UI)
- Waitlist registration with admin listing and CSV export
- Audio mastering pipeline with 10-minute auto cleanup
- Production deployments via Nginx + systemd

## Prerequisites
- Node.js ≥ 18, PNPM or NPM
- Python ≥ 3.9 (venv recommended)
- SQLite (bundled)
- Nginx (production)
- Systemd (production services/timers)

## Environment Configuration

Create environment files as needed. Examples below are minimal.

### Admin Backend (`crysgarage-admin/backend/.env`)
```
SECRET_KEY=change-me
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=4320

# CORS
ALLOWED_ORIGINS=https://crysgarage.studio,https://www.crysgarage.studio

# Firebase Admin SDK
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=...
```

### Admin Frontend (`crysgarage-admin/frontend/.env`)
```
VITE_ADMIN_BASE=https://crysgarage.studio/admin
```

### Frontend (`crysgarage-frontend/.env`)
```
VITE_API_BASE=https://crysgarage.studio
VITE_DEV_MODE=false
```

### Mastering Service (`audio-mastering-service/.env`)
```
PORT=8002
UPLOAD_DIR=/var/www/mastering/uploads
OUTPUT_DIR=/var/www/mastering/processed
```

### Waitlist Backend (`waitlist-backend/.env`)
```
PORT=8083
DATABASE_URL=sqlite+aiosqlite:///./waitlist.db
ALLOWED_ORIGINS=https://crysgarage.studio
```

## Install & Run (Development)

### Admin Backend
```bash
cd crysgarage-admin/backend
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8082 --reload
```

### Admin Frontend
```bash
cd crysgarage-admin/frontend
pnpm i # or npm i
pnpm dev # or npm run dev
```

### Main Frontend
```bash
cd crysgarage-frontend
pnpm i
pnpm dev
```

### Mastering Service
```bash
cd audio-mastering-service
python3 -m venv venv && . venv/bin/activate
pip install -r requirements.txt
python main.py
```

### Waitlist Backend (optional if using static form only)
```bash
cd waitlist-backend
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8083 --reload
```

## Production

### Nginx (high level)
- Serve `crysgarage-frontend` build at `/`
- Serve admin frontend under `/admin/`
- Proxy admin API to `http://127.0.0.1:8082`
- Proxy mastering service to `http://127.0.0.1:8002`
- Serve waitlist static under `/waitlist/`

Make sure to forward client IP headers: `CF-Connecting-IP`, `X-Forwarded-For`, `X-Real-IP`.

### Systemd
- `crysgarage-admin-backend.service`: runs FastAPI (uvicorn) for admin
- `audio-mastering.service`: runs mastering API
- Optional timer/service for Firebase sync if used outside request path

### Build & Deploy
```bash
# Frontends
cd crysgarage-admin/frontend && pnpm build
cd ../../crysgarage-frontend && pnpm build

# Rsync or copy build outputs to Nginx web root
# Restart services
sudo systemctl restart crysgarage-admin-backend
sudo systemctl restart audio-mastering
sudo systemctl reload nginx
```

## Admin Dashboard

### Login
- Endpoint: `/admin/api/v1/auth/login` (OAuth2 form: username, password)

### Tabs
- Users: Sourced from Firebase; auto/manuel sync (button)
- Masters: Live from mastering + history
- Logs: App/system errors, paginated
- Access: Dev/partner audit trail
- Visitors: Real IP geolocation via `ip-api.com`
- Payments: Paginated list + analytics
- Waitlist: Registrations list with CSV export

### Payments API
- `GET /admin/api/v1/payments?limit=10&offset=0`
- `GET /admin/api/v1/payments/analytics`
- `POST /admin/api/v1/payments/track` body params:
  - `user_id`, `user_email`, `amount`, `tier`, `credits`, optional `payment_reference`, `payment_provider`, `payment_metadata`

Add a provider webhook (e.g., Paystack) to upsert completed charges in real-time.

## Visitor Tracking
- Frontend calls `POST /admin/api/v1/visitors/track`
- Backend resolves IP using `CF-Connecting-IP` → `X-Forwarded-For` → `X-Real-IP` → socket
- Geolocation via `http://ip-api.com/json/{ip}`

## Mastering Service
- Upload, process, and provide downloads
- Auto-deletes processed files after 10 minutes

## Waitlist
- Frontend form (React or static HTML) posts to `/api/waitlist/register`
- Admin listing via `/api/waitlist/list`
- QR code is available under waitlist page; image deployed under Nginx publish dir

## Development Notes
- Use `VITE_DEV_MODE` with `/dev` path or `?dev=1` to enable dev mode when needed
- Avoid hardcoding localhost URLs; prefer env-based bases

## Security
- JWT for admin endpoints
- CORS restricted to site origins
- Basic security headers at Nginx

## Troubleshooting
- 401 Unauthorized: Re-login in admin to refresh token
- 502/Bad Gateway: Check systemd service status and logs (uvicorn path, missing deps)
- Visitors location incorrect: Verify IP headers are forwarded and `ip-api.com` reachable
- Payments empty: Ensure `payments` table exists and webhook/track calls are enabled
- Mastering slow/503: Confirm `matchering` installed in venv and service running

## Contributing
1. Create a feature branch
2. Commit with clear messages
3. Open PR to `master`

## License
Proprietary – CrysGarage. All rights reserved.

# Public Assets Directory

This directory contains static assets that will be served directly by the web server.

## Logo File

The Crys Garage logo is available as:
- `CRG_Logo_svg.svg` - Official Crys Garage logo in vector format

The logo features:
- Golden metallic texture with concentric circles
- Stylized "G" symbol in the center
- High resolution vector format
- Professional branding design

The logo is automatically used in:
- Header navigation
- Loading screen
- Landing page hero section
- Footer

## File Structure
```
public/
├── CRG_Logo_svg.svg  ← Official Crys Garage logo
└── README.md
```

# Crys Garage Production

Small CI trigger note to run Auto Deploy to VPS.

CI trigger: 2025-09-15T12:59ZCI trigger Mon 15/09/2025 14:33:57.30 
