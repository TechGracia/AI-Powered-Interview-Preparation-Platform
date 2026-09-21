from fastapi import FastAPI, File, UploadFile, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
import fitz
from datetime import datetime, timezone
import json
import re
from models import User, Interview, InterviewAnswer, Resume
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
InterviewAnswer.metadata.create_all(bind=engine)
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

# ---------------- FUNCTION: hash_password ----------------
def hash_password(password: str):
    return pwd_context.hash(password)

# ---------------- OTP STORAGE ----------------

otp_store = {}

SENDER_EMAIL = "graciasharon310@gmail.com"
APP_PASSWORD = os.getenv("EMAIL_APP_PASSWORD")

#------ Generate OTP -------
# ---------------- FUNCTION: generate_otp ----------------
def generate_otp():
    return str(random.randint(100000, 999999))

# ---------------- FUNCTION: send_otp_email ----------------
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
# ---------------- FUNCTION: register ----------------
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
# ---------------- FUNCTION: login ----------------
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
# ---------------- FUNCTION: verify_otp ----------------
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
# ---------------- FUNCTION: resend_otp ----------------
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

# ---------------- FUNCTION: extract_skills ----------------
def extract_skills(text):
    """
    Extract skills from resume text using word-boundary matching.
    This avoids false matches such as detecting "c" inside normal words.
    """
    skills_list = [
        "python", "java", "javascript", "typescript", "c++", "c#",
        "react", "angular", "vue", "node.js", "express",
        "html", "css", "tailwind", "svelte", "sveltekit",
        "fastapi", "django", "flask",
        "sql", "mysql", "postgresql", "sqlite", "mongodb", "nosql",
        "aws", "azure", "gcp", "docker", "kubernetes", "git", "github",
        "machine learning", "deep learning", "artificial intelligence",
        "nlp", "data science", "pandas", "numpy", "scikit-learn",
        "tensorflow", "pytorch",
        "data structures", "algorithms", "system design",
        "api", "rest api", "rest", "graphql",
        "cybersecurity", "penetration testing",
        "power bi", "tableau",
        "communication", "problem solving", "teamwork", "leadership",
    ]

    text_lower = text.lower()
    found = []

    for skill in skills_list:
        pattern = rf"(?<!\w){re.escape(skill)}(?!\w)"
        if re.search(pattern, text_lower):
            found.append(skill)

    return list(dict.fromkeys(found))


# ---------------- QUESTIONS ----------------

# ---------------- FUNCTION: _fallback_question_for_skill ----------------
def _fallback_question_for_skill(skill, index=0):
    """Return a short skill-specific fallback question."""
    fallback_questions = {
        "python": [
            "What is the difference between a list and a tuple in Python?",
            "Explain Python functions and when you would use them.",
            "What are decorators in Python and why are they useful?",
        ],
        "java": [
            "What is the difference between an interface and an abstract class in Java?",
            "Explain inheritance in Java with a simple example.",
            "What is exception handling in Java?",
        ],
        "javascript": [
            "What is the difference between let, const and var in JavaScript?",
            "Explain closures in JavaScript.",
            "How does asynchronous programming work in JavaScript?",
        ],
        "typescript": [
            "What is the difference between TypeScript and JavaScript?",
            "What are interfaces in TypeScript?",
            "How does TypeScript improve type safety?",
        ],
        "react": [
            "What is the difference between props and state in React?",
            "What are React hooks and why are they useful?",
            "How does useEffect work in React?",
        ],
        "node.js": [
            "What is Node.js and why is it useful for backend development?",
            "How does Node.js handle asynchronous operations?",
            "What is the purpose of Express.js in a Node.js application?",
        ],
        "sql": [
            "What is the difference between WHERE and HAVING in SQL?",
            "What is the difference between INNER JOIN and LEFT JOIN?",
            "What are database indexes and why are they useful?",
        ],
        "mongodb": [
            "What is MongoDB and how is it different from a relational database?",
            "What is a MongoDB collection?",
            "How would you improve MongoDB query performance?",
        ],
        "fastapi": [
            "What is FastAPI and why is it used?",
            "How does request validation work in FastAPI?",
            "How would you implement authentication in FastAPI?",
        ],
        "django": [
            "What is Django and why is it used?",
            "What is the Django ORM?",
            "How does authentication work in Django?",
        ],
        "flask": [
            "What is Flask and when would you use it?",
            "How do routes work in Flask?",
            "How would you handle authentication in Flask?",
        ],
        "docker": [
            "What is Docker and why is it useful?",
            "What is the difference between a Docker image and a container?",
            "What is a Dockerfile used for?",
        ],
        "aws": [
            "What is AWS and why is it used?",
            "What is the difference between EC2 and S3?",
            "How would you deploy a web application on AWS?",
        ],
        "git": [
            "What is Git and why is it used?",
            "What is the difference between git merge and git rebase?",
            "How do branches work in Git?",
        ],
        "data structures": [
            "What is the difference between a stack and a queue?",
            "When would you use a hash table?",
            "What is the difference between an array and a linked list?",
        ],
        "algorithms": [
            "What is the time complexity of binary search?",
            "What is the difference between BFS and DFS?",
            "How would you choose an algorithm for a large dataset?",
        ],
        "system design": [
            "What are the main components you consider when designing a scalable system?",
            "How would you design a system to handle high traffic?",
            "What is the purpose of caching in system design?",
        ],
        "api": [
            "What is an API and why is it useful?",
            "What is the difference between authentication and authorization in an API?",
            "How would you handle errors in an API?",
        ],
        "rest": [
            "What is a REST API?",
            "What is the difference between GET, POST, PUT and DELETE?",
            "How would you secure a REST API?",
        ],
        "rest api": [
            "What is a REST API?",
            "What is the difference between GET, POST, PUT and DELETE?",
            "How would you secure a REST API?",
        ],
        "graphql": [
            "What is GraphQL and how does it differ from REST?",
            "What is a GraphQL query?",
            "What are the advantages of GraphQL?",
        ],
        "machine learning": [
            "What is the difference between supervised and unsupervised learning?",
            "What is overfitting in machine learning?",
            "How would you evaluate a machine learning model?",
        ],
        "deep learning": [
            "What is a neural network?",
            "What is the purpose of an activation function?",
            "What is the difference between deep learning and traditional machine learning?",
        ],
        "nlp": [
            "What is natural language processing?",
            "What is tokenization in NLP?",
            "What is the difference between stemming and lemmatization?",
        ],
        "pandas": [
            "What is a DataFrame in pandas?",
            "How would you handle missing values using pandas?",
            "How would you filter rows in a pandas DataFrame?",
        ],
        "numpy": [
            "What is a NumPy array?",
            "Why is NumPy useful for numerical computing?",
            "What is vectorization in NumPy?",
        ],
        "scikit-learn": [
            "What is scikit-learn used for?",
            "How do you split data into training and testing sets in scikit-learn?",
            "What is the purpose of a pipeline in scikit-learn?",
        ],
        "tensorflow": [
            "What is TensorFlow used for?",
            "What is a tensor in TensorFlow?",
            "How would you train a simple neural network in TensorFlow?",
        ],
        "pytorch": [
            "What is PyTorch used for?",
            "What is a tensor in PyTorch?",
            "How would you train a simple model in PyTorch?",
        ],
        "cybersecurity": [
            "What are the main goals of cybersecurity?",
            "What is the difference between a threat and a vulnerability?",
            "How would you secure a web application?",
        ],
    }

    questions = fallback_questions.get(
        skill,
        [
            f"What are the key concepts of {skill}?",
            f"How is {skill} used in software development?",
            f"What are common challenges when working with {skill}?",
        ],
    )

    return questions[index % len(questions)]


