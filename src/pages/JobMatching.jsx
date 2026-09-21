import { useState } from "react";
import {
  Briefcase,
  CheckCircle,
  AlertTriangle,
  FileText
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

export default function JobMatching() {
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMatch = async () => {
    if (!jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("access_token");

      if (!token) {
        setError(
          "Please login again. Authentication token not found."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/job-match?job_description=${encodeURIComponent(
          jobDescription
        )}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Job matching failed."
        );
      }

      // Store the latest JD so other features
      // such as Interview Readiness can use it.
      localStorage.setItem(
        "latestJobDescription",
        jobDescription
      );

      // Store the complete job-match result.
      // This also allows the readiness page to reuse
      // the latest missing/matched skills.
      localStorage.setItem(
        "latestJobMatch",
        JSON.stringify(data)
      );

      setResult(data);

    } catch (err) {
      console.error("Job matching error:", err);
      setError(
        err.message || "Something went wrong."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto text-gray-200 min-h-[calc(100vh-80px)]">

      {/* ===================================================== */}
      {/* PAGE HEADER */}
      {/* ===================================================== */}

      <div className="mb-8">

        <div className="flex items-center gap-4">

          <div className="p-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg">
            <Briefcase
              size={26}
              className="text-white"
            />
          </div>

          <div>

            <h1 className="text-3xl font-bold text-white">
              Job Description Matching
            </h1>

            <p className="text-gray-400 mt-1">
              Compare your resume with a job description
              and identify your skill gaps.
            </p>

          </div>

        </div>

      </div>


      {/* ===================================================== */}
      {/* JOB DESCRIPTION INPUT */}
      {/* ===================================================== */}

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">

        <div className="flex items-center gap-3 mb-5">

          <FileText
            size={21}
            className="text-purple-400"
          />

          <h2 className="text-xl font-semibold text-white">
            Job Description
          </h2>

        </div>

        <p className="text-gray-400 text-sm mb-4">
          Paste the job description below. InterviewIQ
          will compare the required skills with the skills
          extracted from your resume.
        </p>

        <textarea
          value={jobDescription}
          onChange={(e) =>
            setJobDescription(e.target.value)
          }
          placeholder="Paste the job description here..."
          rows={9}
          className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition"
        />

        <div className="flex justify-end mt-5">

          <button
            onClick={handleMatch}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:scale-105 transition shadow-lg disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading
              ? "Analyzing..."
              : "Analyze Job Match →"}
          </button>

        </div>

      </div>


      {/* ===================================================== */}
      {/* ERROR */}
      {/* ===================================================== */}

      {error && (
        <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl p-4">
          {error}
        </div>
      )}


      {/* ===================================================== */}
      {/* RESULTS */}
      {/* ===================================================== */}

      {result && (
        <div className="mt-8 space-y-6">

          {/* ================================================= */}
          {/* MATCH SCORE */}
          {/* ================================================= */}

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">

            <div className="flex items-center justify-between mb-4">

              <div>

                <p className="text-gray-400 text-sm">
                  Resume Match
                </p>

                <h2 className="text-4xl font-bold text-purple-400 mt-1">
                  {result.match_percentage}%
                </h2>

              </div>

              <div className="text-right">

                <p className="text-gray-500 text-sm">
                  Job Compatibility
                </p>

              </div>

            </div>

            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">

              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-700"
                style={{
                  width: `${result.match_percentage}%`,
                }}
              />

            </div>

          </div>


          {/* ================================================= */}
          {/* MATCHED + MISSING SKILLS */}
          {/* ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* MATCHED SKILLS */}

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">

              <div className="flex items-center gap-3 mb-5">

                <div className="p-2 rounded-lg bg-green-500/10">

                  <CheckCircle
                    size={22}
                    className="text-green-400"
                  />

                </div>

                <h2 className="text-xl font-semibold text-white">
                  Matched Skills
                </h2>

              </div>

              <div className="flex flex-wrap gap-2">

                {result.matched_skills?.length > 0 ? (

                  result.matched_skills.map((skill) => (

                    <span
                      key={skill}
                      className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 text-sm"
                    >
                      {skill}
                    </span>

                  ))

                ) : (

                  <p className="text-gray-500">
                    No matching skills found.
                  </p>

                )}

              </div>

            </div>


            {/* MISSING SKILLS */}

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">

              <div className="flex items-center gap-3 mb-5">

                <div className="p-2 rounded-lg bg-orange-500/10">

                  <AlertTriangle
                    size={22}
                    className="text-orange-400"
                  />

                </div>

                <h2 className="text-xl font-semibold text-white">
                  Skills to Improve
                </h2>

              </div>

              <div className="flex flex-wrap gap-2">

                {result.missing_skills?.length > 0 ? (

                  result.missing_skills.map((skill) => (

                    <span
                      key={skill}
                      className="px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300 text-sm"
                    >
                      {skill}
                    </span>

                  ))

                ) : (

                  <p className="text-gray-500">
                    No missing skills detected.
                  </p>

                )}

              </div>

            </div>

          </div>


          {/* ================================================= */}
          {/* RESUME SKILLS */}
          {/* ================================================= */}

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">

            <div className="flex items-center gap-3 mb-5">

              <div className="p-2 rounded-lg bg-purple-500/10">

                <FileText
                  size={22}
                  className="text-purple-400"
                />

              </div>

              <div>

                <h2 className="text-xl font-semibold text-white">
                  Your Resume Skills
                </h2>

                <p className="text-gray-400 text-sm mt-1">
                  Skills extracted from your latest uploaded
                  resume.
                </p>

              </div>

            </div>

            <div className="flex flex-wrap gap-2">

              {result.resume_skills?.length > 0 ? (

                result.resume_skills.map((skill) => (

                  <span
                    key={skill}
                    className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm"
                  >
                    {skill}
                  </span>

                ))

              ) : (

                <p className="text-gray-500">
                  No resume skills found.
                </p>

              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}