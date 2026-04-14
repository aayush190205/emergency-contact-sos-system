import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import ServiceCard from '../components/ServiceCard';

export default function DashboardPage({ user, handleLogout, isSOS, handleSOSAction, time, location, getLocation, handleAddContact, logAction }) {
  const [showForm, setShowForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });

  const submitContact = (e) => {
    e.preventDefault();
    handleAddContact(newContact.name, newContact.phone);
    setNewContact({ name: '', phone: '' });
    setShowForm(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 font-sans ${isSOS ? 'bg-red-950' : 'bg-slate-50'}`}>
      <div className="max-w-6xl mx-auto p-6 flex justify-between items-center">
         <div>
            <p className={`text-xs font-bold uppercase tracking-widest ${isSOS ? 'text-red-300' : 'text-slate-400'}`}>{user ? `Welcome, ${user.name}` : 'GUEST MODE (Limited Access)'}</p>
            <h1 className={`text-4xl font-black ${isSOS ? 'text-white' : 'text-slate-900'}`}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h1>
         </div>
         <button onClick={handleLogout} className="text-sm font-bold opacity-60 hover:opacity-100 underline text-red-500">Logout / Exit</button>
      </div>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 md:row-span-2">
          <button onClick={handleSOSAction} className={`w-full h-full min-h-[300px] rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-2xl group ${isSOS ? 'bg-red-600 animate-pulse' : 'bg-white hover:shadow-xl border border-slate-200'}`}>
             <div className="flex justify-between items-start z-10">
               <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase shadow-sm ${isSOS ? 'bg-white text-red-600' : 'bg-red-100 text-red-600'}`}>{isSOS ? 'SOS ACTIVE - DISPATCH NOTIFIED' : 'EMERGENCY TRIGGER'}</span>
               <div className={`w-4 h-4 rounded-full shadow-lg ${isSOS ? 'bg-white' : 'bg-red-600'}`}></div>
             </div>
             <div className="text-left z-10">
               <h2 className={`text-7xl font-black tracking-tighter ${isSOS ? 'text-white' : 'text-slate-900'}`}>SOS</h2>
               <p className={`mt-2 font-bold ${isSOS ? 'text-red-100' : 'text-slate-400'}`}>{isSOS ? 'Tap to Cancel Alert' : 'Tap to Broadcast Alert'}</p>
             </div>
          </button>
        </div>

        <ServiceCard 
          title="Police" number="100" color="bg-blue-600" icon={<Icons.Police />} 
          onClick={() => { logAction("Dialed Police (100)"); window.location.href = 'tel:100'; }}
        />
        <ServiceCard 
          title="Medical" number="108" color="bg-emerald-500" icon={<Icons.Medical />} 
          onClick={() => { logAction("Dialed Medical (108)"); window.location.href = 'tel:108'; }}
        />

        <div className={`md:col-span-1 md:row-span-1 rounded-[2rem] p-6 border flex flex-col justify-between ${isSOS ? 'bg-red-900/50 border-red-800 text-white' : 'bg-white border-slate-200'}`}>
           <div className="flex justify-between items-center"><Icons.Map /> {location.status === 'Locked' && <span className="text-xs font-bold text-green-500">● LIVE</span>}</div>
           <div>
             <p className="text-xs opacity-60 font-bold uppercase mb-1">Location</p>
             {location.lat ? <a href={`http://googleusercontent.com/maps.google.com/?q=${location.lat},${location.lng}`} target="_blank" rel="noreferrer" className="font-mono text-sm underline">{location.lat}, {location.lng}</a> : <button onClick={getLocation} className="bg-blue-600 text-white shadow-md text-xs font-bold px-3 py-2 rounded-lg w-full mt-2 hover:bg-blue-700 transition">Get Coordinates</button>}
           </div>
        </div>

        <div className={`md:col-span-2 md:row-span-1 rounded-[2rem] p-6 border flex flex-col justify-center ${user ? 'bg-white border-slate-200' : 'bg-slate-100 border-slate-300 border-dashed'}`}>
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-lg flex items-center gap-2">Emergency Contacts</h3>
             {!user && <span className="bg-slate-200 text-[10px] px-2 py-1 rounded font-black text-slate-500 tracking-wider"><Icons.Lock /> GUEST LOCKED</span>}
          </div>
          
          {user ? (
            <div className="flex flex-wrap gap-4 items-start">
               {user.contacts && user.contacts.map((c, idx) => (
                 <div key={idx} className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col justify-center font-bold text-xs shadow-sm hover:border-emerald-400 hover:bg-emerald-50 transition cursor-pointer" onClick={() => { logAction(`Dialed Contact: ${c.name}`); window.location.href = `tel:${c.phone}`; }}>
                   <span className="text-slate-800">{c.name}</span><span className="text-slate-400 font-mono text-[10px] mt-1">{c.phone}</span>
                 </div>
               ))}
               {!showForm ? (
                 <div onClick={() => setShowForm(true)} className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-xl border border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">+</div>
               ) : (
                 <form onSubmit={submitContact} className="flex gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-inner w-full">
                    <input required type="text" placeholder="Name" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} className="p-2 text-xs rounded-lg border w-1/3 outline-none" />
                    <input required type="tel" placeholder="Phone" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} className="p-2 text-xs rounded-lg border w-1/3 outline-none" />
                    <button type="submit" className="bg-emerald-500 text-white text-xs font-bold px-3 rounded-lg hover:bg-emerald-600">Save</button>
                    <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 text-xs font-bold px-2 hover:text-red-500">✕</button>
                 </form>
               )}
            </div>
          ) : (
            <div className="flex flex-col gap-2 text-slate-400 text-sm">
               <p className="font-bold">You are operating in Guest Mode.</p><p className="text-xs">SOS will only alert public authorities. Create an account to add personal emergency contacts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}