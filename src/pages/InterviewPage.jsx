import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

function InterviewPage() {

  const navigate = useNavigate();
  const location = useLocation();

  const questions = location.state?.questions;

  const [role, setRole] = useState("Frontend");
  const [open, setOpen] = useState(false);

  const roles = ["Frontend", "Backend", "Full Stack"];

  // 🔥 IF QUESTIONS EXIST → AI INTERVIEW MODE
  if (questions && questions.length > 0) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <div className="text-center space-y-4">

          <h1 className="text-2xl font-bold">
            AI Interview Ready 🚀
          </h1>

          <p className="text-gray-400">
            Questions generated from your resume
          </p>

          <button
            onClick={() =>
              navigate("/interview-session", {
                state: { questions }
              })
            }
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-500"
          >
            Start AI Interview
          </button>

        </div>
      </div>
    );
  }

  // 🔥 DEFAULT → MOCK INTERVIEW UI
  return (

    <div className="relative flex items-center justify-center min-h-[80vh] text-white overflow-hidden">

      <div className="absolute w-[500px] h-[500px] bg-purple-600/30 blur-[120px] rounded-full top-10 left-1/3"></div>
      <div className="absolute w-[400px] h-[400px] bg-pink-500/20 blur-[100px] rounded-full bottom-0 right-1/4"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/20 p-10 rounded-3xl text-center max-w-lg w-full"
      >

        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600">
          🎤
        </div>

        <h1 className="text-3xl font-bold mb-2">
          Mock Interview
        </h1>

        <p className="text-gray-300 mb-6">
          Practice AI-powered interviews
        </p>

        {/* ROLE SELECT */}
        <div className="relative mb-6">
          <div
            onClick={() => setOpen(!open)}
            className="w-full bg-white/5 border border-white/10 p-3 rounded-xl cursor-pointer flex justify-between"
          >
            {role} <span>▾</span>
          </div>

          {open && (
            <div className="absolute w-full mt-2 bg-[#1e1b4b] border border-white/10 rounded-xl">
              {roles.map((item) => (
                <div
                  key={item}
                  onClick={() => {
                    setRole(item);
                    setOpen(false);
                  }}
                  className="px-4 py-3 hover:bg-purple-500/20 cursor-pointer"
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() =>
            navigate("/mock-interview", { state: { role } })
          }
          className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500"
        >
          Start Mock Interview 🚀
        </motion.button>

      </motion.div>

    </div>
  );
}

export default InterviewPage;