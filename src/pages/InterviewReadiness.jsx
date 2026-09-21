import { useEffect, useState } from "react";

import {
  Target,
  Briefcase,
  Mic,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function InterviewReadiness() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // ==========================================================
  // FETCH READINESS DATA
  // ==========================================================

  useEffect(() => {
    fetchReadiness();
  }, []);

  const fetchReadiness = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        setLoading(false);
        return;
      }

      // =====================================================
      // GET THE LATEST JD FROM JOB MATCH
      // =====================================================

      const savedJobDescription = localStorage.getItem(
        "latestJobDescription"
      );

      if (!savedJobDescription) {
        setError(
          "Please analyze a job description from the Job Match page first."
        );

        setLoading(false);
        return;
      }

      setJobDescription(savedJobDescription);

      // =====================================================
      // FETCH READINESS
      // =====================================================

      const response = await fetch(
        `${API_URL}/interview-readiness?job_description=${encodeURIComponent(
          savedJobDescription
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Failed to load readiness score."
        );
      }

      setData(result);
    } catch (err) {
      console.error("Readiness error:", err);

      setError(
        err.message || "Failed to load interview readiness."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto text-center text-gray-300 mt-10">
        Loading interview readiness...
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl p-5">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // ==========================================================
  // READINESS SCORE
  // ==========================================================

  const readiness = Math.round(data.readiness_score || 0);

  // ==========================================================
  // SKILL DATA
  // ==========================================================

  const skills = data.skill_performance?.skills || [];

  // ----------------------------------------------------------
  // Strengths
  // 80% and above
  // ----------------------------------------------------------

  const strengths =
    data.strengths?.length > 0
      ? data.strengths
      : skills.filter(
          (item) => (item.percentage ?? 0) >= 80
        );

  // ----------------------------------------------------------
  // Performance Insights
  // Below 80%
  // ----------------------------------------------------------

  const improvementSkills = skills.filter(
    (item) => (item.percentage ?? 0) < 80
  );

  return (
    <div className="max-w-6xl mx-auto text-gray-200">

      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}

      <div className="mb-8">

        <div className="flex items-center gap-4">

          <div className="p-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600">

            <Target
              size={30}
              className="text-white"
            />

          </div>

          <div>

            <h1 className="text-3xl font-bold text-white">
              Interview Readiness
            </h1>

            <p className="text-gray-400 mt-1">
              Understand how prepared you are for your target role.
            </p>

          </div>

        </div>


        {/* ================================================== */}
        {/* TARGET JOB INDICATOR */}
        {/* ================================================== */}

        <div className="mt-5 bg-white/5 border border-white/10 rounded-xl p-4">

          <div className="flex items-center gap-3">

            <Briefcase
              size={20}
              className="text-blue-400"
            />

            <div>

              <p className="text-sm text-gray-400">
                Readiness calculated for
              </p>

              <p className="text-white font-semibold">
                Latest analyzed job description
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ==================================================== */}
      {/* READINESS SCORE */}
      {/* ==================================================== */}

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-6">

        <div className="text-center">

          <p className="text-gray-400 text-sm uppercase tracking-wider">
            Overall Readiness
          </p>

          <div className="text-6xl font-bold text-purple-400 mt-3">
            {readiness}%
          </div>

          <p className="text-xl font-semibold text-white mt-2">
            {data.readiness_status}
          </p>


          {/* PROGRESS BAR */}

          <div className="max-w-2xl mx-auto mt-6">

            <div className="h-4 bg-slate-800 rounded-full overflow-hidden">

              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-700"
                style={{
                  width: `${Math.min(
                    Math.max(readiness, 0),
                    100
                  )}%`,
                }}
              />

            </div>

          </div>

        </div>

      </div>


      {/* ==================================================== */}
      {/* SCORE BREAKDOWN */}
      {/* ==================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

        <ScoreCard
          icon={Briefcase}
          title="Job Match"
          score={data.job_match?.score || 0}
          color="text-blue-400"
        />


        <ScoreCard
          icon={Mic}
          title="Interview Performance"
          score={data.interview_performance?.score || 0}
          color="text-green-400"
        />


        <ScoreCard
          icon={BarChart3}
          title="Skill Performance"
          score={data.skill_performance?.score || 0}
          color="text-purple-400"
        />

      </div>


      {/* ==================================================== */}
      {/* PERFORMANCE INSIGHTS */}
      {/* ==================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


        {/* ================================================== */}
        {/* STRENGTHS */}
        {/* ================================================== */}

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-5">

            <CheckCircle
              className="text-green-400"
              size={24}
            />

            <h2 className="text-xl font-semibold text-white">
              Your Strengths
            </h2>

          </div>


          {strengths.length > 0 ? (

            <div className="space-y-3">

              {strengths.map((item, index) => {

                /*
                 * IMPORTANT:
                 * score = 0-10
                 * percentage = 0-100
                 *
                 * We display percentage here.
                 */

                const percentage =
                  item.percentage ??
                  Math.round((item.score || 0) * 10);

                return (

                  <div
                    key={`${item.skill}-${index}`}
                    className="flex justify-between items-center bg-green-950/20 border border-green-500/20 rounded-xl px-4 py-3"
                  >

                    <span className="capitalize">
                      {item.skill}
                    </span>

                    <span className="text-green-400 font-semibold">
                      {percentage}%
                    </span>

                  </div>

                );

              })}

            </div>

          ) : (

            <p className="text-gray-400">
              No strong skills identified yet.
            </p>

          )}

        </div>


        {/* ================================================== */}
        {/* PERFORMANCE INSIGHTS */}
        {/* ================================================== */}

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-5">

            <AlertTriangle
              className="text-yellow-400"
              size={24}
            />

            <h2 className="text-xl font-semibold text-white">
              Performance Insights
            </h2>

          </div>


          {improvementSkills.length > 0 ? (

            <div className="space-y-3">

              {improvementSkills.map((item, index) => {

                const percentage =
                  item.percentage ??
                  Math.round((item.score || 0) * 10);

                let status = "Average";
                let statusColor = "text-yellow-400";
                let borderColor = "border-yellow-500/20";
                let bgColor = "bg-yellow-950/20";


                if (percentage < 60) {

                  status = "Needs Improvement";

                  statusColor = "text-red-400";

                  borderColor = "border-red-500/20";

                  bgColor = "bg-red-950/20";

                }


                return (

                  <div
                    key={`${item.skill}-${index}`}
                    className={`flex justify-between items-center ${bgColor} border ${borderColor} rounded-xl px-4 py-3`}
                  >

                    <div>

                      <span className="capitalize">
                        {item.skill}
                      </span>

                    </div>


                    <div className="flex items-center gap-3">

                      <span
                        className={`text-sm font-medium ${statusColor}`}
                      >
                        {status}
                      </span>

                      <span className="text-white font-semibold">
                        {percentage}%
                      </span>

                    </div>

                  </div>

                );

              })}

            </div>

          ) : (

            <p className="text-gray-400">
              All analyzed skills are currently strong.
            </p>

          )}

        </div>

      </div>


      {/* ==================================================== */}
      {/* MISSING JOB SKILLS */}
      {/* ==================================================== */}

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mt-6">

        <div className="flex items-center gap-3 mb-5">

          <Briefcase
            className="text-orange-400"
            size={24}
          />

          <h2 className="text-xl font-semibold text-white">
            Missing Skills for This Job
          </h2>

        </div>


        {data.job_match?.missing_skills?.length > 0 ? (

          <div className="flex flex-wrap gap-3">

            {data.job_match.missing_skills.map(
              (skill) => (

                <span
                  key={skill}
                  className="px-4 py-2 rounded-lg bg-orange-950/40 border border-orange-500/30 text-orange-300"
                >
                  {skill}
                </span>

              )
            )}

          </div>

        ) : (

          <p className="text-green-400">
            No missing skills detected for this job description.
          </p>

        )}

      </div>


      {/* ==================================================== */}
      {/* TARGET JOB DESCRIPTION */}
      {/* ==================================================== */}

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mt-6">

        <div className="flex items-center gap-3 mb-4">

          <FileTextIcon />

          <h2 className="text-xl font-semibold text-white">
            Analyzed Job Description
          </h2>

        </div>


        <div className="bg-black/20 border border-white/10 rounded-xl p-4 max-h-48 overflow-y-auto">

          <p className="text-gray-400 text-sm whitespace-pre-line">
            {jobDescription}
          </p>

        </div>

      </div>


      {/* ==================================================== */}
      {/* NEXT ACTION */}
      {/* ==================================================== */}

      <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-purple-500/20 rounded-2xl p-6 mt-6">

        <h2 className="text-xl font-semibold text-white mb-2">
          Recommended Next Step
        </h2>

        <p className="text-gray-400">
          Focus on your improvement areas and missing job skills,
          then take another mock interview to measure your progress.
        </p>


        <button
          onClick={() =>
            window.location.href = "/mock-interview"
          }
          className="mt-5 flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-semibold hover:scale-105 transition"
        >

          Practice Interview

          <ArrowRight size={18} />

        </button>

      </div>

    </div>
  );
}


/* ============================================================
   FILE ICON
============================================================ */

function FileTextIcon() {

  return (

    <div className="p-2 rounded-lg bg-purple-500/10">

      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-purple-400"
      >

        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        />

        <polyline points="14 2 14 8 20 8" />

        <line
          x1="16"
          y1="13"
          x2="8"
          y2="13"
        />

        <line
          x1="16"
          y1="17"
          x2="8"
          y2="17"
        />

      </svg>

    </div>

  );
}


/* ============================================================
   SCORE CARD
============================================================ */

function ScoreCard({
  icon: Icon,
  title,
  score,
  color,
}) {

  return (

    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">

      <div className="flex items-center gap-3">

        <div className="p-3 rounded-xl bg-white/10">

          <Icon
            size={24}
            className={color}
          />

        </div>


        <div>

          <p className="text-gray-400 text-sm">
            {title}
          </p>

          <p className={`text-3xl font-bold ${color}`}>
            {score}%
          </p>

        </div>

      </div>

    </div>

  );
}


export default InterviewReadiness;