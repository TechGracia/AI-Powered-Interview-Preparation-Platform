import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/auth";
import {
  LayoutDashboard,
  Mic,
  History,
  User,
  Trophy,
  Bot
} from "lucide-react";
import { useState } from "react";

function DashboardLayout() {

  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const menuItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/interview", icon: Mic, label: "Interview" },
    { to: "/history", icon: History, label: "History" },
    { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { to: "/profile", icon: User, label: "Profile" }
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] text-white">

      {/* ---------------- SIDEBAR ---------------- */}
      <div className={`${collapsed ? "w-20" : "w-64"} bg-[#0f172a] border-r border-white/10 flex flex-col transition-all duration-300`}>

        {/* LOGO */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">

          {!collapsed && (
            <div
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="p-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg group-hover:shadow-purple-500/40 transition">
                <Bot className="text-white" size={18} />
              </div>

              <span className="text-lg font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent tracking-wide">
                AI Interview
              </span>
            </div>
          )}

          {/* TOGGLE */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white text-lg hover:scale-110 transition"
          >
            {collapsed ? "➡" : "⬅"}
          </button>

        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-3 space-y-2">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-purple-500/30"
                      : "hover:bg-white/10"
                  }`
                }
              >
                {/* Active Glow */}
                <div className="absolute left-0 top-0 h-full w-1 rounded-r bg-gradient-to-b from-pink-500 to-purple-500 opacity-0 group-[.active]:opacity-100"></div>

                {/* Icon */}
                <Icon
                  size={20}
                  className="text-purple-400 group-hover:scale-110 transition"
                />

                {/* Label */}
                {!collapsed && (
                  <span className="text-sm tracking-wide">
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}

        </nav>

      </div>

      {/* ---------------- MAIN ---------------- */}
      <div className="flex-1 flex flex-col">

        {/* TOP BAR */}
        <div className="backdrop-blur-lg bg-white/5 border-b border-white/10 p-4 flex justify-between items-center">

          <h1 className="text-lg font-semibold text-gray-200">
            AI Interview Dashboard
          </h1>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 hover:scale-105 transition shadow-md"
          >
            Logout
          </button>

        </div>

        {/* CONTENT */}
        <div className="p-8 text-gray-200">
          <Outlet />
        </div>

      </div>

    </div>
  );
}

export default DashboardLayout;