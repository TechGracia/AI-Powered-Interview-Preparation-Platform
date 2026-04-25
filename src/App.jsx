import { BrowserRouter, Routes, Route } from "react-router-dom";

// 🔓 PUBLIC PAGES
import Login from "./pages/login";
import Register from "./pages/register";
import VerifyOtp from "./pages/VerifyOtp";

// 🔐 PROTECTED PAGES
import Dashboard from "./pages/dashboard";
import InterviewPage from "./pages/InterviewPage";
import InterviewHistory from "./pages/InterviewHistory";
import Profile from "./pages/Profile";
import MockInterview from "./pages/MockInterview";
import Leaderboard from "./pages/LeaderBoard";

// 🎯 AI INTERVIEW COMPONENT
import InterviewSession from "./components/InterviewSession";

// 🛡️ AUTH + LAYOUT
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔓 PUBLIC ROUTES */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* 🔐 PROTECTED ROUTES */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="interview" element={<InterviewPage />} />
          <Route path="interview-session" element={<InterviewSession />} /> {/* ✅ AI */}
          <Route path="mock-interview" element={<MockInterview />} /> {/* ✅ MOCK */}
          <Route path="history" element={<InterviewHistory />} />
          <Route path="profile" element={<Profile />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;