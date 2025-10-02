## Changelog

### v1.0.0 - 2025-10-02

#### Admin Backend
- Add payments endpoints: `GET /admin/api/v1/payments`, `GET /admin/api/v1/payments/analytics`, `POST /admin/api/v1/payments/track`.
- Introduce `Payment` SQLAlchemy model; use `payment_metadata` to avoid reserved `metadata` conflict.
- Improve visitor tracking: prioritize `CF-Connecting-IP` → `X-Forwarded-For` → `X-Real-IP`; integrate `ip-api.com` geolocation.
- Fix authentication issues (`PyJWT`, `itsdangerous`), and uvicorn startup via `python -m uvicorn`.

#### Admin Frontend
- Payments tab with metrics (revenue, transactions, tier breakdown) and pagination.
- Login fix: correct endpoint path and use `application/x-www-form-urlencoded`.
- Firebase users sync button; pagination standardized to 10 per page across tabs.
- UI refinements: logo update, spacing/layout fixes across tabs.

#### Main Frontend
- Dev Mode gating refined: enable via `/dev` path or `?dev=1` when `VITE_DEV_MODE=true`.
- Payment modal integration for free tier download (set to $5).

#### Audio Mastering Service
- Auto-delete processed audio after 10 minutes.
- Stability improvements and dependency checks (Matchering).

#### Waitlist
- Frontend QR code integration; static asset deployed and linked.
- Admin listing and CSV export wiring.

#### Infrastructure
- Nginx proxy fixes and consistent API base resolution.
- Systemd service adjustments; logs and error handling improvements.

#### Documentation
- Add comprehensive `README.md` with setup, deployment, and troubleshooting.


