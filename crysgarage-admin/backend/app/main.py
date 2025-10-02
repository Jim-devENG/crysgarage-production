from fastapi import FastAPI
from app.api.v1.routes import router as core_router
from app.api.v1.webhook import router as webhook_router
from app.api.v1.auth import router as auth_router
from app.core.config import settings
from app.db.base import engine
from app.models.models import Base
# Ensure models are imported so tables are registered on Base.metadata
from app.models import models as _models  # noqa: F401

app = FastAPI(title="CrysGarage Admin API", version="0.1.0")

@app.on_event("startup")
async def on_startup():
    if settings.database_url.startswith("sqlite"):
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

app.include_router(auth_router)
app.include_router(core_router)
app.include_router(webhook_router)

@app.get("/health")
async def health():
    return {"status": "ok"}
