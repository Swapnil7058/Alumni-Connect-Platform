import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token"); // Token from the email link

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleReset = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setStatus("loading");
    
    // Logic to call your Auth Microservice (Flask/Node.js)
    setTimeout(() => setStatus("success"), 1500); 
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="bg-slate-900 p-8 text-white text-center">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-900/20">
            <Lock size={30} />
          </div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">New Password</h2>
          <p className="text-slate-400 text-sm mt-1">Create a secure password for your portal</p>
        </div>

        <div className="p-8">
          {status === "success" ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Password Updated!</h3>
              <p className="text-slate-500 mb-8 text-sm">Your credentials have been successfully reset.</p>
              <button 
                onClick={() => navigate("/login")}
                className="w-full py-4 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                Go to Login <ArrowRight size={18} />
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Confirm Password</label>
                <input 
                  type="password"
                  required
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button 
                disabled={status === "loading"}
                className="w-full py-4 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {status === "loading" ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;