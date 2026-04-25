import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

function InterviewSession() {
  const location = useLocation();
  const questions = location.state?.questions || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [descriptiveAnswer, setDescriptiveAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ---------------- SAFETY CHECK ----------------
  if (!questions || questions.length === 0) {
    return (
      <div className="text-white text-center mt-20">
        ❌ No questions found. Please upload resume first.
      </div>
    );
  }

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  // ---------------- SUBMIT ANSWER ----------------
  const submitAnswerAndNext = async () => {
    if (!descriptiveAnswer.trim() || submitting) return;

    setSubmitting(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/evaluate-answer", {
        question: currentQuestion.question,
        answer: descriptiveAnswer,
      });

      const aiScore = res.data.score || 5;
      const aiFeedback = res.data.feedback || "No feedback";

      setScore((prev) => prev + aiScore);
      setFeedback(aiFeedback);
    } catch (err) {
      console.log(err);
      alert("AI evaluation failed");
    }

    setTimeout(() => {
      if (currentIndex + 1 >= totalQuestions) {
        setCompleted(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
        setDescriptiveAnswer("");
        setFeedback("");
      }
      setSubmitting(false);
    }, 1000);
  };

  // ---------------- SCORE CALCULATION ----------------
  const maxScore = totalQuestions * 10;
  const averageScore =
    maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  // ---------------- SAVE INTERVIEW ----------------
  useEffect(() => {
    if (!completed || totalQuestions === 0) return;

    const saveInterview = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.log("No token found");
          return;
        }

        await fetch("http://127.0.0.1:8000/save-interview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            score,
            total_questions: totalQuestions,
          }),
        });
      } catch (err) {
        console.log(err);
      }
    };

    saveInterview();
  }, [completed, totalQuestions, score]);

  // ---------------- FINAL SCREEN ----------------
  if (completed) {
    let rank = "";
    let message = "";

    if (averageScore >= 80) {
      rank = "🏆 Expert";
      message = "Excellent performance!";
    } else if (averageScore >= 60) {
      rank = "🥈 Intermediate";
      message = "Good job!";
    } else if (averageScore >= 40) {
      rank = "🥉 Beginner";
      message = "Keep improving!";
    } else {
      rank = "📚 Learner";
      message = "Practice more.";
    }

    return (
      <div className="flex justify-center items-center min-h-[80vh] px-4">
        <div className="
          w-full max-w-2xl
          bg-white/10 backdrop-blur-2xl
          border border-white/20
          rounded-3xl
          p-10 text-center text-white
          shadow-[0_20px_80px_rgba(0,0,0,0.6)]
        ">

          <div className="text-4xl mb-3">🎉</div>

          <h2 className="text-3xl font-bold mb-4">
            Interview Completed
          </h2>

          <p className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            {averageScore}%
          </p>

          <p className="text-lg text-purple-300 font-semibold mb-2">
            {rank}
          </p>

          <p className="text-gray-300 mb-6">
            {message}
          </p>

        </div>
      </div>
    );
  }

  // ---------------- LOADING ----------------
  if (!currentQuestion) {
    return (
      <div className="text-white text-center mt-20">
        ⏳ Preparing interview...
      </div>
    );
  }

  // ---------------- MAIN UI ----------------
  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">

      <div className="
        w-full max-w-2xl
        bg-white/10 backdrop-blur-2xl
        border border-white/20
        rounded-3xl
        p-8
        shadow-[0_20px_80px_rgba(0,0,0,0.5)]
        text-white
      ">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4 text-sm text-gray-300">
          <p>Question {currentIndex + 1} / {totalQuestions}</p>
          <p className="text-purple-300 font-semibold">
            Score: {score}
          </p>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full bg-white/10 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>

        {/* QUESTION */}
        <h3 className="text-xl font-semibold mb-6 leading-relaxed">
          {currentQuestion.question}
        </h3>

        {/* TEXTAREA */}
        <textarea
          value={descriptiveAnswer}
          onChange={(e) => setDescriptiveAnswer(e.target.value)}
          placeholder="Write your answer here..."
          className="
            w-full
            bg-white/5
            border border-white/10
            text-white
            placeholder-gray-400
            p-4
            rounded-xl
            focus:outline-none
            focus:ring-2 focus:ring-purple-500
            transition
          "
          rows={5}
        />

        {/* FEEDBACK */}
        {feedback && (
          <div className="
            mt-4 p-3 rounded-lg
            bg-purple-500/10
            border border-purple-500/30
            text-sm text-purple-200
          ">
            💡 {feedback}
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={submitAnswerAndNext}
          disabled={!descriptiveAnswer.trim() || submitting}
          className="
            mt-6 w-full py-3 rounded-xl
            bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500
            font-semibold text-lg
            shadow-lg
            hover:scale-[1.03]
            hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]
            transition-all
            disabled:opacity-50
          "
        >
          {submitting ? "Submitting..." : "Submit & Next 🚀"}
        </button>

      </div>

    </div>
  );
}

export default InterviewSession;