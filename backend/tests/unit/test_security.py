from datetime import timedelta

import pytest

from app.core.security import (
    InvalidTokenError,
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_password_hash_round_trip():
    hashed = hash_password("s3cret-pass")
    assert hashed != "s3cret-pass"
    assert verify_password("s3cret-pass", hashed)
    assert not verify_password("wrong-pass", hashed)


def test_verify_password_handles_malformed_hash():
    assert not verify_password("anything", "not-a-bcrypt-hash")


def test_access_token_round_trip():
    token = create_access_token("AFE0026")
    assert decode_access_token(token) == "AFE0026"


def test_expired_token_is_rejected():
    token = create_access_token("AFE0026", expires_delta=timedelta(seconds=-1))
    with pytest.raises(InvalidTokenError, match="expired"):
        decode_access_token(token)


def test_tampered_token_is_rejected():
    token = create_access_token("AFE0026")
    with pytest.raises(InvalidTokenError):
        decode_access_token(token[:-2] + ("aa" if not token.endswith("aa") else "bb"))