# ---------------- FUNCTION: generate_questions_ai ----------------
def generate_questions_ai(skills):
    """
    Generate exactly six initial questions.

    The backend chooses the skill distribution first. Gemini only writes
    the questions, so it cannot turn a multi-skill interview into six
    questions about one skill.
    """
    valid_skills = []
    for skill in skills:
        normalized = str(skill).lower().strip()
        if normalized and normalized not in valid_skills:
            valid_skills.append(normalized)

    if not valid_skills:
        valid_skills = ["general"]

    technical_skills = [
        skill for skill in valid_skills
        if skill not in ["general", "general programming"]
    ]

    selected_skills = technical_skills[:6] if technical_skills else valid_skills[:6]

    # Cover every available skill once before repeating any skill.
    target_skills = [
        selected_skills[i % len(selected_skills)]
        for i in range(6)
    ]

    prompt = f"""
You are an expert technical interviewer.

Generate exactly 6 concise technical interview questions.

The backend has already assigned the skill for each question:

1. {target_skills[0]}
2. {target_skills[1]}
3. {target_skills[2]}
4. {target_skills[3]}
5. {target_skills[4]}
6. {target_skills[5]}

Return ONLY valid JSON:
[
  {{"question": "...", "skill": "{target_skills[0]}"}},
  {{"question": "...", "skill": "{target_skills[1]}"}},
  {{"question": "...", "skill": "{target_skills[2]}"}},
  {{"question": "...", "skill": "{target_skills[3]}"}},
  {{"question": "...", "skill": "{target_skills[4]}"}},
  {{"question": "...", "skill": "{target_skills[5]}"}}
]

Rules:
- Use the exact assigned skill for each question.
- Do not repeat or rephrase a question.
- Keep every question to 1-2 sentences.
- Avoid long stories and multi-step requirements.
- The candidate should understand the question within about 20 seconds.
- If code is requested, keep it small and focused.
- Do not include answers or explanations.
"""

    ai_by_skill = {}

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        response_text = response.text if response and response.text else ""

        match = re.search(r"\[.*\]", response_text, re.S)

        if match:
            parsed = json.loads(match.group())

            if isinstance(parsed, list):
                for item in parsed:
                    if not isinstance(item, dict):
                        continue

                    question_text = str(item.get("question", "")).strip()
                    skill = str(item.get("skill", "")).lower().strip()

                    if not question_text or len(question_text) > 500:
                        continue

                    if skill not in selected_skills:
                        continue

                    # Keep only one question for each skill.
                    if skill not in ai_by_skill:
                        ai_by_skill[skill] = question_text

    except Exception as e:
        print("AI QUESTION GENERATION ERROR:", e)

    # Build the final list in the backend-selected skill order.
    # If Gemini misses a skill, use a short skill-specific fallback.
    final_questions = []

    for index, skill in enumerate(target_skills):
        question_text = ai_by_skill.get(skill)

        if not question_text:
            question_text = _fallback_question_for_skill(skill, index)

        final_questions.append({
            "question": question_text,
            "skill": skill
        })

    return final_questions


# ---------------- RESUME ----------------


