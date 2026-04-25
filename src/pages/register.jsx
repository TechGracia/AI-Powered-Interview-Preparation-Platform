import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Mail, Lock, User } from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  // ✅ Email validation
  const validateEmail = (value) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    setEmailError(isValid ? "" : "Invalid email format");
    return isValid;
  };

  // ✅ Password strength logic
  const checkStrength = (pass) => {
    let score = 0;
    if (pass.length > 6) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const handleRegister = async () => {
    if (!validateEmail(email)) return;

    if (passwordStrength < 2) {
      alert("Password too weak");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/register", {
        email,
        password,
      });

      // 🚀 Redirect to OTP page
      navigate("/verify-otp", { state: { email } });

    } catch {
      alert("Registration failed");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">

      {/* 🔥 Animated Background */}
      <div className="absolute inset-0 -z-10 animate-gradient bg-[length:300%_300%]
        bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#312e81]" />

      {/* Glow */}
      <div className="absolute w-[600px] h-[600px] bg-blue-500/20 blur-[150px] rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />

      {/* LEFT */}
      <div className="hidden md:flex flex-col justify-center w-1/2 px-20 z-10 space-y-8">

        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Join AI Interview
        </h1>

        <p className="text-gray-300 text-lg max-w-md">
          Start your journey with AI-powered interviews, real-time scoring,
          and personalized feedback.
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            "🚀 Smart Questions",
            "📊 Live Analytics",
            "🎯 Personalized Growth",
            "🏆 Global Leaderboard",
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-xl p-3 
              hover:bg-white/10 transition hover:scale-105 hover:border-blue-400/40"
            >
              {item}
            </div>
          ))}
        </div>

        <p className="text-gray-400 text-sm">
          ⭐ Trusted by 1,000+ learners
        </p>
      </div>

      {/* 💎 CARD */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="relative z-10 w-full max-w-sm p-8 rounded-3xl
        bg-white/10 backdrop-blur-2xl border border-white/20"
      >

        <div className="absolute inset-0 rounded-3xl 
          bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-2xl -z-10" />

        {/* ICON */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full 
          bg-gradient-to-r from-blue-500 to-purple-600 
          flex items-center justify-center shadow-lg">
          <User size={32} />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6">
          Create Account ✨
        </h2>

        {/* EMAIL */}
        <div className="relative mb-1">
          <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validateEmail(e.target.value);
            }}
            className="w-full pl-10 pr-3 py-3 
            bg-black/40 border border-white/10 rounded-xl 
            focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {emailError && (
          <p className="text-red-400 text-xs mb-3">{emailError}</p>
        )}

        {/* PASSWORD */}
        <div className="relative mb-2">
          <Lock className="absolute left-3 top-3 text-gray-400" size={18} />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordStrength(checkStrength(e.target.value));
            }}
            className="w-full pl-10 pr-10 py-3 
            bg-black/40 border border-white/10 rounded-xl 
            focus:ring-2 focus:ring-blue-500"
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 cursor-pointer text-gray-400"
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        {/* 🔥 Strength Meter */}
        <div className="mb-4">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                passwordStrength <= 1
                  ? "bg-red-500 w-1/4"
                  : passwordStrength === 2
                  ? "bg-yellow-400 w-2/4"
                  : passwordStrength === 3
                  ? "bg-blue-400 w-3/4"
                  : "bg-green-500 w-full"
              }`}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {["Weak", "Okay", "Good", "Strong"][passwordStrength - 1] || ""}
          </p>
        </div>

        {/* BUTTON */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRegister}
          className="w-full py-3 rounded-xl 
          bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 
          shadow-lg hover:shadow-[0_0_30px_rgba(99,102,241,0.7)]"
        >
          Register 🚀
        </motion.button>

        {/* FOOTER */}
        <p className="text-center text-gray-400 mt-5 text-sm">
          Already have an account?{" "}
          <Link to="/" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>

      </motion.div>
    </div>
  );
}

export default Register;