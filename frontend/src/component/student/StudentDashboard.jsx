import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, Briefcase, MessageSquare, Star, ArrowUpRight, FileText, PenSquare } from "lucide-react";
import RoleSidebar from "../shared/RoleSidebar";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const topMentors = [
    { name: "Sourbha Nayak", company: "Google", match: "94%", skills: ["AI", "React"] },
    { name: "Pavan Tamhane", company: "Meta", match: "89%", skills: ["Node.js", "MySQL"] },
    { name: "Yash Rakhunde", company: "Tesla", match: "87%", skills: ["Python", "Flask"] },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <RoleSidebar role="student" />
      <div className="ml-64 pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-extrabold text-slate-900">Student Dashboard</h1>
          <p className="text-slate-500 mt-2 italic">Empowering your career readiness with AI-driven insights.</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200 border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Star className="text-red-600 fill-red-600" size={20} />
                  Top Matched Mentors
                </h2>
                <button
                  onClick={() => navigate("/student/mentorship")}
                  className="text-sm font-bold text-red-600 hover:underline"
                >
                  View All Matches
                </button>
              </div>

              <div className="space-y-4">
                {topMentors.map((mentor, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-transparent hover:border-red-100 hover:bg-red-50/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-bold text-red-600 shadow-sm">
                        {mentor.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{mentor.name}</h3>
                        <p className="text-xs text-slate-500">{mentor.company} - {mentor.skills.join(", ")}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <span className="text-sm font-black text-red-600 bg-red-50 px-3 py-1 rounded-lg">
                        {mentor.match} Match
                      </span>
                      <button
                        onClick={() => navigate("/student/mentorship")}
                        className="p-2 bg-white rounded-lg text-slate-400 group-hover:text-red-600 group-hover:shadow-md transition-all"
                      >
                        <ArrowUpRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ActionCard
                icon={<Briefcase />}
                title="Job Portal"
                desc="Browse alumni-posted and scraped jobs."
                onClick={() => navigate("/student/jobs")}
              />
              <ActionCard
                icon={<MessageSquare />}
                title="Live Conversations"
                desc="Continue mentorship chats with alumni in real time."
                onClick={() => navigate("/student/conversations")}
              />
              <ActionCard
                icon={<FileText />}
                title="Resume Builder"
                desc="Generate a structured resume draft and improve career readiness."
                onClick={() => navigate("/student/resume-builder")}
              />
              <ActionCard
                icon={<PenSquare />}
                title="Article Writer"
                desc="Draft alumni-style articles and interview guidance content."
                onClick={() => navigate("/student/article-writer")}
              />
            </div>
          </div>

          <aside className="space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
              <h3 className="text-lg font-bold mb-6">Career Readiness</h3>
              <div className="space-y-6">
                <ProgressItem label="Profile Strength" val="85%" />
                <ProgressItem label="Mentorship Sessions" val="2/5" />
                <ProgressItem label="Resume Score" val="72/100" />
              </div>
              <button
                onClick={() => navigate("/student/resume-builder")}
                className="w-full mt-8 py-4 bg-red-600 rounded-2xl font-bold text-sm hover:bg-red-700 transition-all"
              >
                Access Resume Builder
              </button>
              <button
                onClick={() => navigate("/student/mentorship")}
                className="w-full mt-3 py-4 bg-white text-slate-900 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all"
              >
                Explore Mentor Matches
              </button>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100">
              <h3 className="text-slate-900 font-bold mb-4">Network Activity</h3>
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <Users size={16} /> 1000+ Active Alumni
              </div>
            </div>
          </aside>
        </div>
      </div>
      </div>
    </div>
  );
};

const ActionCard = ({ icon, title, desc, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:shadow-xl transition-all group cursor-pointer"
  >
    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="font-extrabold text-slate-900 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const ProgressItem = ({ label, val }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
      <span>{label}</span>
      <span className="text-red-500">{val}</span>
    </div>
    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
      <div className="h-full bg-red-600" style={{ width: val.includes("/") ? "40%" : val }} />
    </div>
  </div>
);

export default StudentDashboard;
