import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Hook for programmatic navigation
import { ArrowRight, Briefcase, Zap, ShieldCheck } from "lucide-react";

export default function Home() {
  const navigate = useNavigate(); // Initialize the navigate function

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-red-50 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[50%] bg-blue-50 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-sm font-bold tracking-wide uppercase">
              AI-Driven Networking Platform 
            </span>
            <h1 className="mt-8 text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight">
              Empowering the Next Generation of <br />
              <span className="text-red-600">Alumni Excellence.</span>
            </h1>
            <p className="mt-6 text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Alumni Connect bridges the gap between academia and industry using
              intelligent mentorship matching and automated career
              insights.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Navigate to Registration/Login */}
              <button
                onClick={() => navigate("/register")}
                className="w-full sm:w-auto px-8 py-4 bg-red-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-red-200 hover:bg-red-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Join the Network <ArrowRight size={20} />
              </button>

              {/* Navigate to Job Services */}
              <button
                onClick={() => navigate("/services")}
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all"
              >
                View Job Board 
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">
            Why Alumni Connect? 
          </h2>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="text-red-600" />}
            title="AI Matching"
            desc="85-90% accurate mentorship matching based on career goals and skills."
          />
          <FeatureCard
            icon={<Briefcase className="text-red-600" />}
            title="Automated Jobs"
            desc="Real-time job scraping from LinkedIn and Indeed tailored to your profile."
          />
          <FeatureCard
            icon={<ShieldCheck className="text-red-600" />}
            title="Secure Access"
            desc="Enterprise-grade security with OAuth2 and Role-Based Access Control."
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <StatItem label="Query Response Improvement" value="78%" />
          <StatItem label="Matching Accuracy" value="90%" />
          <StatItem label="Manual Task Reduction" value="70%" />
          <StatItem label="System Uptime" value="99.5%" />
        </div>
      </section>
    </div>
  );
}

// ... FeatureCard and StatItem components remain the same ...
const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-red-100 hover:shadow-2xl hover:shadow-red-100 transition-all group">
    <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

const StatItem = ({ label, value }) => (
  <div>
    <div className="text-4xl font-bold text-red-500 mb-2">{value}</div>
    <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">{label}</div>
  </div>
);
