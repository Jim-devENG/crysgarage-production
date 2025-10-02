import json
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.signing import sign_payload, EXAMPLE_BODY
from app.core.config import settings


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture()
def example_headers():
    body_obj = dict(EXAMPLE_BODY)
    body_obj["file_id"] = f"{uuid.uuid4().hex}"
    body = json.dumps(body_obj).encode()
    sig = sign_payload(settings.admin_webhook_secret, body)
    return {"X-Admin-Signature": sig}, body


@pytest.mark.parametrize("path", ["/health", "/api/v1/metrics"])
def test_health_and_metrics(client, path):
    res = client.get(path)
    assert res.status_code == 200


def test_webhook_master_finished(client, example_headers):
    headers, body = example_headers
    res = client.post("/api/v1/webhook/event", headers=headers, data=body)
    assert res.status_code == 200
    assert res.json().get("status") == "ok"


def test_webhook_missing_signature(client):
    res = client.post("/api/v1/webhook/event", json={"type": "user.signup", "user_id": "u1"})
    assert res.status_code in (401, 403)
