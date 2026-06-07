import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext"; // Ensure path is correct
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Github, Mail } from "lucide-react";
import { API_BASE_URL } from "../../../services/api";

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { login, clearAuthState } = useAuth();

  const role = searchParams.get("role") || "student";
  const mode = searchParams.get("mode") || "login";
  const isLogin = mode === "login";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    prnOrId: "",
    graduationYear: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("USER DATA: ", formData);

    const endpoint = isLogin ? "/auth/login" : "/auth/register";

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 🔒 REQUIRED for HttpOnly cookies
        body: JSON.stringify({
          ...formData,
          role: role,
        }),
      });

      // ✅ Read JSON ONLY ONCE (CRITICAL FIX)
      const data = await response.json();

      // Handle errors first, including role mismatch and alumni approval status.
      if (!response.ok) {
        clearAuthState();
        alert(data.msg || "Authentication failed");
        return;
      }

      if (isLogin) {
        login(data.user);
        alert("Welcome back!");
      } else {
        if (role === "alumni") {
          alert("Registration successful! Await admin approval before login.");
        } else {
          alert("Registration successful! Please sign in.");
        }

        navigate(`/login?role=${role}&mode=login`);
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert("Could not connect to the backend server.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200 overflow-hidden border border-slate-100"
      >
        <div className="bg-red-600 p-8 text-white text-center">
          <h2 className="text-2xl font-bold uppercase tracking-tight">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-red-100 text-sm mt-1 font-medium capitalize">
            Accessing as {role} portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Full Name
              </label>
              <input
                name="fullName"
                type="text"
                required
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
              placeholder="name@adypsoe.edu"
            />
          </div>

          {!isLogin && role === "alumni" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Graduation Year
              </label>
              <input
                name="graduationYear"
                type="number"
                required
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                placeholder="YYYY"
              />
            </div>
          )}

          {role !== "alumni" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                {role === "admin" ? "Employee ID" : "PRN Number"}
              </label>
              <input
                name="prnOrId"
                type="text"
                required
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                placeholder={role === "admin" ? "EMP123" : "722XXXXXX"}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2 text-right">
            {isLogin && (
              <Link
                to="/forgot-password"
                size="11"
                className="text-[11px] font-bold text-red-600 hover:underline"
              >
                Forgot Password?
              </Link>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-100"
          >
            {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            {isLogin ? "Sign In" : "Register Now"}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-bold">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-bold text-sm text-slate-600"
            >
              <Mail size={18} /> Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-bold text-sm text-slate-600"
            >
              <Github size={18} /> LinkedIn
            </button>
          </div>
        </form>

        <div className="p-6 bg-slate-50 text-center border-t border-slate-100">
          <p className="text-sm text-slate-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => navigate(`/auth?role=${role}&mode=${isLogin ? "signup" : "login"}`)}
              className="ml-1 text-red-600 font-bold hover:underline"
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
