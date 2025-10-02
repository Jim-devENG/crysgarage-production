# Integration Plan (Discovery & Safety)

This admin service is a **separate** codebase. No main app changes are required. Optional webhooks are provided as an opt-in for real-time updates.

## Data sources (read-only by default)
- Firebase Admin SDK: list users, read custom claims, last sign-in, creation timestamps
- Admin DB (new): persists normalized events (`uploads`, `masters`, `errors`, `referrer_*`)
- Optional ingestion from logs: parse FastAPI/Nginx logs for fallback signals

## Webhook (optional, small PR to main app)
- Main app POSTs to `POST /api/v1/webhook/event` with header `X-Admin-Signature: <HMAC>` (HMAC-SHA256 over raw body using ADMIN_WEBHOOK_SECRET)
- Event types:
  - `user.signup` { user_id, email, referrer_code? }
  - `upload.finished` { upload_id, user_id, filename, size, created_at }
  - `master.finished` { file_id, user_id, tier, genre, preset, input_size, output_size, format, sample_rate, status, ffmpeg_stderr?, location, referrer_code? }
  - `master.failed` { file_id, user_id, tier, error_message, ffmpeg_stderr }

Security: HMAC verification + timestamp tolerance. Admin logs mismatches and 403s invalid signatures.

## What is read without changing main app
- Firebase users
- Admin’s own DB (populated by webhooks or optional polling)
- Optional: tail/log parse of main app logs (if provided path/permissions) – not required.

## Secrets checklist (not in repo)
- `ADMIN_WEBHOOK_SECRET` (HMAC key)
- `DATABASE_URL` (Postgres in production; sqlite in dev)
- `FIREBASE_*` (service account values)
- `REDIS_URL` (optional)

## Minimal optional PR to main app (pseudo)
- On signup → POST `user.signup`
- After upload processed → POST `upload.finished`
- On mastering success/fail → POST `master.finished`/`master.failed`
- Include `referrer_code` if present in query/session

This PR is optional and must be opt-in via env flag in the main app. No behavior changes if disabled.
