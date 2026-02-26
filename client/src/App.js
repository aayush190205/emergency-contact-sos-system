import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';

// Reads from .env file
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [view, setView] = useState('login'); 
  const [user, setUser] = useState(null); 
  const [isSOS, setIsSOS] = useState(false);
  
  const [bootLines, setBootLines] = useState([]);
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState({ lat: null, lng: null, status: 'Idle' });
  const [userList, setUserList] = useState([]); 

  // --- LOGIC HOOKS (Identical to before) ---
  useEffect(() => {
    if (view !== 'login') return;
    setBootLines([]); 
    const sequence = [
      { text: "INITIALIZING SAFETY PROTOCOLS...", color: "text-blue-500" },
      { text: "CONNECTING TO EMERGENCY SATELLITE...", color: "text-blue-400" },
      { text: "VERIFYING GPS MODULES... [OK]", color: "text-green-500" },
      { text: "SECURE CONNECTION ESTABLISHED.", color: "text-slate-700 font-bold" },
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length && sequence[i]) {
        setBootLines(prev => [...prev, sequence[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 800);
    return () => clearInterval(interval);
  }, [view]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAuth = async (type, data) => {
    try {
      const res = await fetch(`${API_BASE}/api/${type}`, {
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
      const res = await fetch(`${API_BASE}/api/users`);
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

  // --- ROUTING (Returns the modular pages) ---
  if (view === 'login' || view === 'signup') {
    return <LoginPage view={view} setView={setView} setUser={setUser} handleAuth={handleAuth} bootLines={bootLines} />;
  }

  if (view === 'admin') {
    return <AdminPage setView={setView} userList={userList} fetchUsers={fetchUsers} />;
  }

  return (
    <DashboardPage 
      user={user} setView={setView} isSOS={isSOS} setIsSOS={setIsSOS} 
      time={time} location={location} getLocation={getLocation} 
    />
  );
}

export default App;