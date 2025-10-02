import json
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.db.base import AsyncSessionLocal
from app.models.models import User, Master, ErrorLog, ReferrerSlot
from sqlalchemy import delete

_counter = 0

def uid(prefix: str) -> str:
    global _counter
    _counter += 1
    return f"{prefix}{_counter}"

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture(autouse=True)
async def cleanup_db():
    async with AsyncSessionLocal() as s:
        # clean tables between tests for determinism
        for model in (Master, User, ErrorLog, ReferrerSlot):
            await s.execute(delete(model))
        await s.commit()
    yield


def test_00_metrics_empty(client):
    res = client.get("/api/v1/metrics")
    assert res.status_code == 200
    data = res.json()
    assert data["uploads"] == 0
    assert data["masters"] == 0
    assert data["failed"] == 0

async def _seed_basic():
    async with AsyncSessionLocal() as s:
        u = User(user_id=uid("u"), email="a@b.com")
        s.add(u)
        s.add(Master(file_id=uid("f"), user_id=u.user_id, tier="free", status="success"))
        s.add(Master(file_id=uid("f"), user_id=u.user_id, tier="free", status="failed"))
        s.add(ErrorLog(source="test", message="oops"))
        s.add(ReferrerSlot(code=uid("SLOT"), created_by="admin"))
        await s.commit()
        return u

@pytest.mark.asyncio
async def test_users_and_masters_lists(client):
    u = await _seed_basic()
    r1 = client.get("/api/v1/users")
    assert r1.status_code == 200
    assert any(x["user_id"] == u.user_id for x in r1.json())

    r2 = client.get("/api/v1/masters")
    assert r2.status_code == 200
    assert len(r2.json()) >= 2

    mid = r2.json()[0]["file_id"]
    r3 = client.get(f"/api/v1/masters/{mid}")
    assert r3.status_code == 200
    assert r3.json()["file_id"] == mid

    r4 = client.get("/api/v1/logs")
    assert r4.status_code == 200
    assert len(r4.json()) >= 1

@pytest.mark.asyncio
async def test_referrer_slots_crud(client):
    code = uid("S")
    r1 = client.post("/api/v1/referrer/slots", params={"code":code,"created_by":"root","max_uses":5})
    assert r1.status_code == 200
    sid = r1.json()["slot_id"]

    r2 = client.get("/api/v1/referrer/slots")
    assert r2.status_code == 200
    assert any(s["code"] == code for s in r2.json())

    r3 = client.post(f"/api/v1/referrer/slots/{sid}/revoke")
    assert r3.status_code == 200
    r4 = client.get("/api/v1/referrer/slots")
    assert any(not s["enabled"] for s in r4.json() if s["slot_id"] == sid)