@app.post("/upload-resume")
# ---------------- FUNCTION: upload_resume ----------------
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
            filename=file.filename,
            skills=json.dumps(skills)
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
# ---------------- FUNCTION: evaluate ----------------
async def evaluate(data: dict):
    question = data.get("question", "")
    answer = data.get("answer", "")

    try:
        prompt = f"""
You are an expert interviewer.

Question: {question}
Answer: {answer}

Return ONLY valid JSON:
{{
    "score": number,
    "feedback": "short feedback"
}}

Scoring rules:
- Score from 0 to 10 only.
- Judge correctness, completeness, relevance, clarity, and code quality when code is requested.
- Do not give a high score when an explicitly requested part is missing.
- Give 8-10 for a correct, complete, well-explained answer.
- Give 6-7 for a mostly correct answer with minor gaps.
- Give 4-5 for a partially correct/basic answer with important gaps.
- Give 0-3 for an incorrect, irrelevant, or extremely incomplete answer.
- Keep feedback concise: 1-3 sentences.
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

        try:
            ai_score = float(result.get("score", 5))
        except (ValueError, TypeError):
            ai_score = 5.0

        ai_score = max(0.0, min(ai_score, 10.0))

        return {
            "score": round(ai_score, 1),
            "feedback": str(
                result.get("feedback", "Good answer")
            ).strip()
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



# ---------------- SAVE INTERVIEW ----------------

@app.post("/save-interview")
# ---------------- FUNCTION: save_interview ----------------
async def save_interview(
    data: dict,
    authorization: str = Header(
        default=None,
        alias="Authorization"
    )
):

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="No token"
        )

    db = SessionLocal()

    try:

        # ---------------- AUTHENTICATION ----------------

        token = authorization.split(" ")[1]

        payload = decode_token(token)

        if not payload:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        email = payload["sub"]

        user = db.query(User).filter(
            User.email == email
        ).first()

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid user"
            )

        # ---------------- CREATE INTERVIEW ----------------

        interview = Interview(
            score=data.get("score", 0),
            total_questions=data.get("total_questions", 0),
            user_id=user.id,
            date=datetime.now(timezone.utc)
        )

        db.add(interview)

        # Flush gives us the interview ID
        # before committing the transaction.
        db.flush()

        # ---------------- SAVE INDIVIDUAL ANSWERS ----------------

        answers = data.get("answers", [])

        for item in answers:

            interview_answer = InterviewAnswer(
                interview_id=interview.id,
                question=item.get("question", ""),
                skill=item.get("skill"),
                answer=item.get("answer", ""),
                score=item.get("score", 0),
                feedback=item.get("feedback", "")
            )

            db.add(interview_answer)

        # ---------------- SAVE EVERYTHING ----------------

        db.commit()

        return {
            "message": "Interview saved successfully",
            "interview_id": interview.id,
            "answers_saved": len(answers)
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:

        db.rollback()

        print("SAVE INTERVIEW ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail="Failed to save interview"
        )

    finally:
        db.close()
# ============================================================
# SKILL GAP ANALYSIS
# ============================================================

@app.get("/skill-gap")
# ---------------- FUNCTION: skill_gap ----------------
async def skill_gap(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()
    else:
        token = authorization.strip()

    if not token:
        raise HTTPException(status_code=401, detail="Token missing")

    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    db = SessionLocal()

    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        interviews = (
            db.query(Interview)
            .filter(Interview.user_id == user.id)
            .all()
        )

        if not interviews:
            return {
                "skills": [],
                "weak_skills": [],
                "total_skills": 0,
                "message": "No interviews completed yet."
            }

        interview_ids = [interview.id for interview in interviews]

        answers = (
            db.query(InterviewAnswer)
            .filter(InterviewAnswer.interview_id.in_(interview_ids))
            .all()
        )

        if not answers:
            return {
                "skills": [],
                "weak_skills": [],
                "total_skills": 0,
                "message": "No interview answer data available."
            }

        skill_scores = {}

        for answer in answers:
            skill = (answer.skill or "general").lower().strip()

            if answer.score is not None:
                skill_scores.setdefault(skill, []).append(float(answer.score))

        skill_results = []

        for skill, scores in skill_scores.items():
            if not scores:
                continue

            average_score = sum(scores) / len(scores)
            percentage = round((average_score / 10) * 100)

            if percentage >= 80:
                status = "Strong"
            elif percentage >= 60:
                status = "Average"
            else:
                status = "Needs Improvement"

            skill_results.append({
                "skill": skill,
                "score": round(average_score, 1),
                "percentage": percentage,
                "status": status,
                "attempts": len(scores)
            })

        skill_results.sort(key=lambda x: x["percentage"])

        weak_skills = [
            item for item in skill_results
            if item["percentage"] < 60
        ]

        return {
            "skills": skill_results,
            "weak_skills": weak_skills,
            "total_skills": len(skill_results)
        }

    except HTTPException:
        raise

    except Exception as e:
        print("SKILL GAP ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail="Failed to calculate skill gap."
        )

    finally:
        db.close()


# ============================================================
# INTERVIEW READINESS SCORE
# ============================================================

@app.get("/interview-readiness")
# ---------------- FUNCTION: interview_readiness ----------------
async def interview_readiness(
    job_description: str,
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="No token")

    if authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()
    else:
        token = authorization.strip()

    if not token:
        raise HTTPException(status_code=401, detail="Token missing")

    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    db = SessionLocal()

    try:
        # ----------------------------------------------------
        # USER
        # ----------------------------------------------------
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid user")

        # ----------------------------------------------------
        # LATEST RESUME
        # ----------------------------------------------------
        resume = (
            db.query(Resume)
            .filter(Resume.user_id == user.id)
            .order_by(Resume.uploaded_at.desc())
            .first()
        )

        if not resume:
            raise HTTPException(
                status_code=400,
                detail="Please upload your resume first."
            )

        resume_skills = []
        if resume.skills:
            try:
                resume_skills = json.loads(resume.skills)
            except json.JSONDecodeError:
                resume_skills = []

        resume_skills = list(dict.fromkeys(
            skill.lower().strip() for skill in resume_skills
        ))

        # ----------------------------------------------------
        # JOB MATCH
        # ----------------------------------------------------
        required_skills = extract_skills(job_description)
        required_skills = list(dict.fromkeys(
            skill.lower().strip() for skill in required_skills
        ))

        matched_skills = [
            skill for skill in required_skills
            if skill in resume_skills
        ]

        missing_skills = [
            skill for skill in required_skills
            if skill not in resume_skills
        ]

        if required_skills:
            job_match = round(
                (len(matched_skills) / len(required_skills)) * 100
            )
        else:
            job_match = 0

        # ----------------------------------------------------
        # INTERVIEWS
        # ----------------------------------------------------
        interviews = (
            db.query(Interview)
            .filter(Interview.user_id == user.id)
            .all()
        )

        interview_scores = [
            float(interview.score)
            for interview in interviews
            if interview.score is not None
        ]

        interview_score = (
            round(sum(interview_scores) / len(interview_scores))
            if interview_scores else 0
        )

        # ----------------------------------------------------
        # INDIVIDUAL SKILL PERFORMANCE
        # ----------------------------------------------------
        skill_scores = {}

        if interviews:
            interview_ids = [interview.id for interview in interviews]

            answers = (
                db.query(InterviewAnswer)
                .filter(InterviewAnswer.interview_id.in_(interview_ids))
                .all()
            )

            for answer in answers:
                if answer.score is None:
                    continue

                skill = (answer.skill or "general").lower().strip()
                skill_scores.setdefault(skill, []).append(float(answer.score))

        skill_results = []

        for skill, scores in skill_scores.items():
            if not scores:
                continue

            average_score = sum(scores) / len(scores)
            percentage = round((average_score / 10) * 100)

            if percentage >= 80:
                status = "Strong"
            elif percentage >= 60:
                status = "Average"
            else:
                status = "Needs Improvement"

            skill_results.append({
                "skill": skill,
                "score": round(average_score, 1),
                "percentage": percentage,
                "status": status,
                "attempts": len(scores)
            })

        skill_results.sort(key=lambda x: x["percentage"])

        skill_score = (
            round(
                sum(item["percentage"] for item in skill_results)
                / len(skill_results)
            )
            if skill_results else 0
        )

        # ----------------------------------------------------
        # READINESS
        # ----------------------------------------------------
        # Current project formula:
        # 50% Job Match + 50% Interview Performance
        # Skill Performance is shown separately.
        # ----------------------------------------------------
        if interviews:
            readiness_score = round(
                (job_match * 0.50) +
                (interview_score * 0.50)
            )
        else:
            readiness_score = job_match

        if readiness_score >= 80:
            readiness_status = "Interview Ready"
        elif readiness_score >= 60:
            readiness_status = "Almost Ready"
        else:
            readiness_status = "Needs Practice"

        # ----------------------------------------------------
        # STRENGTHS
        # ----------------------------------------------------
        strengths = [
            item for item in skill_results
            if item["percentage"] >= 80
        ]

        # ----------------------------------------------------
        # IMPROVEMENT AREAS
        # ----------------------------------------------------
        improvement_areas = [
            item for item in skill_results
            if item["percentage"] < 80
        ]

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------
        return {
            "readiness_score": readiness_score,
            "readiness_status": readiness_status,

            "job_match": {
                "score": job_match,
                "matched_skills": matched_skills,
                "missing_skills": missing_skills
            },

            "interview_performance": {
                "score": interview_score,
                "interviews_completed": len(interviews)
            },

            "skill_performance": {
                "score": skill_score,
                "skills": skill_results
            },

            "strengths": strengths,
            "improvement_areas": improvement_areas
        }

    except HTTPException:
        raise

    except Exception as e:
        print("INTERVIEW READINESS ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail="Failed to calculate interview readiness."
        )

    finally:
        db.close()

# ============================================================
# PERSONALIZED IMPROVEMENT PLAN
# ============================================================

@app.get("/improvement-plan")
# ---------------- FUNCTION: improvement_plan ----------------
async def improvement_plan(
    job_description: str,
    authorization: str = Header(None)
):

    # --------------------------------------------------------
    # AUTHENTICATION
    # --------------------------------------------------------

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header missing"
        )

    if authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()
    else:
        token = authorization.strip()

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Token missing"
        )

    payload = decode_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    email = payload.get("sub")

    if not email:
        raise HTTPException(
            status_code=401,
            detail="Invalid token payload"
        )

    db = SessionLocal()

    try:

        # ----------------------------------------------------
        # FIND USER
        # ----------------------------------------------------

        user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        # ----------------------------------------------------
        # GET LATEST RESUME
        # ----------------------------------------------------

        resume = (
            db.query(Resume)
            .filter(Resume.user_id == user.id)
            .order_by(Resume.uploaded_at.desc())
            .first()
        )

        if not resume:
            raise HTTPException(
                status_code=400,
                detail="Please upload your resume first."
            )

        # ----------------------------------------------------
        # GET RESUME SKILLS
        # ----------------------------------------------------

        resume_skills = []

        if resume.skills:

            try:
                resume_skills = json.loads(resume.skills)

            except json.JSONDecodeError:
                resume_skills = []

        resume_skills = [
            skill.lower().strip()
            for skill in resume_skills
        ]

        resume_skills = list(
            dict.fromkeys(resume_skills)
        )

        # ----------------------------------------------------
        # JOB SKILLS
        # ----------------------------------------------------

        # Use the same skill database as Job Matching
        skills_list = [
            "python",
            "java",
            "javascript",
            "typescript",
            "c",
            "c++",
            "c#",

            "react",
            "angular",
            "vue",
            "node",
            "node.js",
            "express",

            "html",
            "css",
            "tailwind",
            "svelte",
            "sveltekit",

            "django",
            "flask",
            "fastapi",

            "sql",
            "mysql",
            "postgresql",
            "sqlite",
            "mongodb",
            "nosql",

            "aws",
            "azure",
            "gcp",
            "docker",
            "kubernetes",
            "git",
            "github",

            "machine learning",
            "deep learning",
            "artificial intelligence",
            "nlp",
            "data science",

            "pandas",
            "numpy",
            "scikit-learn",
            "tensorflow",
            "pytorch",

            "data structures",
            "algorithms",
            "system design",

            "api",
            "rest",
            "rest api",
            "graphql",

            "cybersecurity",
            "penetration testing",

            "power bi",
            "tableau",

            "communication",
            "problem solving",
            "teamwork",
            "leadership"
        ]

        # ----------------------------------------------------
        # EXTRACT SKILLS FROM JOB DESCRIPTION
        # ----------------------------------------------------

        jd_lower = job_description.lower()

        job_skills = [
            skill
            for skill in skills_list
            if skill in jd_lower
        ]

        job_skills = list(
            dict.fromkeys(job_skills)
        )

        # ----------------------------------------------------
        # MATCH / MISSING SKILLS
        # ----------------------------------------------------

        matched_skills = [
            skill
            for skill in job_skills
            if skill in resume_skills
        ]

        missing_skills = [
            skill
            for skill in job_skills
            if skill not in resume_skills
        ]

        # ----------------------------------------------------
        # GET USER INTERVIEWS
        # ----------------------------------------------------

        interviews = (
            db.query(Interview)
            .filter(Interview.user_id == user.id)
            .all()
        )

        # ----------------------------------------------------
        # GET INTERVIEW ANSWERS
        # ----------------------------------------------------

        skill_scores = {}

        if interviews:

            interview_ids = [
                interview.id
                for interview in interviews
            ]

            answers = (
                db.query(InterviewAnswer)
                .filter(
                    InterviewAnswer.interview_id.in_(
                        interview_ids
                    )
                )
                .all()
            )

            for answer in answers:

                if answer.score is None:
                    continue

                skill = (
                    answer.skill or "general"
                ).lower().strip()

                skill_scores.setdefault(
                    skill,
                    []
                ).append(
                    float(answer.score)
                )

        # ----------------------------------------------------
        # CALCULATE SKILL PERFORMANCE
        # ----------------------------------------------------

        skill_results = []

        for skill, scores in skill_scores.items():

            if not scores:
                continue

            average_score = (
                sum(scores) / len(scores)
            )

            percentage = round(
                (average_score / 10) * 100
            )

            if percentage >= 80:
                status = "Strong"

            elif percentage >= 60:
                status = "Average"

            else:
                status = "Needs Improvement"

            skill_results.append({
                "skill": skill,
                "score": round(
                    average_score,
                    1
                ),
                "percentage": percentage,
                "status": status,
                "attempts": len(scores)
            })

        # ----------------------------------------------------
        # CREATE IMPROVEMENT PLAN
        # ----------------------------------------------------

        plan = []

        # ====================================================
        # 1. MISSING JOB SKILLS
        # ====================================================

        for skill in missing_skills:

            recommendation = (
                f"Learn {skill} fundamentals and "
                f"practice {skill}-based interview questions."
            )

            if skill in ["node", "node.js"]:
                recommendation = (
                    "Learn Node.js fundamentals, "
                    "Express.js and backend API development."
                )

            elif skill == "react":
                recommendation = (
                    "Practice React components, hooks, "
                    "state management and API integration."
                )

            elif skill == "python":
                recommendation = (
                    "Practice Python fundamentals, "
                    "functions, OOP and problem-solving."
                )

            elif skill == "django":
                recommendation = (
                    "Practice Django models, views, "
                    "REST APIs and authentication."
                )

            elif skill == "fastapi":
                recommendation = (
                    "Practice FastAPI routing, "
                    "request validation, authentication and APIs."
                )

            elif skill in ["sql", "mysql", "postgresql", "sqlite"]:
                recommendation = (
                    "Practice SQL queries, joins, "
                    "aggregation, indexing and database design."
                )

            elif skill == "docker":
                recommendation = (
                    "Practice Docker images, containers, "
                    "Dockerfiles and containerized applications."
                )

            elif skill == "aws":
                recommendation = (
                    "Learn AWS fundamentals and practice "
                    "deploying applications using cloud services."
                )

            elif skill in ["git", "github"]:
                recommendation = (
                    "Practice Git commands, branching, "
                    "merging and collaborative workflows."
                )

            elif skill in [
                "data structures",
                "algorithms"
            ]:
                recommendation = (
                    "Practice arrays, strings, linked lists, "
                    "stacks, queues, sorting and searching problems."
                )

            plan.append({
                "skill": skill,
                "current_score": 0,
                "percentage": 0,
                "priority": "High",
                "type": "Missing Job Skill",
                "recommendation": recommendation
            })

        # ====================================================
        # 2. INTERVIEW SKILLS
        # ====================================================

        for item in skill_results:

            skill = item["skill"]
            percentage = item["percentage"]

            # Skip strong skills
            if percentage >= 80:
                continue

            # Avoid duplicate if already missing from JD
            if skill in missing_skills:
                continue

            # Priority
            if percentage < 60:
                priority = "High"

            else:
                priority = "Medium"

            # Generic recommendation
            recommendation = (
                f"Practice more {skill} interview questions "
                f"and improve the depth and clarity of your answers."
            )

            # Specific recommendations
            if skill == "python":
                recommendation = (
                    "Practice Python coding, OOP, "
                    "functions, data structures and problem-solving."
                )

            elif skill == "rest":
                recommendation = (
                    "Practice REST API design, HTTP methods, "
                    "status codes, authentication and API security."
                )

            elif skill == "api":
                recommendation = (
                    "Practice API design, request/response handling, "
                    "authentication and error handling."
                )

            elif skill == "general":
                recommendation = (
                    "Practice explaining technical concepts clearly, "
                    "structuring answers and solving problems step by step."
                )

            elif skill == "sql":
                recommendation = (
                    "Practice SQL joins, subqueries, aggregation, "
                    "indexes and database optimization."
                )

            elif skill in [
                "data structures",
                "algorithms"
            ]:
                recommendation = (
                    "Practice coding problems involving arrays, "
                    "strings, searching, sorting and complexity analysis."
                )

            plan.append({
                "skill": skill,
                "current_score": item["score"],
                "percentage": percentage,
                "priority": priority,
                "type": "Interview Performance",
                "recommendation": recommendation
            })

        # ----------------------------------------------------
        # SORT PLAN BY PRIORITY
        # ----------------------------------------------------

        priority_order = {
            "High": 1,
            "Medium": 2,
            "Low": 3
        }

        plan.sort(
            key=lambda item:
            priority_order.get(
                item["priority"],
                3
            )
        )

        # ----------------------------------------------------
        # SUMMARY
        # ----------------------------------------------------

        high_priority = len([
            item
            for item in plan
            if item["priority"] == "High"
        ])

        medium_priority = len([
            item
            for item in plan
            if item["priority"] == "Medium"
        ])

        return {
            "summary": {
                "total_recommendations": len(plan),
                "high_priority": high_priority,
                "medium_priority": medium_priority,
                "missing_job_skills": len(missing_skills),
                "skills_needing_improvement": len([
                    item
                    for item in skill_results
                    if item["percentage"] < 80
                ])
            },

            "missing_job_skills": missing_skills,

            "matched_job_skills": matched_skills,

            "plan": plan
        }

    except HTTPException:
        raise

    except Exception as e:

        print(
            "IMPROVEMENT PLAN ERROR:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to generate improvement plan."
        )

    finally:

        db.close()
# ---------------- HISTORY ----------------

@app.get("/interview-history")
# ---------------- FUNCTION: history ----------------
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
# ---------------- FUNCTION: leaderboard ----------------
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
# ---------------- FUNCTION: resume_count ----------------
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
    # ---------------- RESUME SKILLS ----------------

@app.get("/resume-skills")
# ---------------- FUNCTION: resume_skills ----------------
async def resume_skills(
    authorization: str = Header(None)
):

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="No token"
        )

    db = SessionLocal()

    try:

        token = authorization.split(" ")[1]

        payload = decode_token(token)

        if not payload:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        email = payload["sub"]

        user = db.query(User).filter(
            User.email == email
        ).first()

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid user"
            )

        resume = (
            db.query(Resume)
            .filter(Resume.user_id == user.id)
            .order_by(Resume.uploaded_at.desc())
            .first()
        )

        if not resume:
            return {
                "skills": [],
                "filename": None,
                "message": "No resume uploaded"
            }

        skills = []

        if resume.skills:

            try:
                skills = json.loads(resume.skills)

            except json.JSONDecodeError:
                skills = []

        return {
            "skills": skills,
            "filename": resume.filename
        }

    finally:

        db.close()

# ============================================================
# JOB DESCRIPTION MATCHING
# ============================================================

@app.post("/job-match")
# ---------------- FUNCTION: job_match ----------------
async def job_match(
    job_description: str,
    authorization: str = Header(None)
):

    # --------------------------------------------------------
    # CHECK AUTHORIZATION HEADER
    # --------------------------------------------------------
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header missing"
        )

    # --------------------------------------------------------
    # EXTRACT JWT TOKEN
    # --------------------------------------------------------
    if authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()
    else:
        token = authorization.strip()

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Token missing"
        )

    # --------------------------------------------------------
    # DECODE JWT
    # --------------------------------------------------------
    payload = decode_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    # --------------------------------------------------------
    # GET EMAIL FROM TOKEN
    # --------------------------------------------------------
    email = payload.get("sub")

    if not email:
        raise HTTPException(
            status_code=401,
            detail="Invalid token payload"
        )

    db = SessionLocal()

    try:

        # ----------------------------------------------------
        # FIND USER
        # ----------------------------------------------------
        user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        # ----------------------------------------------------
        # GET LATEST RESUME
        # ----------------------------------------------------
        resume = (
            db.query(Resume)
            .filter(Resume.user_id == user.id)
            .order_by(Resume.uploaded_at.desc())
            .first()
        )

        if not resume:
            raise HTTPException(
                status_code=404,
                detail="Please upload a resume first"
            )

        # ----------------------------------------------------
        # GET RESUME SKILLS
        # ----------------------------------------------------
        resume_skills = []

        if resume.skills:
            try:
                resume_skills = json.loads(resume.skills)
            except json.JSONDecodeError:
                resume_skills = []

        if not resume_skills:
            raise HTTPException(
                status_code=400,
                detail="No skills found in resume. Please upload your resume again."
            )

        # ----------------------------------------------------
        # SKILLS DATABASE
        # ----------------------------------------------------
        skills_list = [
            "python",
            "java",
            "javascript",
            "typescript",
            "c",
            "c++",
            "c#",

            "react",
            "angular",
            "vue",
            "node",
            "node.js",
            "express",

            "html",
            "css",
            "tailwind",
            "svelte",
            "sveltekit",

            "django",
            "flask",
            "fastapi",

            "sql",
            "mysql",
            "postgresql",
            "sqlite",
            "mongodb",
            "nosql",

            "aws",
            "azure",
            "gcp",
            "docker",
            "kubernetes",
            "git",
            "github",

            "machine learning",
            "deep learning",
            "artificial intelligence",
            "nlp",
            "data science",

            "pandas",
            "numpy",
            "scikit-learn",
            "tensorflow",
            "pytorch",

            "data structures",
            "algorithms",
            "system design",

            "api",
            "rest",
            "rest api",
            "graphql",

            "cybersecurity",
            "penetration testing",

            "power bi",
            "tableau",

            "communication",
            "problem solving",
            "teamwork",
            "leadership"
        ]

        # ----------------------------------------------------
        # EXTRACT JOB SKILLS
        # ----------------------------------------------------
        jd_lower = job_description.lower()

        job_skills = []

        for skill in skills_list:
            if skill in jd_lower:
                job_skills.append(skill)

        # Remove duplicates
        job_skills = list(dict.fromkeys(job_skills))

        # ----------------------------------------------------
        # NORMALIZE RESUME SKILLS
        # ----------------------------------------------------
        resume_skills_normalized = [
            skill.lower().strip()
            for skill in resume_skills
        ]

        # ----------------------------------------------------
        # MATCH SKILLS
        # ----------------------------------------------------
        matched_skills = []

        for skill in job_skills:

            if skill.lower() in resume_skills_normalized:
                matched_skills.append(skill)

        # ----------------------------------------------------
        # MISSING SKILLS
        # ----------------------------------------------------
        missing_skills = [
            skill
            for skill in job_skills
            if skill not in matched_skills
        ]

        # ----------------------------------------------------
        # MATCH PERCENTAGE
        # ----------------------------------------------------
        if job_skills:
            match_percentage = round(
                (len(matched_skills) / len(job_skills)) * 100,
                2
            )
        else:
            match_percentage = 0

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------
        return {
            "resume_skills": resume_skills,
            "job_skills": job_skills,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "match_percentage": match_percentage
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Job matching failed: {str(e)}"
        )

    finally:
        db.close()
      
# ============================================================
# ADAPTIVE INTERVIEW QUESTION ENDPOINT
# ============================================================
@app.post("/adaptive-question")
# ---------------- FUNCTION: adaptive_question ----------------
async def adaptive_question(
    data: dict,
    authorization: str = Header(None)
):
    """
    Generate the next adaptive interview question based on:
    - the previous question
    - the candidate's previous answer
    - the previous score
    - the current technical skill

    Difficulty is selected from the score:
    < 6  -> easy
    6-7.9 -> medium
    >= 8 -> hard
    """
    try:
        # ========================================================
        # 1. AUTHENTICATION
        # ========================================================
        if not authorization:
            raise HTTPException(
                status_code=401,
                detail="Authorization token required"
            )

        if authorization.lower().startswith("bearer "):
            token = authorization[7:].strip()
        else:
            token = authorization.strip()

        if not token:
            raise HTTPException(
                status_code=401,
                detail="Token missing"
            )

        payload = decode_token(token)

        if not payload:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        # ========================================================
        # 2. READ INPUT DATA
        # ========================================================
        question = str(data.get("question", "")).strip()
        original_skill = str(
            data.get("skill", "general")
        ).lower().strip()
        answer = str(data.get("answer", "")).strip()

        try:
            score = float(data.get("score", 5))
        except (ValueError, TypeError):
            score = 5.0

        score = max(0.0, min(score, 10.0))

        if not question:
            raise HTTPException(
                status_code=400,
                detail="Question is required"
            )

        # ========================================================
        # 3. NORMALIZE SKILL FOR FALLBACK QUESTIONS
        # ========================================================
        skill_aliases = {
            "node.js": "node",
            "nodejs": "node",
            "rest api": "rest",
        }

        skill_key = skill_aliases.get(
            original_skill,
            original_skill
        )

        # ========================================================
        # 4. DETERMINE NEXT QUESTION DIFFICULTY
        # ========================================================
        if score < 6:
            difficulty = "easy"
        elif score < 8:
            difficulty = "medium"
        else:
            difficulty = "hard"

        # ========================================================
        # 5. GENERATE ADAPTIVE QUESTION WITH GEMINI
        # ========================================================
        # The previous version allowed Gemini to return a very short
        # incomplete response such as "You're building". The prompt
        # and validation below now require a complete question.
        prompt = f"""
