import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, User, ShieldCheck, ThumbsUp } from "lucide-react";

import { createForumPost, getForumPosts } from "../../../services/forumService";

const Forum = () => {
  const [message, setMessage] = useState("");
  const [threads, setThreads] = useState([]);
  const [health, setHealth] = useState({ label: "Healthy", score: 0.92 });
  const [loading, setLoading] = useState(true);

  const loadForum = async () => {
    const response = await getForumPosts();
    setThreads(response.posts || []);
    setHealth(response.community_health || { label: "Healthy", score: 0.92 });
    setLoading(false);
  };

  useEffect(() => {
    loadForum();
  }, []);

  const handlePost = async () => {
    if (!message.trim()) return;
    await createForumPost(message.trim());
    setMessage("");
    loadForum();
  };

  return (
    <div className="pt-32 pb-20 px-6 bg-slate-50 min-h-screen flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 flex-shrink-0">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Community <span className="text-red-600">Forum</span></h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Discussion threads with sentiment monitoring for community health.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm flex-shrink-0">
            <div className={`w-2 h-2 rounded-full animate-pulse ${health.score >= 0.65 ? "bg-green-500" : health.score >= 0.45 ? "bg-amber-500" : "bg-red-500"}`} />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
              Sentiment: {health.label} ({health.score})
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 mb-10 flex-shrink-0">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-slate-400">
              <User size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask about referrals, projects, interviews, or career guidance..."
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-500 transition-all outline-none min-h-[100px] resize-none"
              />
              <div className="flex justify-between items-center mt-4">
                <p className="text-[10px] text-slate-400 font-medium truncate">Sentiment analysis is active for moderation support</p>
                <button onClick={handlePost} className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-red-700 transition-all active:scale-95 flex-shrink-0">
                  Post <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 flex-grow overflow-y-auto no-scrollbar pb-10">
          {loading ? <div className="text-slate-500">Loading forum...</div> : null}
          <AnimatePresence>
            {threads.map((thread) => (
              <motion.div
                key={thread._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex justify-between mb-4 gap-2">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold">
                      {thread.user_name?.charAt(0) || "U"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 truncate">{thread.user_name}</h3>
                        {thread.role === "alumni" && (
                          <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 flex-shrink-0">
                            <ShieldCheck size={10} /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase truncate">
                        {thread.role} • {new Date(thread.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-6 break-words">{thread.text}</p>

                <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold flex-shrink-0">
                    <ThumbsUp size={16} /> {thread.likes || 0}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold flex-shrink-0">
                    <MessageCircle size={16} /> {(thread.replies || []).length} Replies
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
                    <div className={`w-1.5 h-1.5 rounded-full ${thread.sentiment?.flagged ? "bg-red-500" : thread.sentiment?.label === "Positive" ? "bg-green-500" : "bg-amber-500"}`} />
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      {thread.sentiment?.label} {thread.sentiment?.flagged ? "Flagged" : ""}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Forum;
