import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { Home, LogOut, History as HistoryIcon, KeyRound, TrendingUp, Coins, Activity } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

import Dashboard from "./pages/Dashboard";
import Audit from "./pages/Audit";
import Keywords from "./pages/Keywords";
import ChatBot from "./components/ChatBot";
import Cursor from "./components/Cursor";
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
    <div className="flex items-center gap-3 text-paper">
      <span className="flex h-9 w-9 items-center justify-center bg-lime text-ink">
        <TrendingUp size={20} strokeWidth={2.5} />
      </span>
      <span className="font-display font-wide text-lg font-black tracking-tight">RANKPILOT</span>
    </div>
  );
}

function topNavClass({ isActive }) {
  return `nav-link font-mono text-[12px] uppercase tracking-[0.14em] transition-colors ${
    isActive ? 'text-lime' : 'text-smoke hover:text-paper'
  }`;
}

function tabClass({ isActive }) {
  return `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
    isActive ? 'text-lime' : 'text-smoke hover:text-paper'
  }`;
}

function App() {
  const { user, logout } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Cursor />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />

        <Route path="*" element={
          <ProtectedRoute>
            <div className="relative min-h-screen bg-ink font-sans text-paper selection:bg-lime selection:text-ink">
              <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
                <div className="animate-drift absolute -top-32 right-[8%] h-[520px] w-[520px] rounded-full" style={{ background: "radial-gradient(circle, rgba(215,255,62,0.20) 0%, transparent 65%)" }} />
                <div className="absolute bottom-[6%] left-[-6%] h-[560px] w-[560px] rounded-full" style={{ background: "radial-gradient(circle, rgba(45,212,191,0.14) 0%, transparent 65%)" }} />
                <div className="absolute right-[-10%] top-[45%] h-[420px] w-[420px] rounded-full" style={{ background: "radial-gradient(circle, rgba(242,240,234,0.06) 0%, transparent 65%)" }} />
              </div>
              <header className="glass-bar sticky top-0 z-30 border-b border-white/10">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
                  <Logo />
                  <nav className="hidden items-center gap-7 md:flex">
                    {NAV_ITEMS.map(({ to, label, end }) => (
                      <NavLink key={to} to={to} end={end} className={topNavClass}>
                        {label}
                      </NavLink>
                    ))}
                  </nav>
                  {user && (
                    <div className="flex items-center gap-3">
                      <span className="glass-soft hidden items-center gap-1.5 px-3 py-1.5 font-mono text-xs text-paper sm:flex">
                        <Coins size={14} className="text-lime" />
                        {user.credits}
                        <span className="text-smoke">credits</span>
                      </span>
                      <span className="hidden h-8 w-8 items-center justify-center bg-lime font-display text-sm font-extrabold text-ink lg:flex">
                        {user.name?.charAt(0) || 'U'}
                      </span>
                      <button
                        onClick={logout}
                        className="flex items-center gap-2 border border-white/12 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-smoke transition-colors hover:border-red-400/60 hover:text-red-300"
                        aria-label="Log out"
                      >
                        <LogOut size={15} />
                        <span className="hidden sm:inline">Log out</span>
                      </button>
                    </div>
                  )}
                </div>
              </header>

              <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-5 pb-28 pt-8 sm:px-8 sm:pt-12 md:pb-16">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/audit" element={<Audit />} />
                  <Route path="/keywords" element={<Keywords />} />
                  <Route path="/history" element={<History />} />
                </Routes>
              </main>

              <nav className="glass-bar fixed inset-x-0 bottom-0 z-30 flex border-t border-white/10 md:hidden">
                {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                  <NavLink key={to} to={to} end={end} className={tabClass}>
                    <Icon size={19} strokeWidth={2.2} /> {label}
                  </NavLink>
                ))}
              </nav>

              <ChatBot />
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
