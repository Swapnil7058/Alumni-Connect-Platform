import React, { useEffect, useState } from "react";
import RoleSidebar from "../shared/RoleSidebar";
import {
  getAdminOverview,
  getPendingAlumni,
  getAllStudents,
  getVerifiedAlumni,
  verifyAlumni,
  getConversationModerationQueue,
  updateConversationModeration,
} from "../public_pages/services/adminService";

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [pendingAlumni, setPendingAlumni] = useState([]);
  const [students, setStudents] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [overviewRes, pendingRes, studentsRes, alumniRes, conversationsRes] = await Promise.all([
        getAdminOverview(),
        getPendingAlumni(),
        getAllStudents(),
        getVerifiedAlumni(),
        getConversationModerationQueue(),
      ]);

      setOverview(overviewRes.overview || null);
      setPendingAlumni(pendingRes.pending_alumni || []);
      setStudents(studentsRes.students || []);
      setAlumni(alumniRes.alumni || []);
      setConversations(conversationsRes.conversations || []);
    } catch (error) {
      console.error("Admin fetch error:", error);
      alert("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await verifyAlumni(id);
      alert("Alumni verified successfully!");
      fetchData();
    } catch (error) {
      alert("Verification failed");
    }
  };

  const handleConversationStatus = async (id, status) => {
    try {
      await updateConversationModeration(id, status);
      fetchData();
    } catch (error) {
      alert("Failed to update moderation status");
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-xl font-bold">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <RoleSidebar role="admin" />
      <div className="ml-64 p-10 pt-28 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-red-600">Admin Dashboard</h1>
        <p className="text-slate-500 mt-2">
          Verify alumni, supervise student-alumni conversations, and monitor mentorship productivity.
        </p>
      </div>

      {overview ? (
        <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Students" value={overview.students} />
          <StatCard label="Verified Alumni" value={overview.verified_alumni} />
          <StatCard label="Mentorship Requests" value={overview.mentorship_requests} />
          <StatCard label="Messages Sent" value={overview.messages_sent} />
          <StatCard label="Active Conversations" value={overview.active_conversations} />
          <StatCard label="Flagged Chats" value={overview.flagged_conversations} />
          <StatCard label="Job Posts" value={overview.job_posts} />
          <StatCard label="Applications" value={overview.job_applications} />
          <StatCard label="Forum Posts" value={overview.forum_posts} />
          <StatCard label="Flagged Posts" value={overview.flagged_forum_posts} />
        </section>
      ) : null}

      <section className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-4">Pending Alumni Approvals ({pendingAlumni.length})</h2>

        {pendingAlumni.length === 0 ? (
          <p className="text-gray-500">No pending alumni approvals</p>
        ) : (
          <div className="space-y-4">
            {pendingAlumni.map((alum) => (
              <div key={alum._id} className="flex justify-between items-center border p-4 rounded-xl">
                <div>
                  <p className="font-bold">{alum.name}</p>
                  <p className="text-sm text-gray-500">{alum.email}</p>
                  <p className="text-sm">Graduation: {alum.profile?.graduation_year}</p>
                </div>

                <button
                  onClick={() => handleApprove(alum._id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-4">Students ({students.length})</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {students.map((student) => (
            <div key={student._id} className="border p-4 rounded-xl">
              <p className="font-bold">{student.name}</p>
              <p className="text-sm text-gray-500">{student.email}</p>
              <p className="text-sm">PRN: {student.profile?.prn_id}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-4">Verified Alumni ({alumni.length})</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {alumni.map((alum) => (
            <div key={alum._id} className="border p-4 rounded-xl">
              <p className="font-bold">{alum.name}</p>
              <p className="text-sm text-gray-500">{alum.email}</p>
              <p className="text-sm">Company: {alum.profile?.company || "N/A"}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-4">Conversation Controller ({conversations.length})</h2>

        <div className="space-y-4">
          {conversations.map((conversation) => (
            <div key={conversation._id} className="border p-4 rounded-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <p className="font-bold">
                    {(conversation.participants || []).map((participant) => participant.name).join(" • ")}
                  </p>
                  <p className="text-sm text-gray-500">
                    Last message: {conversation.last_message || "No messages yet"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status: {conversation.moderation_status || "active"} • Messages: {conversation.message_count}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleConversationStatus(conversation._id, "active")}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700"
                  >
                    Allow
                  </button>
                  <button
                    onClick={() => handleConversationStatus(conversation._id, "flagged")}
                    className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-600"
                  >
                    Flag
                  </button>
                  <button
                    onClick={() => handleConversationStatus(conversation._id, "muted")}
                    className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900"
                  >
                    Mute
                  </button>
                  <button
                    onClick={() => handleConversationStatus(conversation._id, "closed")}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-white p-5 rounded-2xl shadow border">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="text-3xl font-black text-slate-900 mt-2">{value}</p>
  </div>
);

export default AdminDashboard;
