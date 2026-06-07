import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic to call your Flask/Node.js Authentication Service
    console.log("Reset link sent to:", email);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden"
      >
        {/* Decorative Header */}
        <div className="bg-red-600 p-8 text-white text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <KeyRound size={32} />
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">Reset Password</h2>
            <p className="text-red-100 text-sm mt-1">We'll help you get back into your portal</p>
          </div>
          {/* Abstract background circles */}
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </div>

        <div className="p-8">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    placeholder="name@adypsoe.edu"
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight mt-2">
                  Please enter the email associated with your Student, Alumni, or Admin account.
                </p>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Send Reset Link
              </button>
            </form>
          ) : (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Check your Email</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                We have sent a password reset link to <br/>
                <span className="font-bold text-slate-700">{email}</span>
              </p>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="text-red-600 font-bold text-sm hover:underline"
              >
                Didn't receive the email? Try again
              </button>
            </motion.div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100">
            <button 
              onClick={() => navigate("/login")}
              className="flex items-center justify-center gap-2 w-full text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;