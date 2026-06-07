import React from 'react';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ChartSection = ({ connectionData, sectorData }) => {
  const COLORS = ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b'];

  return (
    <div className="grid grid-cols-12 gap-6 mb-8">
      {/* Line Chart */}
      <div className="col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-700 mb-6">Connection Growth</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={connectionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
              <Line type="monotone" dataKey="connections" stroke="#2563eb" strokeWidth={3} dot={{r: 4, fill: '#2563eb'}} />
              <Line type="monotone" dataKey="mentorships" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-700 mb-6">Job Sector Distribution</h3>
        <div className="h-64 relative flex justify-center items-center">
          <PieChart width={220} height={220}>
            <Pie data={sectorData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
              {sectorData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-bold text-slate-800">100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartSection;
