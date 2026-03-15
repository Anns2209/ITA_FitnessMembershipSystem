import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_members():
    response = client.get("/members")
    assert response.status_code == 200


def test_create_member():
    response = client.post(
        "/members",
        params={
            "name": "Ana",
            "email": "ana@test.com",
            "card_id": "123"
        }
    )
    assert response.status_code == 200