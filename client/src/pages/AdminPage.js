import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function AdminPage({ handleLogout, showToast }) {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin-data`);
      const data = await res.json();
      setUsers(data.users);
      setLogs(data.logs);
      showToast("Admin Data Refreshed", "success");
    } catch (e) { showToast("Database connection error", "error"); }
  };

  const deleteUser = async (email) => {
    if(!window.confirm(`Are you sure you want to permanently delete ${email}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/delete-user`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
      });
      const data = await res.json();
      if(data.success) {
        showToast(data.message, "success");
        fetchData();
      }
    } catch (e) { showToast("Failed to delete user", "error"); }
  };

  useEffect(() => { 
    fetchData(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-slate-800">Admin Command Center</h1>
          <div className="flex gap-4">
             <button onClick={fetchData} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-blue-700">Refresh Data</button>
             <button onClick={handleLogout} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-red-700">Logout</button>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100"><h2 className="font-bold text-xl">Registered Users Database</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-black text-slate-400">
                <tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Contacts Saved</th><th className="p-4">Registration Date</th><th className="p-4 text-right">Actions</th></tr>
              </thead>
              <tbody>
                {users.length === 0 && <tr><td className="p-8 text-center" colSpan="5">No users found in database.</td></tr>}
                {users.map((u, i) => (
                  <tr key={i} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">{u.name} {u.role === 'admin' && <span className="ml-2 bg-purple-100 text-purple-600 px-2 py-0.5 rounded text-[10px]">ADMIN</span>}</td>
                    <td className="p-4 font-mono">{u.email}</td>
                    <td className="p-4 font-bold text-blue-500">{u.contacts?.length || 0} Saved</td>
                    <td className="p-4">{new Date(u.createdAt).toLocaleString()}</td>
                    <td className="p-4 text-right">
                       {u.role !== 'admin' && <button onClick={() => deleteUser(u.email)} className="text-red-500 hover:text-red-700 font-bold text-xs bg-red-50 px-3 py-1 rounded border border-red-100 hover:bg-red-100">Remove User</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100"><h2 className="font-bold text-xl text-red-600 flex items-center gap-2">🚨 Live Emergency Dispatch Logs</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-red-50 text-xs uppercase font-black text-red-400">
                <tr><th className="p-4">Date & Time</th><th className="p-4">Trigger Type</th><th className="p-4">User Details</th><th className="p-4">Location (GPS)</th></tr>
              </thead>
              <tbody>
                {logs.length === 0 && <tr><td className="p-8 text-center font-bold text-slate-400" colSpan="4">No SOS alerts have been triggered yet.</td></tr>}
                {logs.map((log, i) => (
                  <tr key={i} className="border-t border-slate-50 hover:bg-red-50 transition">
                    <td className="p-4 font-bold text-slate-900">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${log.triggerType === 'Guest' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>{log.triggerType}</span></td>
                    <td className="p-4"><div className="font-bold text-slate-800">{log.userName}</div><div className="text-xs font-mono text-slate-400">{log.userEmail}</div></td>
                    <td className="p-4 font-mono text-xs text-blue-600 underline"><a href={`http://googleusercontent.com/maps.google.com/?q=${log.location.lat},${log.location.lng}`} target="_blank" rel="noreferrer">{log.location.lat}, {log.location.lng}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}