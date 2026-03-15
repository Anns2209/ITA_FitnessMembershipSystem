from fastapi import APIRouter
from app.models import Member

router = APIRouter()

members = []

@router.get("/members")
def get_members():
    return members

@router.post("/members")
def create_member(member: Member):
    members.append(member)
    return member