import { useState, useEffect, useRef, useCallback } from "react";

function MockInterviewSession({ questions }) {

  // ---------------- STATE ----------------
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [completed, setCompleted] = useState(false);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showReview, setShowReview] = useState(false);

  const questionList = questions || [];
  const currentQuestion = questionList[currentIndex];
  const totalQuestions = questionList.length;

  const prevIndex = useRef(currentIndex);

  // ---------------- NEXT ----------------
  const handleNext = useCallback(() => {
    if (!currentQuestion) return;

    let baseScore = 10;

    if (currentQuestion.level === "medium") baseScore = 15;
    if (currentQuestion.level === "hard") baseScore = 20;

    const isCorrect = selected === currentQuestion.answer;

    setAnswers((prev) => [
      ...prev,
      {
        question: currentQuestion.question,
        selected,
        correct: currentQuestion.answer,
      },
    ]);

    if (isCorrect) {
      const bonus = streak * 2;
      setScore((prev) => prev + baseScore + bonus);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }

    if (currentIndex + 1 >= totalQuestions) {
      setCompleted(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
    }
  }, [selected, currentIndex, totalQuestions, streak, currentQuestion]);

  // ---------------- TIMER ----------------
  useEffect(() => {
    if (completed) return;

    if (timeLeft === 0) {
      handleNext();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, completed, handleNext]);

  // ---------------- RESET TIMER ----------------
  useEffect(() => {
    if (prevIndex.current !== currentIndex) {
      setTimeLeft(15);
      prevIndex.current = currentIndex;
    }
  }, [currentIndex]);

  const maxScore = totalQuestions * 20;
  const finalScore =
    maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  const progress =
    totalQuestions > 0
      ? ((currentIndex + 1) / totalQuestions) * 100
      : 0;

  // ---------------- REVIEW ----------------
  if (showReview) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#0f172a] p-6">
        <div className="w-full max-w-3xl p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-white">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Review Answers
          </h2>

          {answers.map((item, index) => {
            const isCorrect = item.selected === item.correct;

            return (
              <div
                key={index}
                className={`p-4 mb-4 rounded-lg border ${
                  isCorrect
                    ? "border-green-500 bg-green-500/10"
                    : "border-red-500 bg-red-500/10"
                }`}
              >
                <p className="font-semibold mb-2">
                  Q{index + 1}: {item.question}
                </p>

                <p>
                  Your Answer:
                  <span
                    className={
                      isCorrect ? "text-green-400" : "text-red-400"
                    }
                  >
                    {" "}
                    {item.selected || "Not Answered"}
                  </span>
                </p>

                {!isCorrect && (
                  <p className="text-green-400">
                    Correct: {item.correct}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ---------------- RESULT ----------------
  if (completed) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#0f172a] p-6">
        <div className="w-full max-w-xl p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Mock Interview Completed 🎉
          </h2>

          <p className="text-xl mb-2">Score: {finalScore}%</p>
          <p className="mb-4">🔥 Streak: {streak}</p>

          <button
            onClick={() => setShowReview(true)}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105 transition"
          >
            Review Answers
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return <div>Loading...</div>;

  // ---------------- UI ----------------
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] relative overflow-hidden">

      {/* Glow Effects */}
      <div className="absolute w-80 h-80 bg-purple-500 opacity-30 blur-3xl rounded-full top-10 left-10"></div>
      <div className="absolute w-80 h-80 bg-pink-500 opacity-30 blur-3xl rounded-full bottom-10 right-10"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-2xl p-10 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">

        {/* Header */}
        <div className="flex justify-between mb-5 text-base text-gray-300">
          <span className="text-purple-400 font-semibold">
            {currentQuestion.category || "General"}
          </span>

          <span>
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>

        {/* Progress */}
        <div className="w-full bg-gray-700 h-3 rounded mb-6">
          <div
            className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Timer */}
        <div className="text-right text-red-400 font-bold text-lg mb-4">
          ⏱ {timeLeft}s
        </div>

        {/* Question */}
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {currentQuestion.question}
        </h2>

        {/* Options */}
        <div className="space-y-4">
          {currentQuestion.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(opt)}
              className={`w-full text-left px-6 py-4 rounded-xl border transition-all duration-200

              ${
                selected === opt
                  ? "border-pink-500 bg-gradient-to-r from-purple-600/40 to-pink-600/40 shadow-lg shadow-pink-500/30 scale-[1.02]"
                  : "border-white/20 bg-white/5 hover:bg-white/10 hover:scale-[1.02]"
              }

              text-white`}
            >
              <span className="font-semibold mr-3 text-purple-300">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>

        {/* Streak */}
        <p className="mt-4 text-orange-400">
          🔥 Streak: {streak}
        </p>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:scale-105 transition"
        >
          {currentIndex + 1 === totalQuestions ? "Finish" : "Next →"}
        </button>

      </div>
    </div>
  );
}

export default MockInterviewSession;