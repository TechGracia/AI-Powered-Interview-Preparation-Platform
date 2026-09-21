import { useEffect, useState } from "react";
import { BarChart3, Target, TrendingUp, AlertTriangle } from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function SkillGap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSkillGap();
  }, []);

  const fetchSkillGap = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(`${API_URL}/skill-gap`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Failed to load skill analysis.");
      }

      setData(result);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-300 mt-12">
        Loading skill analysis...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-5">
          {error}
        </div>
      </div>
    );
  }

  const skills = data?.skills || [];
  const weakSkills = data?.weak_skills || [];

  const overallScore =
    skills.length > 0
      ? Math.round(
          skills.reduce((sum, skill) => sum + skill.percentage, 0) /
            skills.length
        )
      : 0;

  return (
    <div className="max-w-6xl mx-auto text-gray-200">

      {/* HEADER */}
      <div className="mb-8">

        <div className="flex items-center gap-4">

          <div className="p-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600">
            <BarChart3 size={28} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white">
              Skill Gap Analysis
            </h1>

            <p className="text-gray-400 mt-1">
              Analyze your interview performance by individual skill.
            </p>
          </div>

        </div>

      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* OVERALL */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-4">

            <div className="p-3 rounded-xl bg-purple-500/20">
              <Target className="text-purple-400" size={22} />
            </div>

            <span className="text-gray-400">
              Overall Skill Score
            </span>

          </div>

          <div className="text-4xl font-bold text-purple-400">
            {overallScore}%
          </div>

        </div>

        {/* SKILLS */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-4">

            <div className="p-3 rounded-xl bg-blue-500/20">
              <BarChart3 className="text-blue-400" size={22} />
            </div>

            <span className="text-gray-400">
              Skills Analyzed
            </span>

          </div>

          <div className="text-4xl font-bold text-blue-400">
            {skills.length}
          </div>

        </div>

        {/* WEAK SKILLS */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-4">

            <div className="p-3 rounded-xl bg-orange-500/20">
              <AlertTriangle className="text-orange-400" size={22} />
            </div>

            <span className="text-gray-400">
              Skills to Improve
            </span>

          </div>

          <div className="text-4xl font-bold text-orange-400">
            {weakSkills.length}
          </div>

        </div>

      </div>

      {/* SKILL PERFORMANCE */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">

        <div className="flex items-center gap-3 mb-6">

          <TrendingUp className="text-purple-400" />

          <h2 className="text-xl font-semibold text-white">
            Skill Performance
          </h2>

        </div>

        {skills.length === 0 ? (
          <p className="text-gray-400">
            No skill data available yet.
          </p>
        ) : (
          <div className="space-y-6">

            {skills.map((item) => {

              let barColor = "bg-red-500";
              let textColor = "text-red-400";

              if (item.status === "Strong") {
                barColor = "bg-green-500";
                textColor = "text-green-400";
              } else if (item.status === "Average") {
                barColor = "bg-yellow-500";
                textColor = "text-yellow-400";
              }

              return (
                <div key={item.skill}>

                  {/* NAME + SCORE */}
                  <div className="flex justify-between mb-2">

                    <div>
                      <span className="font-medium text-white capitalize">
                        {item.skill}
                      </span>

                      <span className="text-xs text-gray-500 ml-3">
                        {item.attempts} attempt
                        {item.attempts !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">

                      <span className={`text-sm font-semibold ${textColor}`}>
                        {item.status}
                      </span>

                      <span className="font-bold text-white">
                        {item.percentage}%
                      </span>

                    </div>

                  </div>

                  {/* PROGRESS BAR */}
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">

                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-700`}
                      style={{
                        width: `${item.percentage}%`,
                      }}
                    />

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* WEAK SKILLS */}
      {weakSkills.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-4">

            <AlertTriangle className="text-orange-400" />

            <h2 className="text-xl font-semibold text-white">
              Skills That Need Improvement
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {weakSkills.map((skill) => (
              <div
                key={skill.skill}
                className="bg-black/20 rounded-xl p-4 border border-orange-500/20"
              >

                <div className="flex justify-between">

                  <span className="capitalize font-semibold">
                    {skill.skill}
                  </span>

                  <span className="text-orange-400 font-bold">
                    {skill.percentage}%
                  </span>

                </div>

                <p className="text-gray-400 text-sm mt-2">
                  Practice more questions related to {skill.skill}.
                </p>

              </div>
            ))}

          </div>

        </div>
      )}

    </div>
  );
}

export default SkillGap;