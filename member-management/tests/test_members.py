import sys
import os
from types import SimpleNamespace

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.routes import repo

client = TestClient(app)


def test_get_members(monkeypatch):
    monkeypatch.setattr(repo, "get_members", lambda db: [])

    response = client.get("/members")

    assert response.status_code == 200


def test_create_member(monkeypatch):
    monkeypatch.setattr(
        repo,
        "create_member",
        lambda db, name, email, card_id: SimpleNamespace(
            id=1,
            name=name,
            email=email,
            card_id=card_id,
        ),
    )

    response = client.post(
        "/members",
        params={
            "name": "Ana",
            "email": "ana@test.com",
            "card_id": "123"
        }
    )

    assert response.status_code == 200
