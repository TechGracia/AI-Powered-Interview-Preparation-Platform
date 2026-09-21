import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function InterviewSession() {
  const location = useLocation();

  // Original questions received from Interview page.
  const initialQuestions = location.state?.questions || [];

  // Questions can be replaced by adaptive follow-up questions.
  const [questions, setQuestions] = useState(initialQuestions);

  const [currentIndex, setCurrentIndex] = useState(0);

  // IMPORTANT:
  // Keep the total score as the SUM of individual scores.
  // The percentage is calculated only from answered questions.
  const [score, setScore] = useState(0);

  const [completed, setCompleted] = useState(false);
  const [descriptiveAnswer, setDescriptiveAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Store every answered question.
  const [answers, setAnswers] = useState([]);

  // Prevent the completed interview from being saved multiple times.
  const interviewSavedRef = useRef(false);

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

  // Number of questions that have actually been answered.
  const answeredQuestions = answers.length;

  // ---------------- SCORE CALCULATION ----------------
  //
  // Every answer is scored out of 10.
  // Example:
  // 8 + 7 + 10 = 25
  // 25 / 30 * 100 = 83%
  //
  // We use answers.length rather than relying only on the question
  // list so the displayed percentage always represents completed work.

  const maxAnsweredScore = answeredQuestions * 10;

  const averageScore =
    maxAnsweredScore > 0
      ? Math.round((score / maxAnsweredScore) * 100)
      : 0;

  // ---------------- ADAPTIVE QUESTION ----------------

  const getAdaptiveQuestion = async ({
    question,
    skill,
    answer,
    score,
  }) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found for adaptive question.");
        return null;
      }

      const res = await axios.post(
        `${API_URL}/adaptive-question`,
        {
          question,
          skill,
          answer,
          score,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res.data;
    } catch (err) {
      console.log(
        "Adaptive question error:",
        err.response?.data || err.message
      );

      return null;
    }
  };

  // ---------------- SUBMIT ANSWER ----------------

  const submitAnswerAndNext = async () => {
    if (!descriptiveAnswer.trim() || submitting || completed) return;

    setSubmitting(true);
    setFeedback("");

    // Capture the answer before any state changes.
    const submittedAnswer = descriptiveAnswer.trim();
    const submittedQuestion = currentQuestion.question;
    const submittedSkill = currentQuestion.skill || "general";

    try {
      // ---------------- AI EVALUATION ----------------

      const res = await axios.post(`${API_URL}/evaluate-answer`, {
        question: submittedQuestion,
        answer: submittedAnswer,
      });

      // Never use `|| 5` directly for score because it can hide
      // malformed/invalid values. Normalize the value explicitly.
      let aiScore = Number(res.data?.score);

      if (!Number.isFinite(aiScore)) {
        aiScore = 5;
      }

      // Always keep a score between 0 and 10.
      aiScore = Math.max(0, Math.min(10, aiScore));

      // Keep one decimal if the backend returns a decimal score.
      aiScore = Math.round(aiScore * 10) / 10;

      const aiFeedback =
        res.data?.feedback || "No feedback available.";

      // ---------------- CREATE ANSWER RECORD ----------------

      const answerRecord = {
        question: submittedQuestion,
        skill: submittedSkill,
        answer: submittedAnswer,
        score: aiScore,
        feedback: aiFeedback,
      };

      // Calculate the exact new total locally.
      // This avoids relying on asynchronous React state updates.
      const newScore = score + aiScore;
      const newAnswers = [...answers, answerRecord];

      // Update state.
      setScore(newScore);
      setAnswers(newAnswers);

      // ---------------- SHOW FEEDBACK ----------------

      setFeedback(
        `${aiFeedback} | Score: ${aiScore}/10`
      );

      // ---------------- LAST QUESTION ----------------

      if (currentIndex + 1 >= totalQuestions) {
        // Give the user time to see the final feedback.
        setTimeout(() => {
          setCompleted(true);
          setSubmitting(false);
        }, 1200);

        return;
      }

      // ---------------- GET ADAPTIVE QUESTION ----------------

      const adaptiveQuestion = await getAdaptiveQuestion({
        question: submittedQuestion,
        skill: submittedSkill,
        answer: submittedAnswer,
        score: aiScore,
      });

      // ---------------- MOVE TO NEXT QUESTION ----------------

      setTimeout(() => {
        if (adaptiveQuestion?.question) {
          setQuestions((prevQuestions) => {
            const updatedQuestions = [...prevQuestions];

            updatedQuestions[currentIndex + 1] = {
              question: adaptiveQuestion.question,
              skill:
                adaptiveQuestion.skill ||
                submittedSkill ||
                "general",
              difficulty:
                adaptiveQuestion.difficulty || "medium",
              adaptive: true,
            };

            return updatedQuestions;
          });
        }

        setCurrentIndex((prev) => prev + 1);
        setDescriptiveAnswer("");
        setFeedback("");
        setSubmitting(false);
      }, 1200);
    } catch (err) {
      console.log(
        "AI evaluation error:",
        err.response?.data || err.message
      );

      alert("AI evaluation failed. Please try again.");
      setSubmitting(false);
    }
  };

  // ---------------- SAVE INTERVIEW ----------------

  useEffect(() => {
    if (!completed || totalQuestions === 0) return;

    // Prevent duplicate saves caused by changes to score/answers after
    // completed becomes true.
    if (interviewSavedRef.current) return;

    const saveInterview = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.log("No token found");
          return;
        }

        interviewSavedRef.current = true;

        const response = await axios.post(
          `${API_URL}/save-interview`,
          {
            // Save the final SUM of scores.
            score,
            total_questions: answers.length,
            answers,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(
          "Interview saved successfully:",
          response.data
        );
      } catch (err) {
        // Allow a retry if the request itself failed.
        interviewSavedRef.current = false;

        console.log(
          "Error saving interview:",
          err.response?.data || err.message
        );
      }
    };

    saveInterview();
  }, [completed, score, answers, totalQuestions]);

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
        <div
          className="
            w-full max-w-2xl
            bg-white/10 backdrop-blur-2xl
            border border-white/20
            rounded-3xl
            p-10 text-center text-white
            shadow-[0_20px_80px_rgba(0,0,0,0.6)]
          "
        >
          <div className="text-4xl mb-3">🎉</div>

          <h2 className="text-3xl font-bold mb-4">
            Interview Completed
          </h2>

          <p
            className="
              text-5xl font-extrabold mb-2
              bg-gradient-to-r from-pink-400
              to-purple-400 bg-clip-text
              text-transparent
            "
          >
            {averageScore}%
          </p>

          <p className="text-gray-400 text-sm mb-3">
            {score} / {answeredQuestions * 10} points
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
      <div
        className="
          w-full max-w-2xl
          bg-white/10 backdrop-blur-2xl
          border border-white/20
          rounded-3xl
          p-8
          shadow-[0_20px_80px_rgba(0,0,0,0.5)]
          text-white
        "
      >
        {/* HEADER */}

        <div className="flex justify-between items-center mb-4 text-sm text-gray-300">
          <div>
            <p>
              Question {currentIndex + 1} / {totalQuestions}
            </p>

            {currentQuestion.adaptive && (
              <p className="text-pink-300 text-xs mt-1">
                ⚡ Adaptive follow-up based on your previous answer
              </p>
            )}
          </div>

          <p className="text-purple-300 font-semibold">
            Score: {score}
          </p>
        </div>

        {/* PROGRESS BAR */}

        <div className="w-full bg-white/10 rounded-full h-2 mb-4">
          <div
            className="
              bg-gradient-to-r
              from-pink-500
              to-purple-500
              h-2 rounded-full
              transition-all duration-500
            "
            style={{
              width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
            }}
          ></div>
        </div>

        {/* SKILL */}

        {currentQuestion.skill && (
          <div className="mb-3 flex flex-wrap gap-2">
            <span
              className="
                inline-block
                px-3 py-1
                rounded-full
                bg-purple-500/20
                border border-purple-500/30
                text-purple-300
                text-sm
              "
            >
              Skill: {currentQuestion.skill}
            </span>

            {currentQuestion.adaptive && (
              <span
                className="
                  inline-block
                  px-3 py-1
                  rounded-full
                  bg-pink-500/20
                  border border-pink-500/30
                  text-pink-300
                  text-sm
                "
              >
                ⚡ Adaptive Question
              </span>
            )}

            {currentQuestion.difficulty && (
              <span
                className="
                  inline-block
                  px-3 py-1
                  rounded-full
                  bg-indigo-500/20
                  border border-indigo-500/30
                  text-indigo-300
                  text-sm
                "
              >
                {currentQuestion.difficulty}
              </span>
            )}
          </div>
        )}

        {/* QUESTION */}

        <h3 className="text-xl font-semibold mb-6 leading-relaxed">
          {currentQuestion.question}
        </h3>

        {/* TEXTAREA */}

        <textarea
          value={descriptiveAnswer}
          onChange={(e) =>
            setDescriptiveAnswer(e.target.value)
          }
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
            focus:ring-2
            focus:ring-purple-500
            transition
            resize-y
          "
          rows={5}
          disabled={submitting}
        />

        {/* FEEDBACK */}

        {feedback && (
          <div
            className="
              mt-4
              p-3
              rounded-lg
              bg-purple-500/10
              border border-purple-500/30
              text-sm
              text-purple-200
            "
          >
            💡 {feedback}
          </div>
        )}

        {/* BUTTON */}

        <button
          onClick={submitAnswerAndNext}
          disabled={!descriptiveAnswer.trim() || submitting}
          className="
            mt-6
            w-full
            py-3
            rounded-xl
            bg-gradient-to-r
            from-pink-500
            via-purple-500
            to-indigo-500
            font-semibold
            text-lg
            shadow-lg
            hover:scale-[1.03]
            hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]
            transition-all
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {submitting
            ? "Evaluating & Adapting..."
            : currentIndex + 1 === totalQuestions
              ? "Submit & Finish 🎉"
              : "Submit & Next 🚀"}
        </button>
      </div>
    </div>
  );
}

export default InterviewSession;
