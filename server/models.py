from sqlalchemy import Column, Integer, Float, DateTime, String, ForeignKey
from datetime import datetime
from database import Base


# ---------------- USER TABLE ----------------

class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)


# ---------------- INTERVIEW TABLE ----------------

class Interview(Base):

    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)

    score = Column(Float)

    total_questions = Column(Integer)

    date = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"))


# ---------------- RESUME TABLE (ADD THIS) ----------------

class Resume(Base):

    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String)

    uploaded_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"))