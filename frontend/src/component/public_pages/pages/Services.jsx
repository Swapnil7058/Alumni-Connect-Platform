import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Brain, FileText, MessageSquare, Briefcase, Search, BarChart, ArrowRight, Bot, PenSquare } from "lucide-react";

const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: "AI Mentorship Matching",
      description: "Profile-aware mentor ranking based on skills, goals, and alumni expertise.",
      icon: <Brain className="text-red-600" />,
      tag: "NLP Matching",
      path: "/student/mentorship",
    },
    {
      title: "Real Job Portal",
      description: "Alumni can post jobs and students can apply with AI-style relevance scoring.",
      icon: <Briefcase className="text-red-600" />,
      tag: "Career Readiness",
      path: "/student/jobs",
    },
    {
      title: "AI Resume Builder",
      description: "Generate structured resume drafts and improvement suggestions from your profile and projects.",
      icon: <FileText className="text-red-600" />,
      tag: "PDF-ready Drafting",
      path: "/student/resume-builder",
    },
    {
      title: "Discussion Forum",
      description: "Community threads with sentiment monitoring to keep conversations healthy and useful.",
      icon: <MessageSquare className="text-red-600" />,
      tag: "Sentiment Monitoring",
      path: "/student/forums",
    },
    {
      title: "Article Writer",
      description: "Draft knowledge-sharing articles for interviews, skills, and industry preparation.",
      icon: <PenSquare className="text-red-600" />,
      tag: "Content Creation",
      path: "/student/article-writer",
    },
    {
      title: "Campus AI Assistant",
      description: "Get guidance on jobs, mentorship, resumes, and using the platform effectively.",
      icon: <Bot className="text-red-600" />,
      tag: "Guided Support",
      path: "/student/assistant",
    },
    {
      title: "Sentiment Analytics",
      description: "Admin dashboard surfaces flagged conversations and forum health for moderation control.",
      icon: <BarChart className="text-red-600" />,
      tag: "Admin Insights",
      path: "/admin/dashboard",
    },
    {
      title: "External Opportunity Ready",
      description: "Architecture supports automated job ingestion and matching enhancements from external feeds.",
      icon: <Search className="text-red-600" />,
      tag: "Scalable Integration",
      path: "/student/jobs",
    },
  ];

  return (
    <div className="pt-32 pb-20 px-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Platform Services</h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            The core modules from the project paper are now represented as working services inside the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-red-100/50 transition-all group flex flex-col h-full"
            >
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                {service.icon}
              </div>
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{service.tag}</span>
              <h3 className="text-xl font-bold text-slate-900 mt-2 mb-4">{service.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-8 grow">{service.description}</p>

              <button
                onClick={() => navigate(service.path)}
                className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-red-600 group-hover:text-white transition-all active:scale-95"
              >
                Launch Service <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
