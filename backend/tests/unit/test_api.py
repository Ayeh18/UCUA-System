"""API tests that don't need a database: the connection dependency is replaced with a mock."""

from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token, hash_password
from app.db.database import get_db
from app.main import app
from app.repositories.user_repository import UserRepository


@pytest.fixture
def api(client):
    app.dependency_overrides[get_db] = lambda: MagicMock()
    yield client
    app.dependency_overrides.clear()


def test_health(api):
    response = api.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert "X-Request-ID" in response.headers


@pytest.mark.parametrize(
    ("method", "path"),
    [
        ("get", "/api/v1/users/me"),
        ("get", "/api/v1/dashboard"),
        ("post", "/api/v1/feedback"),
        ("post", "/api/v1/reports/staff"),
    ],
)
def test_protected_endpoints_require_token(api, method, path):
    response = getattr(api, method)(path)
    assert response.status_code == 401


def test_invalid_token_is_rejected(api):
    response = api.get("/api/v1/users/me", headers={"Authorization": "Bearer not-a-jwt"})
    assert response.status_code == 401


def test_register_validates_password_length(api):
    response = api.post(
        "/api/v1/auth/register",
        json={
            "staff_id": "X1",
            "password": "123",
            "name": "N",
            "designation": "D",
            "department": "AFE",
            "dept_qhse": "AFE",
            "phone": "1",
        },
    )
    assert response.status_code == 422


def test_login_success_and_failure(api, monkeypatch):
    stored = {"staff_id": "AFE0026", "password": hash_password("correct-horse")}
    monkeypatch.setattr(UserRepository, "get_credentials", lambda self, staff_id: stored)

    ok = api.post("/api/v1/auth/login", json={"staff_id": "afe0026", "password": "correct-horse"})
    assert ok.status_code == 200
    body = ok.json()
    assert body["token_type"] == "bearer"
    assert body["expires_in"] > 0

    bad = api.post("/api/v1/auth/login", json={"staff_id": "afe0026", "password": "wrong"})
    assert bad.status_code == 401
    assert bad.json()["detail"] == "Invalid staff ID or password"


def test_staff_report_rejects_invalid_classification(api):
    token = create_access_token("AFE0026")
    response = api.post(
        "/api/v1/reports/staff",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "location": "Jetty 1",
            "classification": "Something Else",
            "stop_work": "No",
            "observation": "obs",
            "corrective_action": "act",
        },
    )
    assert response.status_code == 422


def test_unexpected_errors_do_not_leak_details(api, monkeypatch):
    def boom(self, staff_id):
        raise RuntimeError("relation users does not exist")

    monkeypatch.setattr(UserRepository, "get_credentials", boom)
    with TestClient(app, raise_server_exceptions=False) as raw_client:
        response = raw_client.post("/api/v1/auth/login", json={"staff_id": "a", "password": "b"})
    assert response.status_code == 500
    assert response.json() == {"detail": "Internal server error"}
