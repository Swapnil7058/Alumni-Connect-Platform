import React from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { GraduationCap, Briefcase, ShieldCheck, ArrowRight } from "lucide-react";

const RoleSelector = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook to check if we came from /login or /signup

  // Determine if the user's intent is to Login or Register
  const isLoginMode = location.pathname.includes("login");

  const roles = [
    {
      id: "student",
      title: "Student",
      description: "Access mentorship, career opportunities, and community forums.",
      icon: <GraduationCap size={32} className="text-blue-600" />,
      color: "hover:border-blue-500",
      bg: "bg-blue-50",
    },
    {
      id: "alumni",
      title: "Alumni",
      description: "Give back through mentorship, post jobs, and network with peers.",
      icon: <Briefcase size={32} className="text-red-600" />,
      color: "hover:border-red-500",
      bg: "bg-red-50",
    },
    {
      id: "admin",
      title: "Administrator",
      description: "Manage users, moderate content, and view platform analytics.",
      icon: <ShieldCheck size={32} className="text-slate-600" />,
      color: "hover:border-slate-500",
      bg: "bg-slate-50",
    },
  ];

  const handleRoleSelection = (roleId) => {
    /** * IMPROVED ROUTING: 
     * Passes both 'role' and 'mode' (login/signup) to a unified Auth page.
     * This follows the Role-Based Access Control (RBAC) strategy.
     */
    navigate(`/auth?role=${roleId}&mode=${isLoginMode ? "login" : "signup"}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
            Welcome to <span className="text-red-600">Alumni Connect</span>
          </h1>
          <p className="text-slate-600 text-lg mb-12 uppercase tracking-wide font-semibold">
            Select Role to {isLoginMode ? "Login" : "Sign Up"}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleRoleSelection(role.id)}
              className={`group cursor-pointer p-8 bg-white rounded-3xl border-2 border-transparent shadow-sm transition-all duration-300 ${role.color} hover:shadow-xl`}
            >
              <div className={`w-16 h-16 ${role.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform mx-auto`}>
                {role.icon}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">{role.title}</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {role.description}
              </p>
              <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Continue as {role.title} <ArrowRight size={16} />
              </div>
            </motion.div>
          ))}
        </div>

        <footer className="mt-12 text-slate-400 text-sm">
          Ajeenkya D Y Patil School of Engineering • Computer Engineering Dept.
        </footer>
      </div>
    </div>
  );
};

export default RoleSelector;