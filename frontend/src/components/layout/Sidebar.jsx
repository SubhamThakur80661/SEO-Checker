import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, SearchCheck, KeyRound, History, LogOut, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/audit", label: "SEO Audit", icon: SearchCheck },
  { to: "/keywords", label: "Keywords", icon: KeyRound },
  { to: "/history", label: "History", icon: History },
];

export function LogoMark({ className = "h-8 w-8" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="14" fill="#4D7C0F" />
      <path d="M12 44 L26 24 L34 36 L40 28 L52 44 Z" fill="#D7FF3E" />
      <circle cx="48" cy="18" r="5" fill="#FFFFFF" />
    </svg>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-sidebar text-sidebar-ink md:flex">
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
        <LogoMark />
        <div>
          <p className="font-display text-lg font-bold leading-none tracking-tight">RankVista</p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-sidebar-muted">
            SEO Audit
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Main">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-sidebar-muted hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon className="h-[18px] w-[18px]" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
            <User className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name || "User"}</p>
            <p className="truncate text-xs text-sidebar-muted">
              {user?.isGuest ? "Guest session" : user?.email}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            className="cursor-pointer rounded-lg p-2 text-sidebar-muted transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-[18px] w-[18px]" aria-hidden />
          </button>
        </div>
      </div>
    </aside>
  );
}
