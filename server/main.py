from fastapi import FastAPI, File, UploadFile, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
import fitz
from datetime import datetime, timezone
import json
import re
from models import Interview, User, Resume
from auth import decode_token, create_access_token
from database import engine, SessionLocal
from passlib.context import CryptContext
import random
import smtplib
from email.message import EmailMessage
from datetime import timedelta

# ---------------- AI SETUP ----------------

# ---------------- AI SETUP ----------------

from dotenv import load_dotenv
import os
import google.generativeai as genai

load_dotenv()

# ❌ REMOVE THIS (security issue - prints API key)
# print("API KEY:", os.getenv("GEMINI_API_KEY"))   # ❌ REMOVE

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


# ---------------- DB ----------------

Interview.metadata.create_all(bind=engine)
User.metadata.create_all(bind=engine)
Resume.metadata.create_all(bind=engine)
# ---------------- APP ----------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- PASSWORD ----------------

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

# ---------------- OTP STORAGE ----------------

otp_store = {}

SENDER_EMAIL = "graciasharon310@gmail.com"
APP_PASSWORD = os.getenv("EMAIL_APP_PASSWORD")

#------ Generate OTP -------
def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp_email(receiver_email, otp):
    msg = EmailMessage()
    msg.set_content(f"Your OTP is: {otp}")
    msg['Subject'] = "OTP Verification"
    msg['From'] = SENDER_EMAIL
    msg['To'] = receiver_email

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
        smtp.login(SENDER_EMAIL, APP_PASSWORD)
        smtp.send_message(msg)

# ---------------- AUTH ----------------

@app.post("/register")
async def register(data: dict):
    db = SessionLocal()
    try:
        email = data.get("email")
        password = data.get("password")

        if db.query(User).filter(User.email == email).first():
            raise HTTPException(status_code=400, detail="User exists")

        otp = generate_otp()

        otp_store[email] = {
            "otp": otp,
            "expiry": datetime.now(timezone.utc) + timedelta(minutes=2),
            "attempts": 0,
            "password": password
        }

        send_otp_email(email, otp)

        return {"message": "OTP sent"}

    finally:
        db.close()

#------LOGIN-------
@app.post("/login")
async def login(data: dict):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == data.get("email")).first()

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        if not pwd_context.verify(data.get("password"), user.password):
            raise HTTPException(status_code=401, detail="Wrong password")

        token = create_access_token({"sub": user.email})
        return {"access_token": token}

    finally:
        db.close()

#------VERIFY - OTP------
@app.post("/verify-otp")
async def verify_otp(data: dict):
    db = SessionLocal()

    try:
        email = data.get("email")
        otp_input = data.get("otp")

        if email not in otp_store:
            raise HTTPException(status_code=400, detail="No OTP found")

        record = otp_store[email]

        if datetime.now(timezone.utc) > record["expiry"]:
            del otp_store[email]
            raise HTTPException(status_code=400, detail="OTP expired")

        if record["attempts"] >= 3:
            del otp_store[email]
            raise HTTPException(status_code=400, detail="Too many attempts")

        if otp_input != record["otp"]:
            record["attempts"] += 1
            raise HTTPException(status_code=400, detail="Invalid OTP")

        # ✅ CREATE USER HERE
        user = User(
            email=email,
            password=hash_password(record["password"])
        )

        db.add(user)
        db.commit()

        token = create_access_token({"sub": email})

        del otp_store[email]

        return {
            "message": "Verified",
            "access_token": token
        }

    finally:
        db.close()

#---------- Resend OTP -----
@app.post("/resend-otp")
async def resend_otp(data: dict):
    email = data.get("email")

    if not email:
        raise HTTPException(status_code=400, detail="Email required")

    otp = generate_otp()

    otp_store[email] = {
        "otp": otp,
        "expiry": datetime.now(timezone.utc) + timedelta(minutes=2),
        "attempts": 0,
        "password": otp_store.get(email, {}).get("password", "")
    }

    send_otp_email(email, otp)

    return {"message": "OTP resent"}

# ---------------- SKILLS ----------------

def extract_skills(text):
    skills_list = [
    "python", "java", "javascript", "react", "node",
    "sql", "mongodb", "mysql", "html", "css",
    "machine learning", "deep learning", "nlp",
    "fastapi", "django", "flask",
    "c++", "data structures", "algorithms",
    "system design", "api", "rest"
]
    return [s for s in skills_list if s in text.lower()]

# ---------------- QUESTIONS ----------------

