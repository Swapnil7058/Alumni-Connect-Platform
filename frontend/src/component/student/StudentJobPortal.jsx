import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Briefcase, Filter, ExternalLink, Bookmark } from "lucide-react";

const StudentJobPortal = () => {
  const [activeSection, setActiveSection] = useState("jobPortal");

  // Simulated data: Alumni-posted (Internal) and Scraped (External) [cite: 195]
  // const jobs = [
  //   {
  //     id: 1,
  //     title: "Junior Full Stack Developer",
  //     company: "Google",
  //     location: "Pune (Remote)",
  //     type: "Alumni Posted",
  //     postedBy: "Sourbha Nayak",
  //     salary: "â‚¹12L - â‚¹18L",
  //     tags: ["React", "Flask", "PostgreSQL"],
  //     isExternal: false
  //   },
  //   {
  //     id: 2,
  //     title: "Data Analyst",
  //     company: "Meta",
  //     location: "Bangalore",
  //     type: "Scraped from LinkedIn",
  //     salary: "Competitive",
  //     tags: ["Python", "SQL", "Tableau"],
  //     isExternal: true
  //   },
  //   {
  //     id: 3,
  //     title: "Software Engineering Intern",
  //     company: "United Express",
  //     location: "Mumbai",
  //     type: "Alumni Posted",
  //     postedBy: "Yash Rakhunde",
  //     salary: "â‚¹40k/month",
  //     tags: ["JavaScript", "Tailwind CSS"],
  //     isExternal: false
  //   }
  // ];

  return (
    <div className="flex bg-[#f1f5f9] min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#1e3a8a] to-[#1e40af] text-white fixed h-screen flex flex-col shadow-xl">
        <div className="p-6 font-bold text-xl border-b border-blue-800 flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg shadow">
            <Handshake size={20} className="text-blue-800" />
          </div>
          ALUMNI CONNECT
        </div>

        <nav className="p-4 space-y-3 flex-1">
          {/* Profile */}
          <div
            onClick={() => setActiveSection("profile")}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
              activeSection === "profile"
                ? "bg-blue-700 shadow"
                : "hover:bg-blue-700"
            }`}
          >
            <User size={20} /> Profile
          </div>

          {/* Job Portal (YOUR DASHBOARD HERE) */}
          <div
            onClick={() => setActiveSection("jobPortal")}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
              activeSection === "jobPortal"
                ? "bg-blue-700 shadow"
                : "hover:bg-blue-700"
            }`}
          >
            <Briefcase size={20} /> Job Portal
          </div>

          {/* Communication */}
          <div
            onClick={() => setActiveSection("communication")}
            className="flex items-center justify-between p-3 hover:bg-blue-700 transition rounded-xl cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <MessageSquare size={20} /> Communication
            </div>
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              3
            </span>
          </div>

          {/* Student Profiles */}
          <div
            onClick={() => setActiveSection("students")}
            className="flex items-center gap-3 p-3 hover:bg-blue-700 transition rounded-xl cursor-pointer"
          >
            <GraduationCap size={20} /> Student Profiles
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64">
        {activeSection === "jobPortal" && <AlumniDashboard />}

        {activeSection === "profile" && (
          <div className="p-8">
            <h1 className="text-2xl font-semibold text-gray-700">
              Profile Section
            </h1>
          </div>
        )}

        {activeSection === "communication" && (
          <div className="p-8">
            <h1 className="text-2xl font-semibold text-gray-700">
              Communication Section
            </h1>
          </div>
        )}

        {activeSection === "students" && (
          <div className="p-8">
            <h1 className="text-2xl font-semibold text-gray-700">
              Student Profiles Section
            </h1>
          </div>
        )}
      </main>
    </div>
  );
}


export default StudentJobPortal;