You are conducting a technical interview.

Generate ONE complete {difficulty}-level interview question about {original_skill}.

Previous question:
{question}

Candidate's previous answer:
{answer}

Use the previous answer to make the next question a relevant follow-up.

Difficulty rules:
- easy: test fundamentals or basic understanding.
- medium: test practical understanding or application.
- hard: test deeper reasoning, design, troubleshooting, or problem-solving.

Strict output rules:
- Return ONLY ONE complete question.
- The output MUST be a complete sentence ending with a question mark.
- Maximum 2 sentences.
- Keep it suitable for a 1-2 minute spoken answer.
- Do not repeat or rephrase the previous question.
- Do not write an answer, explanation, heading, label, or quotation marks.
- Do not start with incomplete phrases such as "You're building", "You're developing", or "Suppose" unless the phrase is followed by a complete question.
""".strip()

        next_question = None

        try:
            model = genai.GenerativeModel("gemini-2.5-flash")

            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.4,
                    "max_output_tokens": 120
                }
            )

            # Safely read Gemini's response.
            response_text = ""
            if response is not None:
                response_text = getattr(response, "text", "") or ""

            response_text = response_text.strip()

            # Remove common markdown formatting if Gemini adds it.
            response_text = response_text.strip("` ")
            response_text = re.sub(
                r"^(question|q)\s*:\s*",
                "",
                response_text,
                flags=re.IGNORECASE
            ).strip()

            # Remove surrounding quotation marks only.
            if (
                len(response_text) >= 2
                and response_text[0] == '"'
                and response_text[-1] == '"'
            ):
                response_text = response_text[1:-1].strip()

            # ----------------------------------------------------
            # Validate the generated question.
            # ----------------------------------------------------
            # A response such as "You're building" is rejected because
            # it is not a complete question and has no question mark.
            word_count = len(response_text.split())
            has_question_mark = "?" in response_text
            too_short = word_count < 6
            too_long = len(response_text) > 500
            repeated = response_text.lower() == question.lower()

            if not response_text:
                raise Exception("Empty AI response")

            if too_short:
                raise Exception("AI returned an incomplete/too-short question")

            if not has_question_mark:
                raise Exception("AI response is not a complete question")

            if too_long:
                raise Exception("AI generated an overly long question")

            if repeated:
                raise Exception("AI repeated previous question")

            next_question = response_text

        except Exception as ai_error:
            print("Adaptive AI error:", ai_error)

        # ========================================================
        # 6. FALLBACK QUESTIONS
        # ========================================================
        # If Gemini is unavailable, rate-limited, blocked, or returns
        # an incomplete question, use a valid local question instead.
        if not next_question:
            fallback_questions = {
                "python": {
                    "easy": [
                        "What are the main built-in data types in Python?",
                        "What is the difference between a list and a tuple in Python?",
                        "What is the purpose of indentation in Python?"
                    ],
                    "medium": [
                        "What is the difference between shallow copy and deep copy in Python?",
                        "Explain how dictionaries work in Python.",
                        "What is the difference between a list, set and dictionary in Python?"
                    ],
                    "hard": [
                        "How would you optimize a Python application with high memory usage?",
                        "Explain how Python handles memory management and garbage collection.",
                        "How would you improve the performance of a Python application processing a large dataset?"
                    ]
                },
                "rest": {
                    "easy": [
                        "What is a REST API?",
                        "What are the common HTTP methods used in REST APIs?",
                        "What is the purpose of an HTTP status code?"
                    ],
                    "medium": [
                        "What is the difference between GET, POST, PUT and DELETE?",
                        "How would you design authentication for a REST API?",
                        "What is the difference between PUT and PATCH?"
                    ],
                    "hard": [
                        "How would you design a scalable REST API for a high-traffic application?",
                        "How would you secure a REST API used by multiple clients?",
                        "How would you handle rate limiting in a REST API?"
                    ]
                },
                "sql": {
                    "easy": [
                        "What is a primary key in SQL?",
                        "What is the difference between WHERE and HAVING?",
                        "What is a foreign key?"
                    ],
                    "medium": [
                        "What is the difference between INNER JOIN and LEFT JOIN?",
                        "What are database indexes and why are they useful?",
                        "What is database normalization?"
                    ],
                    "hard": [
                        "How would you optimize a slow SQL query on a large database?",
                        "How would you design a database for a high-traffic application?",
                        "How would you analyze and improve a query with poor performance?"
                    ]
                },
                "javascript": {
                    "easy": [
                        "What is the difference between let, const and var?",
                        "What are functions in JavaScript?",
                        "What is an array in JavaScript?"
                    ],
                    "medium": [
                        "Explain closures in JavaScript.",
                        "What is the difference between == and ===?",
                        "How does asynchronous programming work in JavaScript?"
                    ],
                    "hard": [
                        "Explain the JavaScript event loop in detail.",
                        "How would you optimize a JavaScript application with many asynchronous operations?",
                        "How does JavaScript handle promises and the microtask queue?"
                    ]
                },
                "react": {
                    "easy": [
                        "What is React used for?",
                        "What are props in React?",
                        "What is state in React?"
                    ],
                    "medium": [
                        "What is the difference between state and props in React?",
                        "What are React hooks?",
                        "What is the purpose of useEffect in React?"
                    ],
                    "hard": [
                        "How would you optimize a React application with unnecessary re-renders?",
                        "How would you design state management for a large React application?",
                        "How would you improve the performance of a React application with many components?"
                    ]
                },
                "fastapi": {
                    "easy": [
                        "What is FastAPI and why is it used?",
                        "What is a route in FastAPI?",
                        "How do you define an API endpoint in FastAPI?"
                    ],
                    "medium": [
                        "How does request validation work in FastAPI?",
                        "How would you implement authentication in FastAPI?",
                        "What is dependency injection in FastAPI?"
                    ],
                    "hard": [
                        "How would you design a scalable FastAPI backend?",
                        "How would you optimize a FastAPI application handling many concurrent requests?",
                        "How would you implement authentication and authorization in a production FastAPI application?"
                    ]
                },
                "general": {
                    "easy": [
                        "What is the main concept behind your previous technical answer?",
                        "Can you explain the previous concept using a simple example?"
                    ],
                    "medium": [
                        "Can you explain the previous technical concept with a practical example?",
                        "What are the advantages and limitations of the concept discussed?"
                    ],
                    "hard": [
                        "How would you apply the technical concept discussed to a real-world software system?",
                        "What challenges could occur when implementing this concept in a production application?"
                    ]
                }
            }

            skill_questions = fallback_questions.get(
                skill_key,
                fallback_questions["general"]
            )

            available_questions = [
                q for q in skill_questions[difficulty]
                if q.lower() != question.lower()
            ]

            if not available_questions:
                available_questions = skill_questions[difficulty]

            next_question = random.choice(available_questions)

        # ========================================================
        # 7. RETURN ADAPTIVE QUESTION
        # ========================================================
        return {
            "question": next_question,
            "skill": original_skill,
            "difficulty": difficulty,
            "based_on_score": score
        }

    except HTTPException:
        raise

    except Exception as e:
        print("Adaptive question error:", e)

        raise HTTPException(
            status_code=500,
            detail="Failed to generate adaptive question"
        )

# uvicorn main:app --reload
