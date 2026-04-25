import { useEffect, useState } from "react";
import axios from "axios";
import {
  Trophy,
  BarChart3,
  FileText,
  Flame,
  Brain,
  Sparkles
} from "lucide-react";
import ScoreChart from "../components/ScoreChart";

function Profile() {

  const getUserEmail = () => {
    const token = localStorage.getItem("token");
    if (!token) return "";

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub;
    } catch {
      return "";
    }
  };

  const [email] = useState(() => getUserEmail());
  const [history, setHistory] = useState([]);
  const [bestScore, setBestScore] = useState(0);
  const [resumeCount, setResumeCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [hRes, rRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/interview-history", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://127.0.0.1:8000/resume-count", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const data = hRes.data || [];
        setHistory(data);
        setResumeCount(rRes.data.count || 0);

        if (data.length > 0) {
          const scores = data.map((i) => i.score || 0);
          setBestScore(Math.max(...scores));
        }

      } catch (err) {
        console.log(err);
      }
    };

    loadData();
  }, []);

  const interviewsCompleted = history.length;

  const averageScore =
    history.length > 0
      ? Math.round(
          history.reduce((sum, item) => sum + (item.score || 0), 0) /
          history.length
        )
      : 0;

  // -------- RANK --------
  const getRank = () => {
    if (averageScore >= 80) return "🏆 Expert";
    if (averageScore >= 60) return "🥈 Intermediate";
    if (averageScore >= 40) return "🥉 Beginner";
    return "📚 Learner";
  };

  // -------- AI INSIGHT --------
  const getInsight = () => {
    if (averageScore >= 80) return "You're performing at an expert level. Focus on advanced system design.";
    if (averageScore >= 60) return "Good progress! Strengthen weak areas to reach expert level.";
    if (averageScore >= 40) return "You're improving. Practice more mock interviews.";
    return "Start consistently practicing to improve your confidence.";
  };

  // -------- WEEKLY IMPROVEMENT --------
  const getImprovement = () => {
    if (history.length < 2) return 0;

    const last = history[history.length - 1].score;
    const prev = history[history.length - 2].score;

    return Math.round(last - prev);
  };

  const improvement = getImprovement();

  return (
    <div className="max-w-6xl mx-auto text-gray-200">

      {/* ---------------- HEADER ---------------- */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl flex items-center gap-6 mb-8">

        <img
          src={`https://ui-avatars.com/api/?name=${email}&background=7c3aed&color=fff`}
          className="w-20 h-20 rounded-full border-2 border-purple-500"
        />

        <div>
          <h1 className="text-2xl font-bold text-white">{email}</h1>
          <p className="text-purple-400">{getRank()}</p>

          {improvement !== 0 && (
            <p className={`text-sm mt-1 ${improvement > 0 ? "text-green-400" : "text-red-400"}`}>
              {improvement > 0 ? `+${improvement}% improvement` : `${improvement}% drop`}
            </p>
          )}
        </div>

      </div>

      {/* ---------------- STATS ---------------- */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">

        <Card icon={FileText} label="Resumes" value={resumeCount} color="text-blue-400" />
        <Card icon={BarChart3} label="Interviews" value={interviewsCompleted} color="text-green-400" />
        <Card icon={Trophy} label="Average" value={`${averageScore}%`} color="text-purple-400" />
        <Card icon={Flame} label="Best" value={`${bestScore}%`} color="text-pink-400" />

      </div>

      {/* ---------------- CHART ---------------- */}
      <ScoreChart history={history} />

      {/* ---------------- AI INSIGHT ---------------- */}
      <div className="mt-8 bg-white/10 p-6 rounded-2xl border border-white/20 flex gap-4">

        <Brain className="text-purple-400" />

        <div>
          <h3 className="font-semibold text-white flex items-center gap-2">
            AI Insight <Sparkles size={16} />
          </h3>
          <p className="text-gray-400 mt-1">
            {getInsight()}
          </p>
        </div>

      </div>

      {/* ---------------- ACHIEVEMENTS ---------------- */}
      <div className="mt-8">

        <h2 className="text-lg font-semibold mb-4">
          🏆 Achievements
        </h2>

        <div className="flex gap-4 flex-wrap">

          {averageScore >= 80 && <Badge text="Expert Level" />}
          {interviewsCompleted >= 5 && <Badge text="Consistent Performer" />}
          {bestScore >= 90 && <Badge text="High Achiever" />}
          {resumeCount >= 3 && <Badge text="Prepared Candidate" />}

        </div>

      </div>

    </div>
  );
}

// -------- REUSABLE CARD --------
function Card({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/10 p-5 rounded-xl border border-white/20 hover:scale-[1.02] transition">
      <Icon className={`${color} mb-2`} />
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

// -------- BADGE --------
function Badge({ text }) {
  return (
    <div className="px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm">
      {text}
    </div>
  );
}

export default Profile;