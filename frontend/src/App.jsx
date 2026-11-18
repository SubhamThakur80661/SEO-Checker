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
    <div className="min-h-screen bg-paper">
      <Sidebar />
      <Topbar />
      <main className="pb-20 md:ml-60 md:pb-10">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
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

export default function App() {
  return (
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
  );
}
