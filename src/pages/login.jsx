import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Mail, Lock, User } from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">

      {/* 🔥 ANIMATED BACKGROUND */}
      <div className="absolute inset-0 -z-10 animate-gradient bg-[length:300%_300%]
        bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81]" />

      {/* 🔥 GLOW BLOBS */}
      <div className="absolute w-[600px] h-[600px] bg-purple-600/30 blur-[150px] rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[500px] h-[500px] bg-pink-500/20 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />

      {/* ✨ PARTICLES */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <span
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* LEFT SIDE */}
      <div className="hidden md:flex flex-col justify-center w-1/2 px-20 z-10 space-y-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          AI Interview
        </h1>

        <p className="text-gray-300 text-lg max-w-md">
          Crack interviews faster with AI-powered mock sessions,
          real-time feedback, and performance tracking.
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            "🚀 Smart AI Questions",
            "📊 Live Score Analysis",
            "🎯 Personalized Feedback",
            "🏆 Global Leaderboard",
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-xl p-3 
              hover:bg-white/10 transition hover:scale-105"
            >
              {item}
            </div>
          ))}
        </div>

        <p className="text-gray-400 text-sm">
          ⭐ Trusted by 1,000+ students
        </p>
      </div>

      {/* 💎 GLASS LOGIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="
          relative z-10 w-full max-w-sm p-8 rounded-3xl
          bg-white/10 backdrop-blur-2xl border border-white/20
          shadow-[0_20px_80px_rgba(0,0,0,0.5)]
        "
      >

        {/* 👤 AVATAR */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full 
          bg-gradient-to-r from-pink-500 to-purple-500 
          flex items-center justify-center shadow-lg">
          <User size={32} />
        </div>

        {/* EMAIL */}
        <div className="relative mb-4">
          <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email ID"
            className="w-full pl-10 pr-3 py-3 
            bg-black/30 border border-white/10 
            rounded-xl text-gray-200 
            focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* PASSWORD */}
        <div className="relative mb-4">
          <Lock className="absolute left-3 top-3 text-gray-400" size={18} />

          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full pl-10 pr-10 py-3 
            bg-black/30 border border-white/10 
            rounded-xl text-gray-200 
            focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 cursor-pointer text-gray-400 text-sm"
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        {/* REMEMBER + FORGOT */}
        <div className="flex justify-between text-sm text-gray-400 mb-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Remember me
          </label>

          <span className="cursor-pointer hover:text-purple-400">
            Forgot Password?
          </span>
        </div>

        {/* LOGIN BUTTON */}
        <button
          onClick={handleLogin}
          className="w-full py-3 rounded-xl 
          bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 
          font-semibold shadow-lg 
          hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]
          hover:scale-105 transition"
        >
          LOGIN
        </button>

        {/* FOOTER */}
        <p className="text-center text-gray-400 mt-5 text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-purple-400 hover:underline">
            Register
          </Link>
        </p>
      </motion.div>

    </div>
  );
}

export default Login;