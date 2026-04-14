import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Toast = ({ message, type, onClose }) => {
  const bgColor = type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-emerald-600' : 'bg-blue-600';
  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 ${bgColor} text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-4 animate-bounce`}>
      <span className="font-bold text-sm tracking-wide">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 font-bold">✕</button>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState('login'); 
  const [user, setUser] = useState(null); 
  const [isSOS, setIsSOS] = useState(false);
  const [bootLines, setBootLines] = useState([]);
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState({ lat: null, lng: null, status: 'Idle' });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

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
        setBootLines(prev => [...prev, sequence[i]]); i++;
      } else clearInterval(interval);
    }, 800);
    return () => clearInterval(interval);
  }, [view]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- SAFE RESETS ---
  const handleLogout = () => {
    setUser(null);
    setIsSOS(false);
    setLocation({ lat: null, lng: null, status: 'Idle' });
    setView('login');
  };

  const handleGuestLogin = () => {
    setUser(null);
    setIsSOS(false);
    setLocation({ lat: null, lng: null, status: 'Idle' });
    setView('dashboard');
  };

  const handleAuth = async (type, data) => {
    try {
      const res = await fetch(`${API_BASE}/api/${type}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        if (type === 'signup') {
           showToast("Account Created! Please Securely Login.", "success");
           setView('login');
        } else {
           setIsSOS(false);
           setLocation({ lat: null, lng: null, status: 'Idle' });
           setUser({ name: result.name, role: result.role, email: data.email, contacts: result.contacts });
           showToast(`Welcome back, ${result.name}`, "success");
           setView(result.role === 'admin' ? 'admin' : 'dashboard');
        }
      } else showToast(result.message, "error");
    } catch (err) { showToast("Server Connection Failed.", "error"); }
  };

  const handleForgotPassword = async (email) => {
    showToast("Generating secure reset link...", "info");
    try {
      const res = await fetch(`${API_BASE}/api/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Check your Docker terminal for the reset email link!", "success");
        setView('login');
      } else showToast(data.message, "error");
    } catch (err) { showToast("Network error.", "error"); }
  };

  const logAction = (message) => {
    fetch(`${API_BASE}/api/log`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, userEmail: user ? user.email : 'Guest' })
    }).catch(err => console.log("Failed to log action."));
  };

  const handleAddContact = async (contactName, contactPhone) => {
    try {
      const res = await fetch(`${API_BASE}/api/contacts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, contactName, contactPhone })
      });
      const data = await res.json();
      if (data.success) {
        setUser({ ...user, contacts: data.contacts });
        showToast("Contact Saved Successfully", "success");
      } else showToast(data.message, "error");
    } catch (err) { showToast("Failed to save contact.", "error"); }
  };

  const getLocation = () => {
    return new Promise((resolve) => {
        setLocation(p => ({ ...p, status: 'Locating...' }));
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    const coords = { lat: pos.coords.latitude.toFixed(4), lng: pos.coords.longitude.toFixed(4), status: 'Locked' };
                    setLocation(coords);
                    showToast("GPS Locked Successfully", "success");
                    resolve(coords);
                },
                () => {
                    const coords = { lat: 'UNKNOWN', lng: 'UNKNOWN', status: 'Denied' };
                    setLocation(coords);
                    showToast("GPS Access Denied by User", "error");
                    resolve(coords);
                }
            );
        } else resolve({ lat: 'UNKNOWN', lng: 'UNKNOWN', status: 'Denied' });
    });
  };

  const handleSOSAction = async () => {
    let currentLoc = location;
    if (!currentLoc.lat || currentLoc.lat === 'UNKNOWN') { 
      showToast("Acquiring GPS lock... Please wait.", "info"); 
      currentLoc = await getLocation(); 
    }

    const newSOSState = !isSOS;
    setIsSOS(newSOSState);

    if (newSOSState) {
      showToast("SOS ENGAGED: Contacting Dispatch...", "error");
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("🚨 SafeConnect Dispatch", {
            body: user ? "Location sent to emergency contacts." : "GUEST SOS: Location routed to authorities.",
            icon: "https://cdn-icons-png.flaticon.com/512/883/883050.png"
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") new Notification("🚨 Emergency System Active", { body: "Notifications enabled." });
          });
        }
      }

      try {
        const res = await fetch(`${API_BASE}/api/sos`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user, location: currentLoc }) 
        });
        const data = await res.json();
        if(data.success) showToast(data.message, "success");
      } catch (err) { showToast("Network failure.", "error"); }
    } else showToast("SOS Alert Cancelled by User.", "info");
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {view === 'login' || view === 'signup' || view === 'forgot' ? (
        <LoginPage view={view} setView={setView} handleAuth={handleAuth} handleForgotPassword={handleForgotPassword} bootLines={bootLines} handleGuestLogin={handleGuestLogin} />
      ) : view === 'admin' ? (
        <AdminPage handleLogout={handleLogout} showToast={showToast} />
      ) : (
        <DashboardPage 
          user={user} handleLogout={handleLogout} isSOS={isSOS} 
          handleSOSAction={(...args) => { logAction("Clicked SOS Button"); handleSOSAction(...args); }} 
          time={time} location={location} 
          getLocation={() => { logAction("Requested GPS Coordinates"); getLocation(); }} 
          handleAddContact={(...args) => { logAction("Added a new Emergency Contact"); handleAddContact(...args); }} 
          logAction={logAction}
        />
      )}
    </>
  );
}