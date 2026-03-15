from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_members():
    response = client.get("/members")
    assert response.status_code == 200