import { Component } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { useAuth } from "./context/AuthContext.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import Topbar from "./components/layout/Topbar.jsx";
import MobileNav from "./components/layout/MobileNav.jsx";
import ChatAssistant from "./components/ChatAssistant.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Audit from "./pages/Audit.jsx";
import Keywords from "./pages/Keywords.jsx";
import History, { HistoryDetail } from "./pages/History.jsx";
import Report from "./pages/Report.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading…
        </p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

function Shell() {
  const location = useLocation();
  return (
    <div className="relative min-h-screen bg-paper">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-lime-100/70 via-lime-50/40 to-transparent" />
      <Sidebar />
      <Topbar />
      <main className="pb-20 md:ml-60 md:pb-10">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 14, scale: 0.997 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.9 }}
          className="mx-auto max-w-5xl px-4 pt-5 sm:px-6 sm:pt-8"
        >
          <Outlet />
        </motion.div>
      </main>
      <MobileNav />
      <ChatAssistant />
    </div>
  );
}

// Catches render crashes anywhere in the app and shows a reload screen
// instead of a blank white page (the 2026-11-18 dashboard crash had no
// boundary, so one null read wiped the whole tree).
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F7F2", padding: 16 }}>
          <div style={{ maxWidth: 420, textAlign: "center" }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1A1D1A" }}>Something went wrong</h1>
            <p style={{ marginTop: 8, fontSize: 14, color: "#5C665F" }}>The page hit an unexpected error. Reloading usually fixes it.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{ marginTop: 16, height: 44, padding: "0 20px", borderRadius: 8, border: "none", background: "#4D7C0F", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Reload the page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/report/:id" element={<Report />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Shell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/keywords" element={<Keywords />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:id" element={<HistoryDetail />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ErrorBoundary>
  );
}
