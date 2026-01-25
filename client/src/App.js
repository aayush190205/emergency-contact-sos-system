import React, { useState, useEffect } from 'react';

// --- ICONS ---
const Icons = {
  Police: () => <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Medical: () => <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  Fire: () => <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>,
  Lock: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Map: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
};

function App() {
  const [view, setView] = useState('login'); // login | signup | dashboard | admin
  const [user, setUser] = useState(null); 
  const [isSOS, setIsSOS] = useState(false);
  
  // Login Page Animation State
  const [bootLines, setBootLines] = useState([]);
  
  // Dashboard State
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState({ lat: null, lng: null, status: 'Idle' });
  const [userList, setUserList] = useState([]); // For Admin Panel

  // --- 1. FIXED BOOT SEQUENCE ANIMATION ---
  useEffect(() => {
    if (view !== 'login') return;
    setBootLines([]); // Reset
    
    const sequence = [
      { text: "INITIALIZING SAFETY PROTOCOLS...", color: "text-blue-500" },
      { text: "CONNECTING TO EMERGENCY SATELLITE...", color: "text-blue-400" },
      { text: "VERIFYING GPS MODULES... [OK]", color: "text-green-500" },
      { text: "SECURE CONNECTION ESTABLISHED.", color: "text-slate-700 font-bold" },
    ];

    let i = 0;
    const interval = setInterval(() => {
      // Safety Check: Ensure 'sequence[i]' exists before adding
      if (i < sequence.length && sequence[i]) {
        const newLine = sequence[i];
        setBootLines(prev => [...prev, newLine]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [view]);

  // --- 2. LIVE CLOCK ---
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- API ACTIONS ---
  const handleAuth = async (type, data) => {
    try {
      const res = await fetch(`http://localhost:5000/api/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        if (type === 'signup') {
           alert("Account Created! Please Login.");
           setView('login');
        } else {
           setUser({ name: result.name, role: result.role });
           setView(result.role === 'admin' ? 'admin' : 'dashboard');
        }
      } else alert(result.message);
    } catch (err) { alert("Server Error. Is Docker running?"); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users');
      const data = await res.json();
      setUserList(data);
    } catch (e) { console.error("Could not fetch users"); }
  };

  const getLocation = () => {
    setLocation(p => ({ ...p, status: 'Locating...' }));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({ lat: pos.coords.latitude.toFixed(4), lng: pos.coords.longitude.toFixed(4), status: 'Locked' }),
        () => setLocation(p => ({ ...p, status: 'Denied' }))
      );
    }
  };

  // ================= VIEW 1: LOGIN PAGE (Clean & Techy) =================
  if (view === 'login' || view === 'signup') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-red-500 to-blue-500"></div>
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-red-200 rounded-full blur-3xl opacity-20"></div>

        <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-slate-100 relative z-10">
          
          {/* LEFT: System Status */}
          <div className="lg:w-1/2 bg-slate-50 p-12 flex flex-col justify-between border-r border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-bold text-slate-400 text-xs tracking-widest uppercase">System Online</span>
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">SafeConnect</h1>
              <p className="text-slate-500">Next-Gen Emergency Response System.</p>
            </div>

            {/* The Boot Animation (With Safety Check) */}
            <div className="font-mono text-xs mt-10 space-y-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-48">
              <p className="border-b pb-2 mb-2 text-slate-400 font-bold">SYSTEM DIAGNOSTICS</p>
              {bootLines.map((line, i) => (
                // Added check: line && line.color to prevent crashes
                line ? <p key={i} className={line.color}>{`> ${line.text}`}</p> : null
              ))}
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="lg:w-1/2 p-12 flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-6">{view === 'login' ? 'Secure Login' : 'New User Registration'}</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = {
                email: e.target.email.value,
                password: e.target.password.value,
                ...(view === 'signup' && { name: e.target.name.value })
              };
              handleAuth(view, formData);
            }} className="space-y-4">
              
              {view === 'signup' && <input name="name" placeholder="Full Name" className="w-full p-4 bg-slate-50 border rounded-xl font-bold outline-none focus:border-blue-500" required />}
              <input name="email" type="email" placeholder="Email Address" className="w-full p-4 bg-slate-50 border rounded-xl font-bold outline-none focus:border-blue-500" required />
              <input name="password" type="password" placeholder="Password" className="w-full p-4 bg-slate-50 border rounded-xl font-bold outline-none focus:border-blue-500" required />
              
              <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition shadow-lg">
                {view === 'login' ? 'Authenticate' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-4 text-center">
              <span onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="text-sm font-bold text-blue-600 cursor-pointer hover:underline">
                {view === 'login' ? 'New here? Create Account' : 'Back to Login'}
              </span>
              <div className="w-full h-px bg-slate-100"></div>
              
              {/* GUEST MODE BUTTON */}
              <button 
                onClick={() => { setUser(null); setView('dashboard'); }} 
                className="text-xs font-bold text-slate-400 hover:text-red-500 transition border-2 border-dashed border-slate-200 hover:border-red-200 p-3 rounded-lg uppercase tracking-wider"
              >
                Continue as Guest (Limited Access)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= VIEW 2: ADMIN PANEL =================
  if (view === 'admin') {
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

  // ================= VIEW 3: MAIN DASHBOARD =================
  return (
    <div className={`min-h-screen transition-colors duration-700 font-sans ${isSOS ? 'bg-red-950' : 'bg-slate-50'}`}>
      <div className="max-w-6xl mx-auto p-6 flex justify-between items-center">
         <div>
            <p className={`text-xs font-bold uppercase tracking-widest ${isSOS ? 'text-red-300' : 'text-slate-400'}`}>
              {user ? `Welcome, ${user.name}` : 'GUEST MODE (Limited Access)'}
            </p>
            <h1 className={`text-4xl font-black ${isSOS ? 'text-white' : 'text-slate-900'}`}>
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </h1>
         </div>
         <button onClick={() => setView('login')} className="text-sm font-bold opacity-60 hover:opacity-100 underline text-red-500">Logout / Exit</button>
      </div>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* HERO SOS */}
        <div className="md:col-span-2 md:row-span-2">
          <button 
            onClick={() => setIsSOS(!isSOS)}
            className={`w-full h-full min-h-[300px] rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-2xl group ${isSOS ? 'bg-red-600' : 'bg-white hover:shadow-xl'}`}
          >
             <div className="flex justify-between items-start z-10">
               <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase ${isSOS ? 'bg-white text-red-600' : 'bg-red-100 text-red-600'}`}>
                 {isSOS ? 'SOS ACTIVE' : 'EMERGENCY TRIGGER'}
               </span>
               <div className={`w-4 h-4 rounded-full animate-pulse ${isSOS ? 'bg-white' : 'bg-red-600'}`}></div>
             </div>
             <div className="text-left z-10">
               <h2 className={`text-7xl font-black ${isSOS ? 'text-white' : 'text-slate-900'}`}>SOS</h2>
               <p className={`mt-2 font-bold ${isSOS ? 'text-red-100' : 'text-slate-400'}`}>
                 {isSOS ? 'Click to Cancel' : 'Tap to Broadcast Alert'}
               </p>
             </div>
          </button>
        </div>

        {/* SERVICES */}
        <ServiceCard title="Police" number="100" color="bg-blue-600" icon={<Icons.Police />} />
        <ServiceCard title="Medical" number="108" color="bg-emerald-500" icon={<Icons.Medical />} />

        {/* LOCATION */}
        <div className={`md:col-span-1 md:row-span-1 rounded-[2rem] p-6 border flex flex-col justify-between ${isSOS ? 'bg-red-900/50 border-red-800 text-white' : 'bg-white border-slate-200'}`}>
           <div className="flex justify-between items-center"><Icons.Map /> {location.status === 'Locked' && <span className="text-xs font-bold text-green-500">● LIVE</span>}</div>
           <div>
             <p className="text-xs opacity-60 font-bold uppercase mb-1">Location</p>
             {location.lat ? <a href={`http://googleusercontent.com/maps.google.com/4{location.lat},${location.lng}`} target="_blank" rel="noreferrer" className="font-mono text-sm underline">{location.lat}, {location.lng}</a> : <button onClick={getLocation} className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg w-full mt-2">Get Coordinates</button>}
           </div>
        </div>

        {/* SPEED DIALS (Locked for Guest) */}
        <div className={`md:col-span-2 md:row-span-1 rounded-[2rem] p-6 border border-dashed flex flex-col justify-center ${user ? 'bg-white border-slate-200' : 'bg-slate-100 border-slate-300'}`}>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">Speed Dials {!user && <span className="bg-slate-200 text-[10px] px-2 py-1 rounded">LOCKED</span>}</h3>
          {user ? (
            <div className="flex gap-4">
               {['Dad', 'Mom', 'Brother'].map(n => <div key={n} className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-xs border cursor-pointer hover:bg-green-50 hover:border-green-400">{n}</div>)}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 font-bold text-sm"><Icons.Lock /> Login to access contacts</div>
          )}
        </div>

      </div>
    </div>
  );
}

function ServiceCard({ title, number, color, icon }) {
  return (
    <div className={`md:col-span-1 md:row-span-1 ${color} rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition cursor-pointer`}>
       <div className="absolute -right-4 -top-4 w-20 h-20 bg-white opacity-10 rounded-full blur-xl group-hover:scale-150 transition duration-500"></div>
       {icon}
       <div className="mt-4"><h3 className="font-bold text-lg">{title}</h3><p className="opacity-80 text-xs">Dial {number}</p></div>
    </div>
  );
}

export default App;