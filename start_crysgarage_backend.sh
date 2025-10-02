#!/bin/bash
exec /var/www/crysgarage.studio/backend/.venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8002 --workers 1 --log-level info --app-dir /var/www/crysgarage.studio/backend

