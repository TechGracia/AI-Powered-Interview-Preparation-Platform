import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);

  const [timer, setTimer] = useState(120);

  // ⏱ TIMER
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // 🔢 HANDLE INPUT
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  // ⬅ BACKSPACE
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  // ✅ VERIFY
  const handleVerify = async () => {
    try {
      const code = otp.join("");

      const res = await axios.post("http://127.0.0.1:8000/verify-otp", {
        email,
        otp: code
      });

      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");

    } catch (err) {
      alert(err.response?.data?.detail || "Invalid OTP");
    }
  };

  // 🔁 RESEND
  const handleResend = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/resend-otp", { email });
      setTimer(120);
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0].focus();
    } catch {
      alert("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81]">

      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 text-center w-[400px]">

        <h2 className="text-2xl font-bold mb-4">Verify OTP</h2>

        <p className="text-gray-400 mb-6 text-sm">
          OTP sent to <span className="text-purple-300">{email}</span>
        </p>

        {/* 🔥 OTP INPUTS */}
        <div className="flex justify-between gap-2 mb-6">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              maxLength={1}
              className="w-12 h-12 text-center text-xl rounded-lg bg-white/5 border border-white/20 focus:border-purple-400 outline-none"
            />
          ))}
        </div>

        {/* VERIFY BUTTON */}
        <button
          onClick={handleVerify}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 font-semibold mb-4"
        >
          Verify OTP
        </button>

        {/* TIMER */}
        <p className="text-sm text-gray-400 mb-2">
          {timer > 0
            ? `Resend OTP in ${timer}s`
            : "Didn't receive OTP?"}
        </p>

        {/* RESEND */}
        <button
          onClick={handleResend}
          disabled={timer > 0}
          className={`text-sm ${
            timer > 0
              ? "text-gray-500 cursor-not-allowed"
              : "text-purple-400 hover:underline"
          }`}
        >
          Resend OTP
        </button>

      </div>
    </div>
  );
}

export default VerifyOtp;