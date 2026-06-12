import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserCheck, MessageSquare, Briefcase, Sparkles } from "lucide-react";

import { getMentorRecommendations, requestMentor } from "../../services/mentorshipService";
import RoleSidebar from "../shared/RoleSidebar";

const MentorshipMatching = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [areaOfInterest, setAreaOfInterest] = useState("");
  const [requestingId, setRequestingId] = useState("");
  const [error, setError] = useState("");
  const [aiProvider, setAiProvider] = useState("local-fallback");

  const fetchMentors = async (interest = areaOfInterest) => {
    try {
      setLoading(true);
      const response = await getMentorRecommendations(interest);
      setMentors(response.recommendations || []);
      setAiProvider(response.aiProvider || "local-fallback");
      setError("");
    } catch (err) {
      setError(err.message);
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors("");
  }, []);

  const handleRequestMentor = async (mentorId) => {
    try {
      setRequestingId(mentorId);
      const response = await requestMentor(mentorId);
      navigate("/student/conversations", {
        state: { conversationId: response.conversation?._id },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setRequestingId("");
    }
  };

  const filteredMentors = mentors.filter((mentor) =>
    `${mentor.name} ${mentor.company} ${mentor.match_reason || ""}`
      .toLowerCase()
      .includes(filter.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      <RoleSidebar role="student" />
      <div className="md:ml-64 ml-0 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              AI <span className="text-red-600">Mentorship</span> Matching
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Connect with verified alumni mentors ranked from your profile, skills, career goals, and area of interest.
            </p>
          </div>
          <div className="px-4 py-2 rounded-full bg-red-50 text-red-700 text-xs font-black uppercase tracking-widest">
            AI Provider: {aiProvider}
          </div>
        </div>

        {error ? (
          <div className="mb-8 rounded-[1.5rem] border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid lg:grid-cols-[1fr,1fr] gap-4 max-w-4xl mx-auto mb-16">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search mentors by name, company, or match insight..."
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="w-full pl-14 pr-6 py-5 rounded-[2rem] border-none shadow-xl shadow-slate-200/50 outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Area of interest e.g. Data Science, Web Development"
              value={areaOfInterest}
              onChange={(event) => setAreaOfInterest(event.target.value)}
              className="flex-1 px-6 py-5 rounded-[2rem] border-none shadow-xl shadow-slate-200/50 outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
            <button
              onClick={() => fetchMentors(areaOfInterest)}
              className="px-6 py-5 rounded-[2rem] bg-slate-900 text-white font-bold hover:bg-red-600 transition-colors"
            >
              Match
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full rounded-[2rem] bg-white p-10 text-center text-slate-500 shadow-sm">
              Ranking mentors for your profile...
            </div>
          ) : null}

          <AnimatePresence>
            {!loading &&
              filteredMentors.map((mentor) => (
                <motion.div
                  key={mentor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden h-full flex flex-col"
                >
                  <div className="absolute top-6 right-6 bg-red-50 text-red-600 px-4 py-1.5 rounded-full border border-red-100 flex items-center gap-1.5">
                    <Sparkles size={14} className="animate-pulse" />
                    <span className="text-xs font-black">{mentor.score}% Match</span>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl uppercase">
                      {mentor.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{mentor.name}</h3>
                      <div className="flex items-center gap-1 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        <Briefcase size={12} /> {mentor.company}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">{mentor.headline}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {(mentor.skills || []).map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-900">
                    Match insight: {mentor.match_reason}
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-50 flex gap-3">
                    <button
                      onClick={() => handleRequestMentor(mentor.id)}
                      disabled={requestingId === mentor.id}
                      className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-red-600 disabled:bg-slate-300 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      Request Mentor <UserCheck size={14} />
                    </button>
                    <button
                      onClick={() => navigate("/student/conversations")}
                      className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                    >
                      <MessageSquare size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>
      </div>
    </div>
  );
};

export default MentorshipMatching;
