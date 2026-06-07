import { useState } from "react";
import { Bot, Send } from "lucide-react";

import { askAssistant } from "../../../services/aiToolsService";

export default function Assistant() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Ask me about mentorship, resume building, jobs, article writing, or how to use the platform.",
    },
  ]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = { role: "user", text: message.trim() };
    setMessages((current) => [...current, userMessage]);
    setMessage("");

    const response = await askAssistant(userMessage.text);
    setMessages((current) => [...current, { role: "assistant", text: response.reply }]);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <Bot size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Campus AI Assistant</h1>
            <p className="text-sm text-slate-500">A lightweight guide for jobs, mentorship, and resume support.</p>
          </div>
        </div>

        <div className="p-8 min-h-[420px] bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_35%,#f8fafc_100%)]">
          <div className="space-y-4">
            {messages.map((item, index) => (
              <div key={index} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-2xl rounded-3xl px-4 py-3 text-sm shadow-sm ${item.role === "user" ? "bg-slate-900 text-white" : "bg-white text-slate-700 border border-slate-100"}`}>
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 flex gap-3">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSend();
            }}
            className="flex-1 rounded-full border border-slate-200 px-5 py-3 outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Ask a question..."
          />
          <button onClick={handleSend} className="rounded-full bg-red-600 text-white p-3 hover:bg-red-700">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
