"""Bulk-create staff accounts from a JSON file.

Usage (from the backend/ directory):
    python -m scripts.seed_users scripts/users.example.json

The JSON file is a list of objects with: staff_id, password, name, designation, department,
dept_qhse and optionally phone and email. Existing staff IDs are skipped.
"""

import argparse
import json
import sys
from pathlib import Path

import psycopg2

from app.core.config import get_settings
from app.core.security import hash_password

REQUIRED_FIELDS = ("staff_id", "password", "name", "designation", "department", "dept_qhse")


def load_users(path: Path) -> list[dict]:
    users = json.loads(path.read_text(encoding="utf-8"))
    for index, user in enumerate(users):
        missing = [field for field in REQUIRED_FIELDS if not user.get(field)]
        if missing:
            raise ValueError(f"User #{index + 1} is missing: {', '.join(missing)}")
    return users


def seed(users: list[dict]) -> int:
    created = 0
    with psycopg2.connect(get_settings().database_url) as conn, conn.cursor() as cur:
        for user in users:
            cur.execute(
                """
                INSERT INTO users (
                    staff_id, password, name, designation, department, dept_qhse,
                    phone_number, email, user_type
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (staff_id) DO NOTHING
                """,
                (
                    user["staff_id"],
                    hash_password(user["password"]),
                    user["name"],
                    user["designation"],
                    user["department"],
                    user["dept_qhse"],
                    user.get("phone"),
                    user.get("email"),
                    "admin" if user["department"].strip().lower() == "qhse" else "user",
                ),
            )
            created += cur.rowcount
    return created


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("file", type=Path, help="Path to a JSON file of users")
    args = parser.parse_args()

    users = load_users(args.file)
    created = seed(users)
    print(f"Created {created} user(s); skipped {len(users) - created} existing.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
