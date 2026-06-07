import React, { useEffect, useState } from "react";
import { Briefcase, Code, Mail, MapPin, MessageSquare, UserRound } from "lucide-react";

const fieldClass =
  "w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none";

const initialProfileState = {
  fullName: "",
  email: "",
  prnOrId: "",
  graduationYear: "",
  headline: "",
  bio: "",
  skills: "",
  career_goals: "",
  mentorship_topics: "",
  location: "",
  communication_preference: "chat",
  github: "",
  linkedin: "",
  company: "",
};

const EditProfile = () => {
  const [profileData, setProfileData] = useState(initialProfileState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("https://alumni-connect-platform-iiaa.onrender.com/api/profile/me", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const user = await response.json();
        const profile = user.profile || {};
        const socialLinks = profile.social_links || {};

        setProfileData({
          fullName: user.name || "",
          email: user.email || "",
          prnOrId: profile.prn_id || "",
          graduationYear: profile.graduation_year || "",
          headline: profile.headline || "",
          bio: profile.bio || "",
          skills: Array.isArray(profile.skills) ? profile.skills.join(", ") : "",
          career_goals: Array.isArray(profile.career_goals) ? profile.career_goals.join(", ") : "",
          mentorship_topics: Array.isArray(profile.mentorship_topics)
            ? profile.mentorship_topics.join(", ")
            : "",
          location: profile.location || "",
          communication_preference: profile.communication_preference || "chat",
          github: socialLinks.github || "",
          linkedin: socialLinks.linkedin || "",
          company: profile.company || "",
        });
      } catch (error) {
        console.error("Profile load error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (key, value) => {
    setProfileData((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const processedData = {
      headline: profileData.headline,
      bio: profileData.bio,
      skills: profileData.skills.split(",").map((s) => s.trim()).filter(Boolean),
      career_goals: profileData.career_goals.split(",").map((s) => s.trim()).filter(Boolean),
      mentorship_topics: profileData.mentorship_topics
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      location: profileData.location,
      communication_preference: profileData.communication_preference,
      company: profileData.company,
      social_links: {
        github: profileData.github,
        linkedin: profileData.linkedin,
      },
    };

    try {
      const response = await fetch("https://alumni-connect-platform-iiaa.onrender.com/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
        credentials: "include",
      });

      if (response.ok) {
        alert("Profile updated successfully!");
      } else {
        const error = await response.json();
        alert(error.msg || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Unable to update profile right now.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
        <p className="text-slate-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Edit Professional Profile</h2>
      <p className="text-slate-500 mb-6">
        Your registration details are loaded below so you can continue updating your alumni profile
        without re-entering everything.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <InfoCard icon={UserRound} label="Full Name" value={profileData.fullName || "Not provided"} />
        <InfoCard icon={Mail} label="Email" value={profileData.email || "Not provided"} />
        <InfoCard icon={Briefcase} label="PRN / Alumni ID" value={profileData.prnOrId || "Not provided"} />
        <InfoCard icon={Briefcase} label="Graduation Year" value={profileData.graduationYear || "Not provided"} />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase mb-2">
            <Briefcase size={16} /> Professional Headline
          </label>
          <input
            type="text"
            value={profileData.headline}
            className={fieldClass}
            placeholder="e.g. Software Engineer at Tech Corp"
            onChange={(e) => handleChange("headline", e.target.value)}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase mb-2">
            <MessageSquare size={16} /> Short Bio
          </label>
          <textarea
            value={profileData.bio}
            className={`${fieldClass} min-h-[120px]`}
            placeholder="Write a short introduction about your journey, experience, and how you can help students."
            onChange={(e) => handleChange("bio", e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Current Company</label>
            <input
              type="text"
              value={profileData.company}
              className={`${fieldClass} mt-1`}
              placeholder="Company / Organization"
              onChange={(e) => handleChange("company", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
            <input
              type="text"
              value={profileData.location}
              className={`${fieldClass} mt-1`}
              placeholder="City, State"
              onChange={(e) => handleChange("location", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase mb-2">
            <Code size={16} /> Skills (Comma separated)
          </label>
          <input
            type="text"
            value={profileData.skills}
            className={fieldClass}
            placeholder="React, Node.js, Python..."
            onChange={(e) => handleChange("skills", e.target.value)}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase mb-2">
            <Briefcase size={16} /> Career Goals
          </label>
          <input
            type="text"
            value={profileData.career_goals}
            className={fieldClass}
            placeholder="Backend Engineer, Data Science, Product..."
            onChange={(e) => handleChange("career_goals", e.target.value)}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase mb-2">
            <MessageSquare size={16} /> Mentorship Topics
          </label>
          <input
            type="text"
            value={profileData.mentorship_topics}
            className={fieldClass}
            placeholder="Interviews, internships, resume review..."
            onChange={(e) => handleChange("mentorship_topics", e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
              <MapPin size={14} /> Communication Preference
            </label>
            <select
              value={profileData.communication_preference}
              className={`${fieldClass} mt-1`}
              onChange={(e) => handleChange("communication_preference", e.target.value)}
            >
              <option value="chat">Chat</option>
              <option value="forum">Forum</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">LinkedIn URL</label>
            <input
              type="url"
              value={profileData.linkedin}
              className={`${fieldClass} mt-1`}
              onChange={(e) => handleChange("linkedin", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">GitHub URL</label>
          <input
            type="url"
            value={profileData.github}
            className={`${fieldClass} mt-1`}
            onChange={(e) => handleChange("github", e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:bg-slate-300"
        >
          {saving ? "Saving..." : "Save Profile Changes"}
        </button>
      </form>
    </div>
  );
};

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
        <Icon size={14} /> {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-800 break-words">{value}</p>
    </div>
  );
}

export default EditProfile;
