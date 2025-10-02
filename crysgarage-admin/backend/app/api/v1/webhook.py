from fastapi import APIRouter, Header, HTTPException, Depends, Request
from itsdangerous import TimestampSigner, BadSignature
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.db.base import get_session
from app.models.models import Master, Upload, User, ErrorLog
from datetime import datetime
import hmac
import hashlib
from typing import Optional

router = APIRouter(prefix="/api/v1/webhook", tags=["webhook"])

def verify_hmac(body: bytes, signature: Optional[str]) -> None:
    if not signature:
        raise HTTPException(status_code=401, detail="Missing signature")
    secret = settings.admin_webhook_secret.encode()
    mac = hmac.new(secret, body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(mac, signature):
        raise HTTPException(status_code=403, detail="Invalid signature")

@router.post("/event")
async def ingest_event(
    request: Request,
    x_admin_signature: Optional[str] = Header(default=None, alias="X-Admin-Signature"),
    session: AsyncSession = Depends(get_session),
):
    body = await request.body()
    verify_hmac(body, x_admin_signature)
    payload = await request.json()
    etype = payload.get("type")

    try:
        if etype == "user.signup":
            uid = payload["user_id"]
            user = User(user_id=uid, email=payload.get("email"), created_at=datetime.utcnow())
            session.add(user)
            await session.commit()
            return {"status": "ok"}

        if etype == "upload.finished":
            rec = Upload(
                upload_id=payload["upload_id"],
                user_id=payload["user_id"],
                filename=payload.get("filename"),
                size=payload.get("size"),
                created_at=datetime.utcnow(),
                file_url=payload.get("file_url"),
            )
            session.add(rec)
            await session.commit()
            return {"status": "ok"}

        if etype in ("master.finished", "master.failed"):
            file_id = payload["file_id"]
            existing_q = await session.execute(select(Master).where(Master.file_id == file_id))
            existing = existing_q.scalar_one_or_none()
            fields = dict(
                user_id=payload["user_id"],
                tier=payload.get("tier"),
                genre=payload.get("genre"),
                preset=payload.get("preset"),
                input_size=payload.get("input_size"),
                output_size=payload.get("output_size"),
                format=payload.get("format"),
                sample_rate=payload.get("sample_rate"),
                status="failed" if etype == "master.failed" else payload.get("status", "success"),
                ffmpeg_stderr=payload.get("ffmpeg_stderr"),
                location=payload.get("location"),
                referrer_code=payload.get("referrer_code"),
            )
            if existing:
                for k, v in fields.items():
                    setattr(existing, k, v)
                if etype == "master.finished":
                    existing.completed_at = datetime.utcnow()
                await session.commit()
            else:
                rec = Master(
                    file_id=file_id,
                    created_at=datetime.utcnow(),
                    completed_at=datetime.utcnow() if etype == "master.finished" else None,
                    **fields,
                )
                session.add(rec)
                await session.commit()
            return {"status": "ok"}

        err = ErrorLog(source="webhook", message=f"Unknown event: {etype}", traceback=None)
        session.add(err)
        await session.commit()
        raise HTTPException(status_code=400, detail="Unknown event type")

    except KeyError as e:
        err = ErrorLog(source="webhook", message=f"Missing field: {e}", traceback=None)
        session.add(err)
        await session.commit()
        raise HTTPException(status_code=422, detail=f"Missing field: {e}")

