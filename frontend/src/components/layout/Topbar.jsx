import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { LogoMark } from "./Sidebar.jsx";

/**
 * Mobile top bar (logo + log out). On desktop the sidebar carries identity,
 * so this only renders below the md breakpoint.
 */
export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-line bg-paper/90 px-4 py-3 backdrop-blur md:hidden">
      <div className="flex items-center gap-2">
        <LogoMark className="h-7 w-7" />
        <span className="font-display text-base font-bold tracking-tight">RankVista</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="max-w-28 truncate text-sm text-muted">{user?.name}</span>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          className="cursor-pointer rounded-lg p-2 text-muted transition-colors hover:bg-wash hover:text-ink"
        >
          <LogOut className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </header>
  );
}
