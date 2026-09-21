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


# ---------------- INTERVIEW ANSWERS TABLE ----------------

class InterviewAnswer(Base):

    __tablename__ = "interview_answers"

    id = Column(Integer, primary_key=True, index=True)

    interview_id = Column(
        Integer,
        ForeignKey("interviews.id"),
        nullable=False
    )

    question = Column(String, nullable=False)

    skill = Column(String, nullable=True)

    answer = Column(String, nullable=True)

    score = Column(Float, nullable=True)

    feedback = Column(String, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ---------------- RESUME TABLE ----------------

class Resume(Base):

    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String)

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    skills = Column(String, nullable=True)