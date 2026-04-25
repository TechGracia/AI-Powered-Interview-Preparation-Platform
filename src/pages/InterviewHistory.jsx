import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

function InterviewHistory() {

  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://127.0.0.1:8000/interview-history",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setHistory(response.data || []);

      } catch {
        setHistory([]);
      }
    };

    fetchHistory();
  }, []);

  // 🎯 Score Label Logic
  const getPerformance = (score) => {
    if (score >= 80) return { label: "Excellent", color: "text-green-400" };
    if (score >= 60) return { label: "Good", color: "text-blue-400" };
    if (score >= 40) return { label: "Average", color: "text-yellow-400" };
    return { label: "Needs Work", color: "text-red-400" };
  };

  return (
    <div className="max-w-4xl mx-auto text-gray-200">

      {/* 🔥 HEADER */}
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <span className="text-2xl">📜</span>
        <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          Interview History
        </span>
      </h2>

      <p className="text-gray-400 mb-6">
        Track your performance and improve over time 🚀
      </p>

      {/* EMPTY */}
      {history.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl text-center text-gray-400">
          No interviews found.
        </div>
      ) : (

        <div className="space-y-5">

          {history.map((item, index) => {

            const score = Math.round(item.score);
            const perf = getPerformance(score);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative bg-white/10 backdrop-blur-lg border border-white/20 p-5 rounded-2xl shadow-lg hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1 transition-all duration-300"
              >

                {/* 🌈 Soft Glow Layer */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 blur-xl opacity-30 pointer-events-none" />

                {/* 🔥 Accent Line */}
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-pink-500 to-purple-500 rounded-l-2xl" />

                {/* TOP ROW */}
                <div className="flex justify-between items-center mb-3 relative z-10">

                  <div>
                    <p className="text-sm text-gray-400">
                      {new Date(item.date).toLocaleString()}
                    </p>

                    <p className={`text-sm font-medium ${perf.color}`}>
                      {perf.label}
                    </p>

                    {/* 📈 TREND */}
                    {index > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        {score > Math.round(history[index - 1].score)
                          ? "⬆ Improving"
                          : "⬇ Dropped"}
                      </p>
                    )}

                  </div>

                  {/* 💎 SCORE BADGE */}
                  <span className="px-4 py-1 rounded-full text-sm bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold shadow-[0_0_12px_rgba(168,85,247,0.5)]">
                    {score}%
                  </span>

                </div>

                {/* 📊 PROGRESS BAR (ANIMATED) */}
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4 relative z-10">

                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                  />

                </div>

                {/* BOTTOM ROW */}
                <div className="flex justify-between text-sm text-gray-300 relative z-10">

                  <p>
                    <span className="text-gray-400">Questions:</span>{" "}
                    {item.total_questions}
                  </p>

                  <p>
                    <span className="text-gray-400">Attempt:</span>{" "}
                    #{index + 1}
                  </p>

                </div>

              </motion.div>
            );
          })}

        </div>

      )}

    </div>
  );
}

export default InterviewHistory;