def generate_questions_ai(skills):
    try:
        prompt = f"""
Generate 6 technical interview questions for:
{skills}

Return ONLY JSON array:
[
  {{"question": "..."}},
  {{"question": "..."}}
]
"""

        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        text = response.text

        match = re.search(r"\[.*\]", text, re.S)

        if match:
            return json.loads(match.group())

        # fallback
        return [{"question": f"Explain {s}"} for s in skills[:3]]

    except Exception as e:
        print("AI QUESTION FAILED:", e)

        # fallback if AI fails
        return [{"question": f"Explain {s}"} for s in skills[:3]]


# ---------------- RESUME ----------------

@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="No token")

    db = SessionLocal()

    try:
        token = authorization.split(" ")[1]
        email = decode_token(token)["sub"]

        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid user")

        # Extract text
        pdf = fitz.open(stream=await file.read(), filetype="pdf")
        text = "".join([p.get_text() for p in pdf])

        skills = extract_skills(text)
        if not skills:
            skills = ["general programming", "problem solving"]
        questions = generate_questions_ai(skills)

        # 🔥 SAVE RESUME IN DB
        new_resume = Resume(
            user_id=user.id,
            filename=file.filename
        )

        db.add(new_resume)
        db.commit()

        return {
            "skills": skills,
            "questions": questions
        }

    finally:
        db.close()



# ---------------- EVALUATE ----------------

@app.post("/evaluate-answer")
async def evaluate(data: dict):
    question = data.get("question", "")
    answer = data.get("answer", "")

    try:
        prompt = f"""
You are an expert interviewer.

Question: {question}
Answer: {answer}

Return ONLY JSON:
{{
    "score": number (0-10),
    "feedback": "short feedback"
}}
"""

        # ✅ FIX: use ONLY generate_text (already correct)
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        text = response.text
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            result = json.loads(match.group())
        else:
            raise Exception("Invalid AI response")

        return {
            "score": result.get("score", 5),
            "feedback": result.get("feedback", "Good answer")
        }

    except Exception as e:
        print("AI FAILED:", e)

        # 🔁 fallback (unchanged)
        answer_lower = answer.lower()
        word_count = len(answer_lower.split())

        score = 0

        if word_count > 50:
            score += 4
        elif word_count > 20:
            score += 3
        elif word_count > 10:
            score += 2
        else:
            score += 1

        keywords = question.lower().split()
        match_count = sum(1 for w in keywords if w in answer_lower)

        if match_count > 5:
            score += 4
        elif match_count > 2:
            score += 3
        else:
            score += 2

        if "." in answer:
            score += 2

        score = min(score, 10)

        if score >= 8:
            feedback = "Excellent answer with strong explanation."
        elif score >= 6:
            feedback = "Good answer, add more depth."
        elif score >= 4:
            feedback = "Basic understanding, improve clarity."
        else:
            feedback = "Answer is too short or unclear."

        return {
            "score": score,
            "feedback": feedback
        }

# ---------------- SAVE ----------------

@app.post("/save-interview")
async def save_interview(data: dict, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No token")

    db = SessionLocal()
    try:
        token = authorization.split(" ")[1]
        email = decode_token(token)["sub"]

        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid user")

        interview = Interview(
            score=data.get("score"),
            total_questions=data.get("total_questions"),
            user_id=user.id,
            date=datetime.now(timezone.utc)
        )

        db.add(interview)
        db.commit()

        return {"message": "Saved"}

    finally:
        db.close()

# ---------------- HISTORY ----------------

@app.get("/interview-history")
async def history(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No token")

    db = SessionLocal()
    try:
        token = authorization.split(" ")[1]
        email = decode_token(token)["sub"]

        user = db.query(User).filter(User.email == email).first()

        return [
            {
                "date": i.date.isoformat(),
                "score": i.score,
                "total_questions": i.total_questions
            }
            for i in db.query(Interview).filter(Interview.user_id == user.id)
        ]

    finally:
        db.close()
@app.get("/leaderboard")
async def leaderboard():
    db = SessionLocal()
    try:
        interviews = db.query(Interview).order_by(Interview.score.desc()).limit(10).all()

        result = []

        for i in interviews:
            user = db.query(User).filter(User.id == i.user_id).first()

            result.append({
                "email": user.email if user else "Unknown",
                "score": i.score,
                "date": i.date.isoformat()
            })

        return result

    finally:
        db.close()
@app.get("/resume-count")
async def resume_count(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No token")

    db = SessionLocal()
    try:
        token = authorization.split(" ")[1]
        email = decode_token(token)["sub"]

        user = db.query(User).filter(User.email == email).first()

        count = db.query(Resume).filter(Resume.user_id == user.id).count()

        return {"count": count}

    finally:
        db.close()
        #uvicorn main:app --reload