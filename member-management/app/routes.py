from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.repository import MemberRepository
import logging

router = APIRouter()

logger = logging.getLogger(__name__)
repo = MemberRepository()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/members")
def create_member(name: str, email: str, card_id: str, db: Session = Depends(get_db)):
    logger.info(f"Creating member {name}")

    member = repo.create_member(db, name, email, card_id)

    logger.info(f"Member created with id={member.id}")

    return member


@router.get("/members")
def get_members(db: Session = Depends(get_db)):
    logger.info("Fetching members")

    members = repo.get_members(db)

    logger.info(f"{len(members)} members returned")

    return members