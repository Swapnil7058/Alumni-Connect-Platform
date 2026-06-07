// File: components/StudentCard.jsx
import { motion } from "framer-motion";
import { User, GraduationCap, MapPin, Mail } from "lucide-react";

export default function StudentCard({ student }) {
  const skills = Array.isArray(student.skills) ? student.skills : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-xl transition-all duration-300"
    >
      {/* Avatar + Name */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="text-blue-600" size={26} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {student.name}
          </h3>
          <p className="text-sm text-gray-500">{student.department}</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <GraduationCap size={16} className="text-blue-600" />
          <span>{student.year}</span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-blue-600" />
          <span>{student.location}</span>
        </div>

        <div className="flex items-center gap-2">
          <Mail size={16} className="text-blue-600" />
          <span className="truncate">{student.email}</span>
        </div>
      </div>

      {/* Skills */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-500 mb-2">
          Skills
        </p>
        <div className="flex flex-wrap gap-2">
          {skills.length > 0 ? (
            skills.map((skill, index) => (
              <span
                key={index}
                className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg"
              >
                {skill}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400">No skills added</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}






