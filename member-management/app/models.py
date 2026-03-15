from sqlalchemy import Column, Integer, String
from app.database import Base

class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    card_id = Column(String)