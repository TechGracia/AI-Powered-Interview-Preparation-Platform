# 🚀 AI Interview Preparation Platform

An AI-powered web application that helps users prepare for job interviews by generating personalized questions from resumes and evaluating answers using Generative AI.

---

## 📌 Features

* 📄 Resume Upload & Skill Extraction
* 🤖 AI-Based Question Generation (Gemini API)
* 🧠 Real-time Answer Evaluation with Feedback
* 🔐 OTP-based Email Verification
* 📊 Dashboard with Performance Tracking
* 🎯 Mock Interview + AI Interview Modes

---

## 🛠 Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Axios
* React Router

### Backend

* FastAPI (Python)
* Uvicorn
* JWT Authentication

### AI Integration

* Google Gemini 2.5 Flash API

### Others

* SMTP (Email OTP)
* Local Storage (Session handling)

---

## 📂 Project Structure

```
AI-INTERVIEW-PREPARATION-PLATFORM/
│
├── server/        # FastAPI backend
├── src/           # React frontend
├── public/
├── package.json
├── vite.config.js
```

---

## ⚙️ Installation & Setup

### 🔹 Backend Setup

```bash
cd server
pip install -r requirements.txt
uvicorn main:app --reload
```

---

### 🔹 Frontend Setup

```bash
npm install
npm run dev
```

---

## 🔑 Environment Variables

### Backend (.env)

```
GEMINI_API_KEY=your_api_key
EMAIL=your_email
PASSWORD=your_app_password
```

### Frontend (.env)

```
VITE_BACKEND_URL=http://localhost:8000
```

---

## 🚀 Deployment

### Frontend

* Deploy using **Vercel**

### Backend

* Deploy using **Render**

---

## 🎯 How It Works

1. User registers and verifies email via OTP
2. Uploads resume
3. System extracts skills
4. AI generates interview questions
5. User answers questions
6. AI evaluates answers and provides feedback
7. Final score is displayed

---

## ⚠️ Limitations

* Depends on internet connection
* AI responses may vary
* Resume parsing may fail for complex formats

---

## 🔮 Future Scope

* 🎤 Voice-based interviews
* 🎥 Video interview analysis
* 📱 Mobile application
* 🌐 Multi-language support

---

## 👩‍💻 Author

**Gracia Sharon**

* GitHub: https://github.com/TechGracia
* LinkedIn: https://www.linkedin.com/in/gracia-sharon-jopson/

---

## 📄 License

This project is for academic purposes.
