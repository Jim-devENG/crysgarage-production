#!/usr/bin/env bash
set -euo pipefail

python -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt

# Run Alembic migrations (sync driver for Postgres)
export DATABASE_URL=${DATABASE_URL:-"sqlite+aiosqlite:///./admin.db"}
if [[ "$DATABASE_URL" == postgresql* ]]; then
  alembic upgrade head
else
  alembic upgrade head
fi

exec uvicorn app.main:app --host 0.0.0.0 --port 8082
