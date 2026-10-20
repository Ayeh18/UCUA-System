"""End-to-end tests against a real PostgreSQL database.

Skipped unless TEST_DATABASE_URL points at a *disposable* database, e.g.:
    docker run -d --name ucua-test-db -e POSTGRES_PASSWORD=test -p 55432:5432 postgres:16
    TEST_DATABASE_URL=postgresql://postgres:test@localhost:55432/postgres pytest
"""

import os
import uuid
from pathlib import Path

import psycopg2
import pytest

pytestmark = pytest.mark.skipif(
    not os.environ.get("TEST_DATABASE_URL"), reason="TEST_DATABASE_URL is not set"
)

DB_DIR = Path(__file__).resolve().parents[2] / "db"
PNG_BYTES = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64


@pytest.fixture(scope="module", autouse=True)
def database():
    url = os.environ["TEST_DATABASE_URL"]
    with psycopg2.connect(url) as conn, conn.cursor() as cur:
        cur.execute(
            "DROP TABLE IF EXISTS data_bank, data_bank_visitor, feedback, points, "
            "locations, company, users CASCADE"
        )
        cur.execute((DB_DIR / "schema.sql").read_text(encoding="utf-8"))
        cur.execute((DB_DIR / "seed_dev.sql").read_text(encoding="utf-8"))
    yield url


@pytest.fixture
def staff(client):
    staff_id = f"T{uuid.uuid4().hex[:8].upper()}"
    response = client.post(
        "/api/v1/auth/register",
        json={
            "staff_id": staff_id,
            "password": "password123",
            "name": "Test Operator",
            "designation": "Operator",
            "department": "AFE",
            "dept_qhse": "AFE",
            "phone": "0123456789",
        },
    )
    assert response.status_code == 201, response.text

    login = client.post("/api/v1/auth/login", json={"staff_id": staff_id.lower(), "password": "password123"})
    assert login.status_code == 200, login.text
    return staff_id, {"Authorization": f"Bearer {login.json()['access_token']}"}


def submit_staff_report(client, headers, files=None):
    return client.post(
        "/api/v1/reports/staff",
        headers=headers,
        data={
            "location": "Jetty 1",
            "specific_location": "Berth 3",
            "classification": "Unsafe Acts",
            "stop_work": "Yes",
            "observation": "Worker without helmet",
            "corrective_action": "Asked worker to wear helmet",
        },
        files=files,
    )


def test_readiness_reports_database_up(client):
    response = client.get("/health/ready")
    assert response.status_code == 200
    assert response.json()["database"] is True


def test_duplicate_registration_is_a_conflict(client, staff):
    staff_id, _ = staff
    response = client.post(
        "/api/v1/auth/register",
        json={
            "staff_id": staff_id.lower(),
            "password": "password123",
            "name": "Dup",
            "designation": "D",
            "department": "AFE",
            "dept_qhse": "AFE",
            "phone": "1",
        },
    )
    assert response.status_code == 409


def test_lookups(client):
    assert "Jetty 1" in client.get("/api/v1/lookups/locations").json()
    assert "TBSB" in client.get("/api/v1/lookups/companies").json()


def test_profile_update_and_avatar(client, staff):
    staff_id, headers = staff
    profile = client.get("/api/v1/users/me", headers=headers).json()
    assert profile["staff_id"] == staff_id
    assert profile["display_name"] == "Test Operator"

    updated = client.put(
        "/api/v1/users/me",
        headers=headers,
        json={
            "username": "tester",
            "email": "tester@example.com",
            "phone": "0199999999",
            "designation": "Supervisor",
            "department": "AFE",
        },
    )
    assert updated.status_code == 200, updated.text
    assert updated.json()["display_name"] == "tester"

    avatar = client.post(
        "/api/v1/users/me/avatar",
        headers=headers,
        files={"profile_pic": ("me.png", PNG_BYTES, "image/png")},
    )
    assert avatar.status_code == 200, avatar.text
    url = avatar.json()["profile_pic_url"]
    assert url.startswith("/uploads/profile_")
    assert client.get(url).content == PNG_BYTES


def test_report_submission_updates_points_and_leaderboard(client, staff):
    staff_id, headers = staff

    first = submit_staff_report(client, headers, files=[("images", ("a.png", PNG_BYTES, "image/png"))])
    assert first.status_code == 201, first.text
    assert first.json()["image_count"] == 1

    dashboard = client.get("/api/v1/dashboard", headers=headers).json()
    assert dashboard["stats"]["report_count"] == 1
    assert dashboard["stats"]["daily_points"] == 1
    assert dashboard["stats"]["total_points"] == 2
    assert dashboard["stats"]["daily_point_earned_today"] is True
    assert dashboard["stats"]["bonus_earned_today"] is False

    for _ in range(2):
        assert submit_staff_report(client, headers).status_code == 201

    stats = client.get("/api/v1/dashboard", headers=headers).json()
    assert stats["stats"]["report_count"] == 3
    assert stats["stats"]["bonus_points"] == 5
    assert stats["stats"]["total_points"] == 3 + 1 + 5
    assert stats["stats"]["bonus_earned_today"] is True
    assert any(entry["staff_id"] == staff_id for entry in stats["leaderboard"])

    with psycopg2.connect(os.environ["TEST_DATABASE_URL"]) as conn, conn.cursor() as cur:
        cur.execute("SELECT total_points FROM points WHERE staff_id = %s", (staff_id,))
        assert cur.fetchone()[0] == 9


def test_report_with_disguised_file_is_rejected(client, staff):
    _, headers = staff
    response = submit_staff_report(
        client, headers, files=[("images", ("photo.png", b"#!/bin/sh\nrm -rf /", "image/png"))]
    )
    assert response.status_code == 422


def test_visitor_report(client):
    payload = {
        "name": "Visitor",
        "phone": "0111111111",
        "designation": "Driver",
        "company": "TBSB",
        "location": "Main Gate",
        "classification": "Unsafe Conditions",
        "stop_work": "No",
        "observation": "Oil spill",
        "corrective_action": "Reported to security",
    }
    assert client.post("/api/v1/reports/visitor", data=payload).status_code == 201

    unknown = client.post("/api/v1/reports/visitor", data={**payload, "company": "Nope Sdn Bhd"})
    assert unknown.status_code == 422


def test_feedback_and_password_reset(client, staff):
    staff_id, headers = staff
    feedback = client.post(
        "/api/v1/feedback", headers=headers, json={"feedback_type": "Suggestion", "message": "Great app"}
    )
    assert feedback.status_code == 201

    reset = client.post(
        "/api/v1/auth/reset-password", json={"staff_id": staff_id, "new_password": "newpass456"}
    )
    assert reset.status_code == 200
    login = client.post("/api/v1/auth/login", json={"staff_id": staff_id, "password": "newpass456"})
    assert login.status_code == 200

    missing = client.post(
        "/api/v1/auth/reset-password", json={"staff_id": "NOPE", "new_password": "newpass456"}
    )
    assert missing.status_code == 404
