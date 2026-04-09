import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import logo from "../assets/prpayurved.png";
import bizologo from "../assets/bizlogo.png";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // --- UPDATED SETUP ---
  // We use an empty string as fallback so that requests go to "/api/login"
  // This allows the Vite Proxy to catch the request and forward it to the VPS.
  const API_URL = import.meta.env.VITE_API_URL || "";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // This will call http://localhost:5173/api/login
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: userId, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("admin", JSON.stringify(data.admin));
        navigate("/main");
      }

    } catch (err) {
      console.error("Login error:", err);
      if (err.message === "Failed to fetch") {
        setError(
          `Connection Refused. Ensure Vite is restarted and Proxy is active.`,
        );
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50 px-4">
      <div className="bg-white overflow-hidden relative w-full max-w-sm rounded-xl shadow-xl p-6 flex flex-col items-center">
        <img
          src={logo || "/placeholder.svg"}
          alt="Lakshya Logo"
          className="w-[120px] md:w-[150px] mb-4"
        />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          ADMIN LOGIN
        </h2>

        <form onSubmit={handleLogin} className="w-full mt-4">
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="mb-4">
            <label
              htmlFor="userId"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter Username"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-400/30 hover:bg-blue-400/40 text-blue-900 font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="absolute bottom-0 left-0 w-full flex h-[6px]">
          <div className="w-1/3 bg-gradient-to-r from-yellow-300 to-orange-400"></div>
          <div className="w-1/3 bg-blue-800"></div>
          <div className="w-1/3 bg-red-600"></div>
        </div>
      </div>

      <div className="flex flex-col items-center text-center">
        <p className="text-[10px] text-gray-600 mt-6">
          Designed and Managed by
        </p>
        <img
          src={bizologo || "/placeholder.svg"}
          alt="Biz Logo"
          className="h-6 mt-1"
        />
      </div>
    </div>
  );
};

export default Login;