// File: components/StudentProfileViewer.jsx
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import StudentCard from "./StudentCard";
import { Search } from "lucide-react";
import { getAllStudents } from "../../../public_pages/services/adminService";

export default function StudentProfileViewer() {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadStudents() {
      try {
        setLoading(true);
        setError("");
        const response = await getAllStudents();

        if (isMounted) {
          setStudents(response.students || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load students");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadStudents();

    return () => {
      isMounted = false;
    };
  }, []);

  const studentCards = useMemo(
    () =>
      students.map((student) => {
        const profile = student.profile || {};

        return {
          id: student._id || student.email,
          name: student.name || "Unnamed Student",
          department: profile.headline || "Student",
          year: profile.graduation_year
            ? `Batch ${profile.graduation_year}`
            : "Graduation year not added",
          location: profile.location || "Location not added",
          email: student.email || "Email not added",
          skills: Array.isArray(profile.skills) ? profile.skills : [],
        };
      }),
    [students]
  );

  const filteredStudents = studentCards.filter((student) => {
    const query = search.toLowerCase();

    return (
      student.name.toLowerCase().includes(query) ||
      student.department.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.skills.some((skill) => skill.toLowerCase().includes(query))
    );
  });

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
        {loading ? (
          <div className="col-span-full text-center text-gray-500 py-10">
            Loading registered students...
          </div>
        ) : error ? (
          <div className="col-span-full text-center text-red-500 py-10">
            {error}
          </div>
        ) : filteredStudents.length > 0 ? (
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
