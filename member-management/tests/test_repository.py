from app.repository import MemberRepository
from app.database import SessionLocal

repo = MemberRepository()


def test_create_member():
    db = SessionLocal()

    member = repo.create_member(db, "Ana", "ana@test.com", "123")

    assert member.name == "Ana"
    assert member.email == "ana@test.com"

    db.close()