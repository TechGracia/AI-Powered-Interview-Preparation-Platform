import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ResumeUpload({ refreshStats }) {

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [skills, setSkills] = useState([]);
  const [questions, setQuestions] = useState({}); // ✅ FIXED
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleUpload = async () => {

    if (!file) {
      setError("Please select a resume file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://127.0.0.1:8000/upload-resume",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data || {};

      setResumeText(data.text || "");
      setSkills(data.skills || []);
      setQuestions(Object.values(data.questions || {}));

      refreshStats?.();

    } catch (err) {
      console.log(err);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl w-full">

      <h2 className="text-xl font-bold mb-4 text-white">
        📄 Upload Resume
      </h2>

      <div className="border border-dashed border-white/20 rounded-xl p-4 bg-white/5">
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full text-gray-300"
        />

        {file && (
          <p className="mt-2 text-green-400 text-sm">
            ✔ {file.name}
          </p>
        )}
      </div>

      {error && (
        <p className="mt-3 text-red-400 text-sm">{error}</p>
      )}

      <button
        onClick={handleUpload}
        disabled={loading}
        className={`mt-4 w-full py-3 rounded-xl font-semibold ${
          loading
            ? "bg-gray-500"
            : "bg-gradient-to-r from-pink-500 to-purple-600"
        }`}
      >
        {loading ? "Uploading..." : "Upload Resume"}
      </button>

      {/* TEXT */}
      {resumeText && (
        <div className="mt-6">
          <h3 className="text-gray-300 mb-2">Extracted Text</h3>
          <div className="bg-white/5 p-3 rounded text-sm max-h-40 overflow-y-auto">
            {resumeText}
          </div>
        </div>
      )}

      {/* SKILLS */}
      {skills.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <span key={i} className="px-3 py-1 bg-purple-500/20 rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* START INTERVIEW BUTTON */}
{questions.length > 0 && (
  <button
    onClick={() => {
      console.log("Sending questions:", questions);
      navigate("/interview-session", { state: { questions } });
    }}
    className="mt-6 w-full py-3 rounded-xl 
    bg-gradient-to-r from-purple-500 to-pink-600 
    text-white font-semibold"
  >
    Start AI Interview 🚀
  </button>
)}

    </div>
  );
}

export default ResumeUpload;