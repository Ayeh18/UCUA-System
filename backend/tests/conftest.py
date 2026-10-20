import os
import tempfile
from pathlib import Path

# Settings are read once at import time, so configure the environment before importing the app.
_tmp = Path(tempfile.mkdtemp(prefix="ucua-tests-"))
os.environ.update(
    {
        "ENVIRONMENT": "test",
        "JWT_SECRET_KEY": "test-secret-key-that-is-long-enough-for-hs256",
        "UPLOAD_DIR": str(_tmp / "uploads"),
        "REPORT_IMAGE_DIR": str(_tmp / "uploaded_images"),
        "LOG_LEVEL": "WARNING",
    }
)
if test_db := os.environ.get("TEST_DATABASE_URL"):
    os.environ["DATABASE_URL"] = test_db

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
