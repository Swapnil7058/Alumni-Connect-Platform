import React from 'react';

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-6 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-100 transition-transform hover:scale-[1.02]">
    <div className="bg-slate-50 p-3 rounded-xl">
      {React.cloneElement(icon, { size: 24, className: "text-blue-600" })}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-slate-800">{value}</p>
    </div>
  </div>
);

export default StatCard;
