import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  FileText,
  GraduationCap,
  Handshake,
  LayoutDashboard,
  Link2,
  LogOut,
  MessageSquare,
  ShieldCheck,
  User,
  Users,
  Menu,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const sidebarConfig = {
  student: {
    title: "Student Portal",
    icon: GraduationCap,
    items: [
      { label: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
      { label: "Mentorship", path: "/student/mentorship", icon: Handshake },
      { label: "Jobs", path: "/student/jobs", icon: Briefcase },
      { label: "LinkedIn Jobs", path: "/student/linkedin-jobs", icon: Link2 },
      { label: "Conversations", path: "/student/conversations", icon: MessageSquare },
      { label: "Resume Builder", path: "/student/resume-builder", icon: FileText },
    ],
  },
  alumni: {
    title: "Alumni Portal",
    icon: Handshake,
    items: [
      { label: "Dashboard", path: "/alumni/dashboard", icon: LayoutDashboard },
      { label: "Profile", path: "/alumni/profile", icon: User },
      { label: "Jobs", path: "/alumni/jobs", icon: Briefcase },
      { label: "LinkedIn Jobs", path: "/alumni/linkedin-jobs", icon: Link2 },
      { label: "Communication", path: "/alumni/communication", icon: MessageSquare },
      { label: "Students", path: "/alumni/students", icon: Users },
    ],
  },
  admin: {
    title: "Admin Portal",
    icon: ShieldCheck,
    items: [
      { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Jobs", path: "/admin/jobs", icon: Briefcase },
      { label: "LinkedIn Jobs", path: "/admin/linkedin-jobs", icon: Link2 },
      { label: "Edit Profile", path: "/edit-profile", icon: User },
    ],
  },
};

const RoleSidebar = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const config = sidebarConfig[role];
  if (!config) {
    return null;
  }

  const HeaderIcon = config.icon;

  return (
    <>
      <button
        className="md:hidden fixed top-24 left-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xl transition hover:bg-slate-800"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div
        className={`fixed inset-0 z-40 bg-slate-950/60 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed top-20 left-0 z-50 h-[calc(100vh-5rem)] w-64 transform overflow-y-auto bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] text-white shadow-xl transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 font-bold text-xl border-b border-white/10 gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg shadow">
              <HeaderIcon size={20} className="text-blue-800" />
            </div>
            <span className="tracking-wide">ALUMNI CONNECT</span>
          </div>
          <button
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pt-4 pb-2">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-300">{config.title}</p>
        </div>

        <nav className="p-4 space-y-3 flex-1">
          {config.items.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer text-left transition ${
                  active ? "bg-blue-700 shadow" : "hover:bg-blue-700/80"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-600 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default RoleSidebar;
