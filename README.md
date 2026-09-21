# 🚀 AI-Powered Interview Preparation Platform

An AI-powered web application designed to help students and job seekers prepare for technical interviews through **personalized resume analysis, AI-generated interview questions, answer evaluation, adaptive interviews, job matching, skill-gap analysis, interview readiness assessment, and personalized improvement plans**.

The platform uses **Google Gemini 2.5 Flash** to provide personalized interview assistance based on the user's resume, skills, job requirements, and previous interview performance.

---

## ✨ Key Features

### 📄 Resume Analysis
- Upload resume in PDF format
- Extract technical skills from the resume
- Analyze the candidate's skill profile
- Use extracted skills for personalized interview preparation

### 🤖 AI Interview Preparation
- Generate technical interview questions based on resume skills
- Cover multiple skills instead of focusing on a single technology
- Practice interview questions interactively
- Receive AI-generated feedback after answering

### 🧠 AI Answer Evaluation
- Evaluate technical interview answers using Generative AI
- Generate a score out of 10
- Provide constructive feedback
- Identify areas that need improvement
- Suggest ways to improve future answers

### 🎯 Adaptive Interview
The interview dynamically adjusts question difficulty based on previous performance:

| Previous Score | Difficulty |
|---|---|
| Below 6 | Easy |
| 6 – 7.9 | Medium |
| 8 – 10 | Hard |

This allows the interview to become more challenging as the candidate demonstrates stronger performance.

### 💼 Job Description Matching
- Compare resume skills with job requirements
- Identify matched skills
- Calculate job-skill match percentage
- Identify skills required by the job but missing from the resume

### 📊 Skill Gap Analysis
- Identify missing technical skills
- Highlight skills that require improvement
- Help candidates understand their preparation gaps

### 📈 Interview Readiness
The platform calculates an overall readiness score using:

**Interview Readiness = 50% Job Match + 50% Interview Performance**

This provides a combined view of the candidate's skills and interview performance.

### 📝 Personalized Improvement Plan
The platform generates an improvement plan based on:
- Missing job-related skills
- Weak interview performance
- Previous answer scores
- Areas requiring additional preparation

### 📚 Interview History
- Store completed interview sessions
- View previous performance
- Track interview progress over time
- Review previous answers and evaluations

### 🔐 Authentication & Security
- User registration
- Email OTP verification
- JWT-based authentication
- Protected user-specific features
- Session-based access control

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- React Router

### Backend
- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- JWT Authentication

### Database
- Relational Database
- SQLAlchemy ORM

### Generative AI
- Google Gemini 2.5 Flash API

### Other Technologies
- SMTP / Email OTP
- PyMuPDF / PDF processing
- Local Storage
- Git & GitHub

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │        User         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │   Vite + Tailwind   │
                    └──────────┬──────────┘
                               │
                         REST API / HTTP
                               │
                               ▼
                    ┌─────────────────────┐
                    │   FastAPI Backend   │
                    │       Python        │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼─────────────────┐
              │                │                 │
              ▼                ▼                 ▼
       ┌─────────────┐  ┌──────────────┐  ┌───────────────┐
       │  Database   │  │ Gemini API   │  │ Resume Parser │
       │ SQLAlchemy  │  │ Gemini 2.5   │  │ PDF Analysis  │
       └─────────────┘  │    Flash     │  └───────────────┘
                        └──────────────┘
```

---

## 🔄 How It Works

```text
Register
   ↓
Email OTP Verification
   ↓
Login
   ↓
Upload Resume
   ↓
Extract Resume Skills
   ↓
Generate Personalized Questions
   ↓
Answer Interview Questions
   ↓
AI Evaluation & Feedback
   ↓
Adaptive Interview
   ↓
Job Description Matching
   ↓
Skill Gap Analysis
   ↓
Interview Readiness
   ↓
Personalized Improvement Plan
   ↓
Interview History & Dashboard
```

---

## 📂 Project Structure

```text
AI-POWERED-INTERVIEW-PREPARATION-PLATFORM/
│
├── server/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── auth.py
│   ├── requirements.txt
│   └── ...
│
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── App.jsx
│   └── ...
│
├── public/
│
├── package.json
├── vite.config.js
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/TechGracia/AI-Powered-Interview-Preparation-Platform.git

