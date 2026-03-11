import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { Home, LineChart, Key, LogOut, History as HistoryIcon, Activity, KeyRound, TrendingUp, Coins } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

import Dashboard from "./pages/Dashboard";
import Audit from "./pages/Audit";
import Keywords from "./pages/Keywords";
import ChatBot from "./components/ChatBot";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import History from "./pages/History";

function App(){
  const { user, logout } = useContext(AuthContext);

  return(
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
        
        {/* Protected Application Wrapper */}
        <Route path="*" element={
          <ProtectedRoute>
            <div className="flex min-h-screen bg-parchment font-sans text-olivewood selection:bg-sage selection:text-white">
              
               {/* SIDEBAR */}
              <div className="w-72 bg-sand/40 border-r border-bark/10 p-6 flex flex-col relative z-10">
                <div className="flex items-center gap-3 mb-10 text-olivewood ml-2 mt-4">
                  <div className="bg-gradient-to-br from-olive to-sage p-2.5 rounded-xl shadow-sm border border-sage/20">
                    <TrendingUp className="text-white" size={24} />
                  </div>
                  <h1 className="text-2xl font-black tracking-tight drop-shadow-sm">RankPilot</h1>
                </div>
                
                <nav className="flex-1 space-y-3 px-2">
                  <NavLink 
                    to="/" 
                    className={({ isActive }) => `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold ${isActive ? 'bg-sage/15 text-olivewood border border-sage/20 shadow-sm shadow-sage/5' : 'text-bark hover:bg-parchment/60 hover:text-olivewood'}`}
                  >
                    <Home size={20} strokeWidth={2.5} /> Dashboard
                  </NavLink>
                  <NavLink 
                    to="/audit" 
                    className={({ isActive }) => `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold ${isActive ? 'bg-sage/15 text-olivewood border border-sage/20 shadow-sm shadow-sage/5' : 'text-bark hover:bg-parchment/60 hover:text-olivewood'}`}
                  >
                    <Activity size={20} strokeWidth={2.5} /> SEO Audit
                  </NavLink>
                  <NavLink 
                    to="/keywords" 
                    className={({ isActive }) => `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold ${isActive ? 'bg-sage/15 text-olivewood border border-sage/20 shadow-sm shadow-sage/5' : 'text-bark hover:bg-parchment/60 hover:text-olivewood'}`}
                  >
                     <KeyRound size={20} strokeWidth={2.5} /> Keyword Research
                  </NavLink>
                  <NavLink 
                    to="/history" 
                    className={({ isActive }) => `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold ${isActive ? 'bg-sage/15 text-olivewood border border-sage/20 shadow-sm shadow-sage/5' : 'text-bark hover:bg-parchment/60 hover:text-olivewood'}`}
                  >
                    <HistoryIcon size={20} strokeWidth={2.5} /> History & Reports
                  </NavLink>
                </nav>
                
                {user && (
                  <div className="mt-auto px-4 py-4 bg-sand/60 rounded-2xl border border-bark/10 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-olivewood to-bark rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-parchment">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-sm text-olivewood truncate">{user.name}</p>
                        <p className="text-xs font-medium text-bark truncate">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm px-2 mt-2 pt-3 border-t border-bark/10">
                      <div className="flex items-center gap-1.5 text-olivewood font-bold">
                        <Coins size={14} className="text-sage" strokeWidth={3} />
                        <span>{user.credits}</span> <span className="text-xs text-bark font-medium uppercase tracking-wider">Credits</span>
                      </div>
                      <button 
                        onClick={logout}
                        className="p-1.5 text-bark hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Logout"
                      >
                        <LogOut size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
      
              {/* MAIN CONTENT AREA */}
              <div className="flex-1 overflow-x-hidden relative h-screen overflow-y-auto custom-scrollbar">
                <main className="p-10 max-w-7xl mx-auto w-full">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/audit" element={<Audit />} />
                    <Route path="/keywords" element={<Keywords />} />
                    <Route path="/history" element={<History />} />
                  </Routes>
                </main>
              </div>

              <ChatBot/>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App;