from sqlalchemy.orm import Session
from app.models import Member


class MemberRepository:

    def get_members(self, db: Session):
        return db.query(Member).all()

    def create_member(self, db: Session, name: str, email: str, card_id: str):
        member = Member(name=name, email=email, card_id=card_id)
        db.add(member)
        db.commit()
        db.refresh(member)
        return member