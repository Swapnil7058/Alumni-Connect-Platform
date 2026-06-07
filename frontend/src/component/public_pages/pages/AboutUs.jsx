import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Code, Database, Cpu, Target, Layers } from "lucide-react";

const About = () => {
  const team = [
    { name: "Yash Rakhunde", role: "Developer & Researcher", prn: "72258298G" },
    { name: "Pavan Tamhane", role: "Backend & Data Strategy", prn: "72258256M" },
    { name: "Sourbha Nayak", role: "AI & ML Implementation", prn: "72258202B" },
  ];

  return (
    <div className="pt-32 pb-20 px-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Section 1: The Problem & Vision */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-red-600 font-bold tracking-widest uppercase text-sm mb-4">The Research Vision</h2>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
              Bridging the Gap in <br/> Professional Transitions
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              Traditional alumni networks suffer from three fundamental limitations: restricted personalization, inadequate real-time communication, and poor institutional integration. 
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              Alumni Connect transforms the traditional directory into a dynamic ecosystem, leveraging process automation to ensure 95% data accuracy while facilitating direct mentorship.
            </p>
          </motion.div>

          <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl relative">
             <div className="absolute -top-4 -right-4 bg-red-600 text-white p-4 rounded-2xl font-bold shadow-lg">
                70% Admin Reduction
             </div>
             <div className="space-y-6">
                <StatBar label="Matching Accuracy" percentage="90%" />
                <StatBar label="Query Performance" percentage="78%" />
                <StatBar label="Engagement Growth" percentage="85%" />
             </div>
          </div>
        </div>

        {/* Section 2: Technical Architecture Highlight */}
        <div className="mb-24 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">System Architecture & Methodology</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <MethodologyCard 
              icon={<Layers size={32} />} 
              title="Microservices Architecture" 
              desc="Decomposed into discrete services (Auth, Forum, Matching) using React.js and  Flask for independent scalability." 
            />
            <MethodologyCard 
              icon={<Cpu size={32} />} 
              title="AI & NLP Pipelines" 
              desc="Utilizing BERT embeddings and Collaborative Filtering to match alumni expertise with student career goals." 
            />
            <MethodologyCard 
              icon={<Target size={32} />} 
              title="Hybrid Data Layer" 
              desc="ACID compliant MySQL for structured data and MongoDB for flexible, unstructured chat and forum logs." 
            />
          </div>
        </div>

        {/* Section 3: The Team */}
        <div className="bg-slate-50 rounded-[3rem] p-16 border border-slate-100">
          <div className="text-center mb-16">
            <h3 className="text-slate-500 font-semibold uppercase tracking-widest text-sm mb-2">Academic Project 2025-26</h3>
            <h2 className="text-4xl font-bold text-slate-900">Project Team & Mentorship</h2>
          </div>
          
          <div className="flex flex-col items-center mb-16">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <GraduationCap className="text-red-600" size={40} />
            </div>
            <p className="text-sm text-slate-500 font-bold uppercase">Project Guide</p>
            <h3 className="text-2xl font-extrabold text-slate-900">Prof. Renuka Gavli</h3>
            <p className="text-slate-600">Computer Engineering Department, ADYPSOE </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 text-center">
                <h4 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h4>
                <p className="text-red-600 font-bold text-sm mb-4">{member.role}</p>
                <div className="text-xs text-slate-400 font-mono bg-slate-50 py-2 rounded-lg">PRN: {member.prn}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper Components
const StatBar = ({ label, percentage }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-slate-300 font-medium">{label}</span>
      <span className="text-red-500 font-bold">{percentage}</span>
    </div>
    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }} 
        whileInView={{ width: percentage }} 
        transition={{ duration: 1, delay: 0.5 }}
        className="bg-red-600 h-full"
      />
    </div>
  </div>
);

const MethodologyCard = ({ icon, title, desc }) => (
  <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-red-100 transition-all text-center group">
    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default About;