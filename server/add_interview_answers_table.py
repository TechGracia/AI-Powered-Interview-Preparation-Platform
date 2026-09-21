from database import engine
from models import InterviewAnswer

print("Creating interview_answers table...")

InterviewAnswer.__table__.create(
    bind=engine,
    checkfirst=True
)

print("✅ interview_answers table is ready.")