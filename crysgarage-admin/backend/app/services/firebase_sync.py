from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.models.models import User
from datetime import datetime

async def sync_users_from_firebase(session: AsyncSession) -> dict:
    """Read-only sync: list users from Firebase Admin and upsert to local DB.
    Returns summary counts. Requires firebase-admin to be installed and env creds set.
    """
    try:
        import firebase_admin
        from firebase_admin import credentials, auth
    except Exception as e:
        return {"ok": False, "error": f"firebase_admin not available: {e}"}

    # Initialize app if not already
    if not firebase_admin._apps:
        try:
            if settings.firebase_private_key and settings.firebase_client_email and settings.firebase_project_id:
                cred = credentials.Certificate({
                    "type": "service_account",
                    "project_id": settings.firebase_project_id,
                    "private_key_id": "dummy",
                    "private_key": settings.firebase_private_key.replace('\\n', '\n'),
                    "client_email": settings.firebase_client_email,
                    "client_id": "dummy",
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/service-account"
                })
                firebase_admin.initialize_app(cred, {"projectId": settings.firebase_project_id})
            else:
                # Try default credentials (e.g., GOOGLE_APPLICATION_CREDENTIALS)
                firebase_admin.initialize_app()
        except Exception as e:
            return {"ok": False, "error": f"firebase init failed: {e}"}

    created = 0
    updated = 0
    try:
        page = auth.list_users()
        while page:
            for u in page.users:
                uid = u.uid
                email = getattr(u, 'email', None)
                name = getattr(u, 'display_name', None)
                # Upsert into Users table
                existing_q = await session.execute(select(User).where(User.user_id == uid))
                existing = existing_q.scalar_one_or_none()
                if existing:
                    changed = False
                    if email and existing.email != email:
                        existing.email = email
                        changed = True
                    if name and existing.name != name:
                        existing.name = name
                        changed = True
                    if changed:
                        updated += 1
                else:
                    session.add(User(user_id=uid, email=email, name=name, created_at=datetime.utcnow()))
                    created += 1
            page = page.get_next_page()
        await session.commit()
        return {"ok": True, "created": created, "updated": updated}
    except Exception as e:
        return {"ok": False, "error": str(e), "created": created, "updated": updated}