cd AI-Powered-Interview-Preparation-Platform
```

### 2. Backend Setup

Navigate to the backend:

```bash
cd server
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

Backend:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

### 3. Frontend Setup

Open a new terminal and navigate to the project directory:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `server` directory:

```env
GEMINI_API_KEY=your_gemini_api_key
EMAIL=your_email
PASSWORD=your_email_app_password
```

For the frontend, create a `.env` file in the project root:

```env
VITE_BACKEND_URL=http://localhost:8000
```

> ⚠️ Never commit `.env` files or API keys to GitHub.

---

## 🧩 Main Modules

| Module | Description |
|---|---|
| Authentication | Registration, login, OTP verification and JWT authentication |
| Resume Analysis | Resume upload and skill extraction |
| Question Generation | AI-generated questions based on candidate skills |
| Answer Evaluation | AI-based scoring and feedback |
| Adaptive Interview | Difficulty adjustment based on previous performance |
| Job Matching | Compares resume skills with job requirements |
| Skill Gap | Identifies missing skills |
| Interview Readiness | Calculates overall preparation readiness |
| Improvement Plan | Generates personalized areas for improvement |
| Interview History | Stores and displays previous interview sessions |
| Dashboard | Centralized view of candidate progress |

---

## 🧠 AI Processing

The platform uses Google Gemini 2.5 Flash for several AI-powered tasks:

```text
Resume Skills
     ↓
Question Generation
     ↓
Candidate Answer
     ↓
AI Evaluation
     ↓
Score + Feedback
     ↓
Adaptive Difficulty
     ↓
Next Question
```

The adaptive interview uses the candidate's previous score to determine the difficulty of the next question.

---

## 📊 Core Algorithms

### Job Skill Matching

```text
Matched Skills = Resume Skills ∩ Job Skills

Missing Skills = Job Skills − Resume Skills
```

### Skill Performance

```text
Skill Percentage =
(Average Skill Score / 10) × 100
```

### Interview Readiness

```text
Readiness =
0.5 × Job Match Percentage
+
0.5 × Interview Performance Percentage
```

---

## 🧪 Testing

The platform was tested using functional test cases covering:

- User registration
- OTP verification
- Login
- Resume upload
- Skill extraction
- Question generation
- Answer submission
- AI evaluation
- Adaptive questioning
- Job matching
- Skill-gap analysis
- Interview readiness
- Improvement plan
- Interview history
- AI failure/fallback handling

---

## ⚠️ Limitations

- Requires an internet connection for Generative AI functionality
- AI-generated responses and evaluations may vary
- Resume parsing may not work perfectly with highly complex layouts
- Skill extraction may depend on the terminology used in the resume
- Current interview interaction is primarily text-based
- AI evaluation may not fully capture all aspects of human interview performance
- Advanced domain-specific interview customization is limited

---

## 🔮 Future Scope

Possible future improvements include:

- 🎤 Voice-based interview simulation
- 🎥 Video interview analysis
- 😊 Facial expression and communication analysis
- 🌐 Multi-language interview support
- 📚 Personalized learning recommendations
- 📱 Mobile application
- 💼 Job portal integration
- 📊 Advanced interview analytics
- 🧠 More advanced domain-specific AI evaluation
- 🔊 Speech-based answer evaluation

---

## 🎓 Academic Project

This project was developed as an academic project focused on the application of **Generative AI, Natural Language Processing, web technologies, and intelligent career-preparation systems**.

### Sustainable Development Goals

The project aligns primarily with:

- **SDG 4 – Quality Education**
  - Supports personalized learning and continuous skill development.

- **SDG 8 – Decent Work and Economic Growth**
  - Supports career preparation, employability, job-skill matching and interview readiness.

---

## 👩‍💻 Author

**Gracia Sharon Jopson**

- GitHub: https://github.com/TechGracia
- LinkedIn: https://www.linkedin.com/in/gracia-sharon-jopson/

---

## 📄 License

This project is developed for **academic and educational purposes**.
