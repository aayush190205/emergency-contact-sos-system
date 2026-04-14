import React from 'react';

export default function LoginPage({ view, setView, handleAuth, handleForgotPassword, bootLines, handleGuestLogin }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-red-500 to-blue-500"></div>
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-red-200 rounded-full blur-3xl opacity-20"></div>

      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-slate-100 relative z-10">
        <div className="lg:w-1/2 bg-slate-50 p-12 flex flex-col justify-between border-r border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-slate-400 text-xs tracking-widest uppercase">System Online</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">SafeConnect</h1>
            <p className="text-slate-500">Next-Gen Emergency Response System.</p>
          </div>
          <div className="font-mono text-xs mt-10 space-y-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-48 overflow-hidden">
            <p className="border-b pb-2 mb-2 text-slate-400 font-bold">SYSTEM DIAGNOSTICS</p>
            {bootLines.map((line, i) => ( line ? <p key={i} className={line.color}>{`> ${line.text}`}</p> : null ))}
          </div>
        </div>

        <div className="lg:w-1/2 p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6">
            {view === 'login' ? 'Secure Login' : view === 'signup' ? 'New User Registration' : 'Password Recovery'}
          </h2>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            if (view === 'forgot') {
                handleForgotPassword(e.target.email.value);
            } else {
                const formData = {
                  email: e.target.email.value,
                  password: e.target.password.value,
                  ...(view === 'signup' && { name: e.target.name.value })
                };
                handleAuth(view, formData);
            }
          }} className="space-y-4">
            {view === 'signup' && <input name="name" placeholder="Full Name" className="w-full p-4 bg-slate-50 border rounded-xl font-bold outline-none focus:border-blue-500" required />}
            <input name="email" type="email" placeholder="Email Address" className="w-full p-4 bg-slate-50 border rounded-xl font-bold outline-none focus:border-blue-500" required />
            {view !== 'forgot' && ( <input name="password" type="password" placeholder="Password" className="w-full p-4 bg-slate-50 border rounded-xl font-bold outline-none focus:border-blue-500" required /> )}
            
            {view === 'login' && (
                <div className="text-right">
                    <span onClick={() => setView('forgot')} className="text-xs font-bold text-slate-400 cursor-pointer hover:text-slate-600">Forgot Password?</span>
                </div>
            )}

            <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition shadow-lg">
              {view === 'login' ? 'Authenticate' : view === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-4 text-center">
            <span onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="text-sm font-bold text-blue-600 cursor-pointer hover:underline">
              {view === 'login' ? 'New here? Create Account' : 'Back to Login'}
            </span>
            <div className="w-full h-px bg-slate-100"></div>
            <button type="button" onClick={handleGuestLogin} className="text-xs font-bold text-slate-400 hover:text-red-500 transition border-2 border-dashed border-slate-200 hover:border-red-200 p-3 rounded-lg uppercase tracking-wider">
              Continue as Guest (Limited Access)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}