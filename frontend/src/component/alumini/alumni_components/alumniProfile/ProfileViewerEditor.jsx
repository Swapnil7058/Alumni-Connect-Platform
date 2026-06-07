import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Briefcase,
  MapPin,
  Globe,
  MessageSquare,
  CheckCircle,
  Edit3,
  Save,
} from "lucide-react";
import ProfileField from "./ProfileField";

const initialProfile = {
  name: "",
  role: "",
  location: "",
  company: "",
  website: "",
  skills: "",
  bio: "",
};

const ProfileViewerEditor = () => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(initialProfile);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/profile/me", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to load alumni profile");
        }

        const user = await response.json();
        const details = user.profile || {};
        const socialLinks = details.social_links || {};

        setProfile({
          name: user.name || "",
          role: details.headline || "",
          location: details.location || "",
          company: details.company || "",
          website: socialLinks.linkedin || socialLinks.github || "",
          skills: Array.isArray(details.skills) ? details.skills.join(", ") : "",
          bio: details.bio || "",
        });
      } catch (error) {
        console.error("Failed to fetch alumni profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const toggleEdit = async () => {
    if (!editMode) {
      setEditMode(true);
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("http://localhost:5000/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          headline: profile.role,
          location: profile.location,
          company: profile.company,
          bio: profile.bio,
          skills: profile.skills.split(",").map((item) => item.trim()).filter(Boolean),
          social_links: {
            linkedin: profile.website,
            github: "",
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.msg || "Unable to save profile");
      }

      setEditMode(false);
    } catch (error) {
      console.error("Profile save error:", error);
      alert(error.message || "Unable to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 mt-20">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <p className="text-slate-500">Loading alumni profile...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="bg-white rounded-2xl shadow-md p-6 mt-20">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="text-blue-600" size={32} />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                {profile.name || "Alumni Member"}
              </h3>
              <p className="text-gray-500">Alumni Member</p>
            </div>
          </div>

          <button
            onClick={toggleEdit}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white font-medium transition ${
              editMode
                ? "bg-green-500 hover:bg-green-600"
                : "bg-blue-600 hover:bg-blue-700"
            } disabled:bg-slate-400`}
          >
            {editMode ? <Save size={18} /> : <Edit3 size={18} />}
            {saving ? "Saving..." : editMode ? "Save" : "Edit"}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <ProfileField
            icon={<User size={18} />}
            label="Full Name"
            name="name"
            value={profile.name}
            editMode={false}
            onChange={handleChange}
          />

          <ProfileField
            icon={<Briefcase size={18} />}
            label="Job Role"
            name="role"
            value={profile.role}
            editMode={editMode}
            onChange={handleChange}
          />

          <ProfileField
            icon={<MapPin size={18} />}
            label="Location"
            name="location"
            value={profile.location}
            editMode={editMode}
            onChange={handleChange}
          />

          <ProfileField
            icon={<CheckCircle size={18} />}
            label="Company"
            name="company"
            value={profile.company}
            editMode={editMode}
            onChange={handleChange}
          />

          <ProfileField
            icon={<Globe size={18} />}
            label="Website"
            name="website"
            value={profile.website}
            editMode={editMode}
            onChange={handleChange}
          />

          <ProfileField
            icon={<MessageSquare size={18} />}
            label="Skills"
            name="skills"
            value={profile.skills}
            editMode={editMode}
            onChange={handleChange}
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <MessageSquare size={18} />
            <span className="text-sm font-semibold">Bio</span>
          </div>

          {editMode ? (
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows={4}
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-800 bg-gray-50 p-4 rounded-xl border">
              {profile.bio || "No bio added yet."}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileViewerEditor;
