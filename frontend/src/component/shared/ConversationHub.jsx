import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MoreVertical, Phone, Search, Send, User, Video } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import RoleSidebar from "./RoleSidebar";
import {
  getConversationMessages,
  getConversations,
  sendConversationMessage,
} from "../../services/chatService";
import { connectSocket } from "../../services/socket";

function formatTimestamp(value) {
  if (!value) return "";

  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ConversationHub() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(location.state?.conversationId || "");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation._id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  useEffect(() => {
    let active = true;

    const loadConversations = async () => {
      try {
        setLoading(true);
        const response = await getConversations();
        if (!active) return;

        const nextConversations = response.conversations || [];
        setConversations(nextConversations);

        if (!selectedConversationId && nextConversations.length > 0) {
          setSelectedConversationId(nextConversations[0]._id);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadConversations();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    let active = true;

    const loadMessages = async () => {
      try {
        const response = await getConversationMessages(selectedConversationId);
        if (active) {
          setMessages(response.messages || []);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message);
        }
      }
    };

    loadMessages();

    return () => {
      active = false;
    };
  }, [selectedConversationId]);

  useEffect(() => {
    const socket = connectSocket();

    const handleReady = () => {
      if (selectedConversationId) {
        socket.emit("join_conversation", { conversationId: selectedConversationId });
      }
    };

    const handleMessage = (incomingMessage) => {
      if (incomingMessage.conversation_id === selectedConversationId) {
        setMessages((current) => [...current, incomingMessage]);
      }
    };

    const handleConversationUpdated = ({ conversationId, lastMessage }) => {
      setConversations((current) =>
        current.map((conversation) =>
          conversation._id === conversationId
            ? {
                ...conversation,
                last_message: lastMessage.text,
                last_message_at: lastMessage.created_at,
                updated_at: lastMessage.created_at,
              }
            : conversation
        )
      );
    };

    socket.on("socket:ready", handleReady);
    socket.on("chat:message", handleMessage);
    socket.on("chat:conversation-updated", handleConversationUpdated);

    if (socket.connected && selectedConversationId) {
      socket.emit("join_conversation", { conversationId: selectedConversationId });
    }

    return () => {
      socket.off("socket:ready", handleReady);
      socket.off("chat:message", handleMessage);
      socket.off("chat:conversation-updated", handleConversationUpdated);
    };
  }, [selectedConversationId]);

  const filteredConversations = conversations.filter((conversation) => {
    const otherParticipant =
      conversation.participants?.find((participant) => participant.email !== user?.email) ||
      conversation.participants?.[0];

    return `${otherParticipant?.name || ""} ${conversation.last_message || ""}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const handleSend = async () => {
    if (!selectedConversationId || !message.trim() || sending) {
      return;
    }

    try {
      setSending(true);
      await sendConversationMessage(selectedConversationId, message.trim());
      setMessage("");
    } catch (sendError) {
      setError(sendError.message);
    } finally {
      setSending(false);
    }
  };

  const sidebarRole = user?.role === "alumni" ? "alumni" : "student";
  const roleHome = user?.role === "alumni" ? "/alumni/dashboard" : "/student/dashboard";

  return (
    <div className="min-h-screen bg-slate-100">
      <RoleSidebar role={sidebarRole} />
      <div className="md:ml-64 ml-0 pt-24 pb-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Mentorship Conversations</h1>
            <p className="text-slate-500 mt-1">Live alumni-student discussion powered by Socket.IO.</p>
          </div>
          <button
            onClick={() => navigate(roleHome)}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-red-600 transition-colors"
          >
            Back to dashboard
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid lg:grid-cols-[340px,1fr] gap-6">
          <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center bg-slate-100 rounded-xl px-3 py-3">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search mentors or students..."
                  className="bg-transparent outline-none ml-2 w-full text-sm"
                />
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {loading ? (
                <div className="p-6 text-sm text-slate-500">Loading conversations...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-6 text-sm text-slate-500">No mentorship conversations yet.</div>
              ) : (
                filteredConversations.map((conversation) => {
                  const otherParticipant =
                    conversation.participants?.find((participant) => participant.email !== user?.email) ||
                    conversation.participants?.[0];

                  return (
                    <motion.button
                      key={conversation._id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => {
                        setSelectedConversationId(conversation._id);
                        navigate(location.pathname, { replace: true, state: { conversationId: conversation._id } });
                      }}
                      className={`w-full text-left p-4 border-b border-slate-100 transition-colors ${
                        selectedConversationId === conversation._id ? "bg-red-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="bg-slate-900 text-white p-2 rounded-full">
                            <User size={18} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-800 truncate">{otherParticipant?.name || "Conversation"}</h3>
                            <p className="text-xs text-slate-500 truncate">{conversation.last_message || "Start the conversation"}</p>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          {formatTimestamp(conversation.last_message_at || conversation.updated_at)}
                        </span>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden flex flex-col min-h-[70vh]">
            {selectedConversation ? (
              <>
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-50 text-red-600 p-3 rounded-full">
                      <User size={20} />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900">
                        {selectedConversation.participants?.find((participant) => participant.email !== user?.email)?.name || "Mentorship chat"}
                      </h2>
                      <p className="text-xs text-slate-500">
                        Moderation: {selectedConversation.moderation_status || "active"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-500">
                    <Phone size={18} />
                    <Video size={18} />
                    <MoreVertical size={18} />
                  </div>
                </div>

                <div className="flex-1 bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_35%,#f8fafc_100%)] p-6 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.map((item) => {
                      const mine = item.sender_email === user?.email;
                      return (
                        <div key={item._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-xl rounded-3xl px-4 py-3 shadow-sm ${
                              item.kind === "system"
                                ? "bg-amber-50 text-amber-900 border border-amber-100"
                                : mine
                                ? "bg-slate-900 text-white rounded-br-md"
                                : "bg-white text-slate-800 rounded-bl-md border border-slate-100"
                            }`}
                          >
                            <div className="text-sm">{item.text}</div>
                            <div className={`mt-2 text-[11px] ${mine ? "text-slate-300" : "text-slate-400"}`}>
                              {item.sender_name} | {formatTimestamp(item.created_at)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 flex items-center gap-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleSend();
                      }
                    }}
                    placeholder="Type a message..."
                    disabled={selectedConversation.moderation_status === "muted" || selectedConversation.moderation_status === "closed"}
                    className="flex-1 border border-slate-200 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || selectedConversation.moderation_status === "muted" || selectedConversation.moderation_status === "closed"}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white p-3 rounded-full shadow"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                Select a conversation to start mentoring.
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
