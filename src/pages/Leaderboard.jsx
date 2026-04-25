import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

function Leaderboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/leaderboard");
        setData(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.log(err);
        setData([]);
      }
    };

    fetchLeaderboard();
  }, []);

  const top3 = data.slice(0, 3);
  const others = data.slice(3);

  return (
    <div className="max-w-6xl mx-auto text-gray-200">

      {/* TITLE */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center text-white mb-12"
      >
        🏆 Leaderboard
      </motion.h1>

      {/* ================= PODIUM ================= */}
      {top3.length > 0 && (
        <div className="flex justify-center items-end gap-6 mb-14">

          {top3[1] && <PodiumCard user={top3[1]} rank={2} />}
          {top3[0] && <PodiumCard user={top3[0]} rank={1} big />}
          {top3[2] && <PodiumCard user={top3[2]} rank={3} />}

        </div>
      )}

      {/* ================= TABLE ================= */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl shadow-[0_0_40px_rgba(168,85,247,0.15)]"
      >
        {others.length === 0 ? (
          <p className="text-center text-gray-400 py-6">
            No more users yet 🚀
          </p>
        ) : (
          <table className="w-full text-left">

            <thead>
              <tr className="border-b border-white/10 text-gray-400">
                <th className="py-3 px-2">Rank</th>
                <th className="py-3 px-2">User</th>
                <th className="py-3 px-2">Score</th>
                <th className="py-3 px-2">Date</th>
              </tr>
            </thead>

            <tbody>
              {others.map((item, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/10 hover:bg-white/5 transition"
                >

                  <td className="py-3 px-2 font-semibold">
                    {index + 4}
                  </td>

                  <td className="py-3 px-2 flex items-center gap-3">
                    <img
                      src={`https://ui-avatars.com/api/?name=${item.email}`}
                      className="w-8 h-8 rounded-full"
                    />
                    {item.email}
                  </td>

                  <td className="py-3 px-2 text-purple-400 font-semibold">
                    {Math.round(item.score)}%
                  </td>

                  <td className="py-3 px-2 text-gray-400">
                    {new Date(item.date).toLocaleString()}
                  </td>

                </motion.tr>
              ))}
            </tbody>

          </table>
        )}
      </motion.div>

    </div>
  );
}

/* ================= PODIUM CARD ================= */

function PodiumCard({ user, rank, big }) {

  const styles = {
    1: "from-yellow-400 to-orange-500 shadow-yellow-400/30",
    2: "from-gray-300 to-gray-500 shadow-gray-400/20",
    3: "from-orange-400 to-orange-600 shadow-orange-400/20"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.08 }}
      className={`
        ${big ? "w-64 scale-110" : "w-52"}
        relative p-6 rounded-3xl text-center
        bg-white/10 backdrop-blur-xl border border-white/20
        shadow-xl ${styles[rank]}
        transition-all duration-300
      `}
    >

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br opacity-20 blur-xl pointer-events-none" />

      {/* Rank */}
      <div className="text-3xl mb-2">
        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
      </div>

      {/* Avatar */}
      <motion.img
        whileHover={{ rotate: 5 }}
        src={`https://ui-avatars.com/api/?name=${user.email}`}
        className="w-16 h-16 mx-auto rounded-full border-2 border-white mb-3"
      />

      {/* Email */}
      <p className="text-sm font-semibold break-all text-white">
        {user.email}
      </p>

      {/* Score */}
      <p className="text-xl font-bold mt-2 text-white">
        {Math.round(user.score)}%
      </p>

    </motion.div>
  );
}

export default Leaderboard;
