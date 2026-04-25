console.log("Dashboard mounted");
import ResumeUpload from "../components/resumeupload";
import StatsCard from "../components/statscard";
import { useEffect, useState } from "react";
import axios from "axios";
import ScoreChart from "../components/ScoreChart";
import Footer from "../components/footer";
import { useNavigate } from "react-router-dom";
import { FileText, BarChart3, TrendingUp } from "lucide-react";

function Dashboard() {

  const [history, setHistory] = useState([]);
  const [resumeCount, setResumeCount] = useState(0);
  const [loading, setLoading] = useState(true); // ✅ FIX
  const navigate = useNavigate();

  // ---------------- FETCH ALL DATA ----------------
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found");
        setLoading(false);
        return;
      }

      const [historyRes, resumeRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/interview-history", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://127.0.0.1:8000/resume-count", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // ✅ SAFE DATA HANDLING
      setHistory(historyRes.data || []);
      setResumeCount(
        resumeRes.data?.count || resumeRes.data?.resume_count || 0
      );

    } catch (error) {
      console.log("Dashboard fetch error:", error);
      setHistory([]);
      setResumeCount(0);
    } finally {
      setLoading(false); // ✅ VERY IMPORTANT
    }
  };

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    fetchData();
  }, []);

  // ---------------- LOADING STATE ----------------
  if (loading) {
    return (
      <div className="text-white text-center mt-10 text-lg">
        Loading...
      </div>
    );
  }

  // ---------------- COMPUTED ----------------
  const interviewsCompleted = history.length;

  const averageScore =
    history.length > 0
      ? Math.round(
          history.reduce((sum, item) => sum + (item.score || 0), 0) /
            history.length
        )
      : 0;

  // ---------------- DATE FORMAT ----------------
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (

    <div className="max-w-6xl mx-auto text-gray-200 min-h-[calc(100vh-80px)]">

      {/* ---------------- STATS ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <StatsCard
          title="Resumes Uploaded"
          value={resumeCount}
          color="text-blue-400"
          icon={FileText}
        />

        <StatsCard
          title="Interviews Completed"
          value={interviewsCompleted}
          color="text-green-400"
          icon={BarChart3}
        />

        <StatsCard
          title="Average Score"
          value={`${averageScore}%`}
          color="text-purple-400"
          icon={TrendingUp}
        />

      </div>

      {/* ---------------- RESUME UPLOAD ---------------- */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <ResumeUpload
          refreshStats={fetchData} // ✅ FIX (cleaner)
        />
      </div>

      {/* ---------------- BUTTON ---------------- */}
      <button
        onClick={() => navigate("/mock-interview")}
        className="mt-8 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:scale-105 transition"
      >
        Start Mock Interview 🚀
      </button>

      {/* ---------------- HISTORY ---------------- */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl mt-8">

        <h2 className="text-xl font-semibold mb-4 text-white">
          Interview History
        </h2>

        {history.length === 0 ? (
          <p className="text-gray-400">
            No interviews taken yet.
          </p>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>
                <tr className="border-b border-white/10 text-gray-300">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Score</th>
                  <th className="py-3 px-3">Questions</th>
                </tr>
              </thead>

              <tbody>
                {history.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-white/10 hover:bg-white/5 transition"
                  >
                    <td className="py-3 px-3">
                      {formatDate(item.date)}
                    </td>

                    <td className="py-3 px-3 text-purple-400 font-semibold">
                      {Math.round(item.score)}%
                    </td>

                    <td className="py-3 px-3">
                      {item.total_questions}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ---------------- CHART ---------------- */}
      <div className="mt-8">
        <ScoreChart history={history} />
      </div>

      {/* ---------------- FOOTER ---------------- */}
      <div className="mt-8 text-gray-400 text-center">
        <Footer />
      </div>

    </div>

  );
}

export default Dashboard;