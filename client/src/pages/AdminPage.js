import React from 'react';

export default function AdminPage({ setView, userList, fetchUsers }) {
  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-slate-800">Admin Command Center</h1>
          <button onClick={() => setView('login')} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold">Logout</button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
           <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="text-slate-400 font-bold text-xs uppercase">System Status</h3>
             <p className="text-2xl font-black text-green-500 mt-2">● ONLINE</p>
           </div>
           <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="text-slate-400 font-bold text-xs uppercase">Database Connection</h3>
             <p className="text-2xl font-black text-blue-500 mt-2">ACTIVE</p>
           </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-lg">Registered Users Database</h2>
            <button onClick={fetchUsers} className="text-xs bg-slate-100 px-3 py-1 rounded font-bold hover:bg-slate-200">REFRESH DATA</button>
          </div>
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-black text-slate-400">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {userList.length === 0 && <tr><td className="p-8 text-center" colSpan="4">Click 'REFRESH DATA' to load users</td></tr>}
              {userList.map((u, i) => (
                <tr key={i} className="border-t border-slate-50 hover:bg-slate-50 transition">
                  <td className="p-4 font-bold text-slate-900">{u.name}</td>
                  <td className="p-4 font-mono">{u.email}</td>
                  <td className="p-4"><span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-bold">{u.role}</span></td>
                  <td className="p-4">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}