import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { Home, LogOut, History as HistoryIcon, KeyRound, TrendingUp, Coins, Activity } from 'lucide-react';
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

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: Home, end: true },
  { to: "/audit", label: "SEO Audit", icon: Activity },
  { to: "/keywords", label: "Keywords", icon: KeyRound },
  { to: "/history", label: "History", icon: HistoryIcon },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5 text-olivewood">
      <div className="bg-olivewood p-2 rounded-lg">
        <TrendingUp className="text-olive" size={20} />
      </div>
      <span className="text-xl font-bold tracking-tight">RankPilot</span>
    </div>
  );
}

function navLinkClass({ isActive }) {
  return `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-colors ${
    isActive
      ? 'bg-white text-olivewood shadow-card ring-1 ring-sand/60'
      : 'text-bark hover:text-olivewood hover:bg-white/60'
  }`;
}

function App() {
  const { user, logout } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />

        <Route path="*" element={
          <ProtectedRoute>
            <div className="flex min-h-screen bg-parchment font-sans text-olivewood selection:bg-sage/30">

              <aside className="hidden md:flex w-64 shrink-0 border-r border-sand/60 p-5 flex-col sticky top-0 h-screen">
                <div className="px-2 pt-2 pb-8">
                  <Logo />
                </div>

                <nav className="flex-1 space-y-1">
                  {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                    <NavLink key={to} to={to} end={end} className={navLinkClass}>
                      <Icon size={19} strokeWidth={2.2} /> {label}
                    </NavLink>
                  ))}
                </nav>

                {user && (
                  <div className="mt-auto bg-white rounded-2xl border border-sand/60 shadow-card p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-olivewood rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-sm text-olivewood truncate">{user.name}</p>
                        <p className="text-xs text-bark truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-sand/60">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-olivewood">
                        <Coins size={15} className="text-moss" />
                        {user.credits}
                        <span className="text-xs text-bark font-medium">credits</span>
                      </span>
                      <button
                        onClick={logout}
                        className="p-1.5 text-bark hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Log out"
                        aria-label="Log out"
                      >
                        <LogOut size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </aside>

              <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
                <header className="md:hidden sticky top-0 z-20 bg-parchment/95 backdrop-blur border-b border-sand/60 px-4 pt-4 pb-3">
                  <div className="flex items-center justify-between">
                    <Logo />
                    <button
                      onClick={logout}
                      className="p-2 text-bark hover:text-red-700 rounded-lg"
                      aria-label="Log out"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                  <nav className="flex gap-1 mt-3 overflow-x-auto">
                    {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                      <NavLink key={to} to={to} end={end} className={navLinkClass}>
                        <Icon size={17} strokeWidth={2.2} /> {label}
                      </NavLink>
                    ))}
                  </nav>
                </header>

                <main className="p-5 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full flex-1">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/audit" element={<Audit />} />
                    <Route path="/keywords" element={<Keywords />} />
                    <Route path="/history" element={<History />} />
                  </Routes>
                </main>
              </div>

              <ChatBot />
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
