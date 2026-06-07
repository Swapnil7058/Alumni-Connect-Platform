// File: components/StudentProfileViewer.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import StudentCard from "./StudentCard";
import { Search } from "lucide-react";

export default function StudentProfileViewer() {
  const [search, setSearch] = useState("");

  const students = [
    {
      id: 1,
      name: "Rahul Sharma",
      department: "Computer Engineering",
      year: "Final Year",
      location: "Pune, Maharashtra",
      email: "rahul.sharma@gmail.com",
      skills: ["React", "JavaScript", "DSA"],
    },
    {
      id: 2,
      name: "Sneha Patil",
      department: "Information Technology",
      year: "Third Year",
      location: "Mumbai, Maharashtra",
      email: "sneha.patil@gmail.com",
      skills: ["Node.js", "MongoDB", "Express"],
    },
    {
      id: 3,
      name: "Amit Joshi",
      department: "ENTC",
      year: "Final Year",
      location: "Nashik, Maharashtra",
      email: "amit.joshi@gmail.com",
      skills: ["C++", "Embedded", "IoT"],
    },
    {
      id: 4,
      name: "Priya Deshmukh",
      department: "Computer Engineering",
      year: "Second Year",
      location: "Pune, Maharashtra",
      email: "priya.d@gmail.com",
      skills: ["HTML", "CSS", "Tailwind"],
    },
    {
      id: 5,
      name: "Kunal Verma",
      department: "Mechanical",
      year: "Final Year",
      location: "Nagpur, Maharashtra",
      email: "kunal.verma@gmail.com",
      skills: ["AutoCAD", "Design", "SolidWorks"],
    },
    {
      id: 6,
      name: "Anjali Kulkarni",
      department: "IT",
      year: "Third Year",
      location: "Pune, Maharashtra",
      email: "anjali.k@gmail.com",
      skills: ["React", "Firebase", "UI/UX"],
    },
  ];

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Student Profiles
        </h1>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Students Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-10">
            No students found
          </div>
        )}
      </motion.div>
    </div>
  );
}
