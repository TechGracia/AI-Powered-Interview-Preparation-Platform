import { useEffect, useState } from "react";
import {
  Target,
  AlertTriangle,
  Clock,
  CheckCircle,
  BookOpen,
  ArrowRight,
  Briefcase,
  Mic,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

export default function ImprovementPlan() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchImprovementPlan();
  }, []);

  const fetchImprovementPlan = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const jobDescription =
        localStorage.getItem("latestJobDescription") || "";

      if (!token) {
        setError("Please login again.");
        return;
      }

      if (!jobDescription.trim()) {
        setError(
          "Please analyze a Job Description first from the Job Match page."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/improvement-plan?job_description=${encodeURIComponent(
          jobDescription
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load improvement plan.");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityStyle = (priority) => {
    if (priority === "High") {
      return "border-red-500/30 bg-red-500/10 text-red-300";
    }

    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
  };

  const getPriorityIcon = (priority) => {
    if (priority === "High") {
      return <AlertTriangle size={18} />;
    }

    return <Clock size={18} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">
            Generating your personalized improvement plan...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 text-white">
        <div className="max-w-4xl mx-auto mt-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <AlertTriangle
              className="mx-auto mb-4 text-yellow-400"
              size={40}
            />

            <h2 className="text-xl font-semibold mb-2">
              Improvement Plan Unavailable
            </h2>

            <p className="text-gray-400 mb-6">{error}</p>

            <button
              onClick={() => navigate("/job-match")}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition"
            >
              Go to Job Match
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const summary = data.summary || {};
  const plan = data.plan || [];

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Target className="text-purple-400" size={28} />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Personalized Improvement Plan
              </h1>

              <p className="text-gray-400 mt-1">
                Practice the skills that matter most for your target job.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          {/* High Priority */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-red-500/10">
                <AlertTriangle className="text-red-400" size={22} />
              </div>

              <span className="text-2xl font-bold">
                {summary.high_priority || 0}
              </span>
            </div>

            <h3 className="font-semibold">High Priority</h3>
            <p className="text-sm text-gray-400 mt-1">
              Skills that need immediate attention
            </p>
          </div>

          {/* Medium Priority */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-yellow-500/10">
                <Clock className="text-yellow-400" size={22} />
              </div>

              <span className="text-2xl font-bold">
                {summary.medium_priority || 0}
              </span>
            </div>

            <h3 className="font-semibold">Medium Priority</h3>
            <p className="text-sm text-gray-400 mt-1">
              Skills to improve after high-priority areas
            </p>
          </div>

          {/* Missing Skills */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Briefcase className="text-blue-400" size={22} />
              </div>

              <span className="text-2xl font-bold">
                {summary.missing_job_skills || 0}
              </span>
            </div>

            <h3 className="font-semibold">Missing Job Skills</h3>
            <p className="text-sm text-gray-400 mt-1">
              Required skills not detected in your resume
            </p>
          </div>
        </div>

        {/* Plan */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                Your Practice Plan
              </h2>

              <p className="text-gray-400 text-sm mt-1">
                Focus on these areas to improve your interview readiness.
              </p>
            </div>

            <BookOpen className="text-purple-400" size={24} />
          </div>

          {plan.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle
                className="mx-auto text-green-400 mb-4"
                size={45}
              />

              <h3 className="text-xl font-semibold">
                You're doing well!
              </h3>

              <p className="text-gray-400 mt-2">
                No major improvement areas were identified.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {plan.map((item, index) => (
                <div
                  key={`${item.skill}-${index}`}
                  className="border border-white/10 rounded-xl p-5 hover:bg-white/[0.03] transition"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                    {/* Left */}
                    <div className="flex gap-4">

                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold">
                        {index + 1}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold capitalize">
                            {item.skill}
                          </h3>

                          <span
                            className={`px-2.5 py-1 rounded-full text-xs border ${getPriorityStyle(
                              item.priority
                            )}`}
                          >
                            <span className="inline-flex items-center gap-1">
                              {getPriorityIcon(item.priority)}
                              {item.priority} Priority
                            </span>
                          </span>
                        </div>

                        <p className="text-sm text-purple-300 mt-1">
                          {item.type}
                        </p>

                        <p className="text-gray-300 mt-3 leading-relaxed">
                          {item.recommendation}
                        </p>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="md:text-right min-w-[110px]">
                      <p className="text-xs text-gray-500 uppercase">
                        Current Score
                      </p>

                      <p className="text-xl font-bold mt-1">
                        {item.percentage ?? 0}%
                      </p>

                      {item.attempts !== undefined && (
                        <p className="text-xs text-gray-500">
                          {item.attempts} attempt
                          {item.attempts !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">

          <button
            onClick={() => navigate("/mock-interview")}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition font-medium"
          >
            <Mic size={19} />
            Practice Interview
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => navigate("/job-match")}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition font-medium"
          >
            <Briefcase size={19} />
            View Job Match
          </button>
        </div>

      </div>
    </div>
  );
}