from unittest.mock import MagicMock

from app.repository import MemberRepository

repo = MemberRepository()


def test_create_member():
    db = MagicMock()

    member = repo.create_member(db, "Ana", "ana@test.com", "123")

    assert member.name == "Ana"
    assert member.email == "ana@test.com"
    db.add.assert_called_once_with(member)
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(member)
