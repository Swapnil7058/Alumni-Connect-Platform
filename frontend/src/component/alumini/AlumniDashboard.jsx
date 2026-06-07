// import React from 'react';
// import Header from '../alumini/alumini_layout/Header';
// import StatCard from '../alumini/alumini_layout/StatCard';
// import ChartSection from '../alumini/alumini_layout/ChartSection';
// import { Users, Briefcase, Handshake, MessageSquare, User, GraduationCap } from 'lucide-react';

// const AlumniDashboard = () => {
//   // Logic: Fetch this data from your Flask backend (/api/profile/me)
//   const connectionData = [
//     { name: 'Jan', connections: 20, mentorships: 10 },
//     { name: 'Feb', connections: 35, mentorships: 15 },
//     { name: 'Mar', connections: 30, mentorships: 22 },
//     { name: 'Apr', connections: 50, mentorships: 30 },
//     { name: 'May', connections: 45, mentorships: 28 },
//     { name: 'Jun', connections: 70, mentorships: 45 },
//   ];

//   const sectorData = [
//     { name: 'IT', value: 35 },
//     { name: 'Finance', value: 25 },
//     { name: 'Marketing', value: 20 },
//     { name: 'Core Eng.', value: 20 },
//   ];

//   return (
//     <div className="flex min-h-screen bg-slate-50">
//       {/* Sidebar - Matches design exactly */}
//       <aside className="w-64 bg-[#1e40af] text-white fixed h-full flex flex-col">
//         <div className="p-6 font-bold text-xl border-b border-red-800 flex items-center gap-2">
//           <div className="bg-white p-1 rounded-lg"><Handshake size={20} className="text-red-800"/></div>
//           ALUMNI CONNECT
//         </div>
//         <nav className="p-4 space-y-2 flex-1">
//           <div className="flex items-center gap-3 p-3 bg-blue-700 rounded-xl cursor-pointer"><User size={20}/> Profile</div>
//           <div className="flex items-center gap-3 p-3 hover:bg-blue-700 rounded-xl cursor-pointer"><Briefcase size={20}/> Job Portal</div>
//           <div className="flex items-center gap-3 p-3 hover:bg-blue-700 rounded-xl cursor-pointer justify-between">
//             <div className="flex items-center gap-3"><MessageSquare size={20}/> Communication</div>
//             <span className="bg-red-500 text-[10px] px-1.5 rounded-full">3</span>
//           </div>
//           <div className="flex items-center gap-3 p-3 hover:bg-blue-700 rounded-xl cursor-pointer"><GraduationCap size={20}/> Student Profiles</div>
//         </nav>
//       </aside>

//       {/* Content Area */}
//       <main className="ml-64 flex-1 p-8">
//         <Header />

//         <div className="grid grid-cols-4 gap-6 mb-8">
//           <StatCard icon={<Users />} label="Total Connections" value="320" />
//           <StatCard icon={<Briefcase />} label="Jobs Posted" value="18" />
//           <StatCard icon={<Handshake />} label="Mentorships Active" value="12" />
//           <StatCard icon={<MessageSquare />} label="Messages Received" value="150" />
//         </div>

//         <ChartSection connectionData={connectionData} sectorData={sectorData} />
//       </main>
//     </div>
//   );
// };

// export default AlumniDashboard;

import { motion } from "framer-motion";
import {
  User,
  Briefcase,
  MessageSquare,
  CheckCircle,
  GraduationCap,
} from "lucide-react";
import RoleSidebar from "../shared/RoleSidebar";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function AlumniDashboard() {
  const stats = [
    { title: "Total Connections", value: "320", icon: User },
    { title: "Jobs Posted", value: "18", icon: Briefcase },
    { title: "Mentorships Active", value: "12", icon: CheckCircle },
    { title: "Messages Received", value: "150", icon: MessageSquare },
  ];

  const lineData = [
    { month: "Jan", connections: 20, mentorships: 5 },
    { month: "Feb", connections: 35, mentorships: 18 },
    { month: "Mar", connections: 25, mentorships: 10 },
    { month: "Apr", connections: 45, mentorships: 28 },
    { month: "May", connections: 48, mentorships: 24 },
    { month: "Jun", connections: 65, mentorships: 42 },
  ];

  const barData = [
    { name: "CS", students: 40 },
    { name: "IT", students: 30 },
    { name: "ENTC", students: 20 },
    { name: "MECH", students: 15 },
  ];

  const pieData = [
    { name: "IT", value: 35 },
    { name: "Finance", value: 25 },
    { name: "Marketing", value: 20 },
    { name: "Education", value: 20 },
  ];

  const areaData = [
    { month: "Jan", engagement: 30 },
    { month: "Feb", engagement: 45 },
    { month: "Mar", engagement: 38 },
    { month: "Apr", engagement: 60 },
    { month: "May", engagement: 55 },
    { month: "Jun", engagement: 75 },
  ];

  const COLORS = ["#2563eb", "#22c55e", "#f97316", "#8b5cf6"];

  return (
    <div className="flex bg-[#f1f5f9] min-h-screen">
      <RoleSidebar role="alumni" />

      {/* Main Content (IMPORTANT: ml-64 to avoid sidebar overlap) */}
      <div className="flex-1 ml-64 p-8 mt-20">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition flex items-center gap-4 border border-gray-100"
              >
                <div className="p-3 bg-blue-100 rounded-xl text-blue-700">
                  <Icon size={26} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    {stat.title}
                  </p>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {stat.value}
                  </h2>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Connection Growth
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={lineData}>
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="connections"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="mentorships"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Students by Department
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="students" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Job Sector Distribution
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Area Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Alumni Engagement Trend
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={areaData}>
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke="#2563eb"
                  fill="#bfdbfe"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
