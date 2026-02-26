import React from 'react';

export default function ServiceCard({ title, number, color, icon }) {
  return (
    <div className={`md:col-span-1 md:row-span-1 ${color} rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition cursor-pointer`}>
       <div className="absolute -right-4 -top-4 w-20 h-20 bg-white opacity-10 rounded-full blur-xl group-hover:scale-150 transition duration-500"></div>
       {icon}
       <div className="mt-4"><h3 className="font-bold text-lg">{title}</h3><p className="opacity-80 text-xs">Dial {number}</p></div>
    </div>
  );
}