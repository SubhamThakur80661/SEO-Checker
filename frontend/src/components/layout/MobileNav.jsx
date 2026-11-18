import { NavLink } from "react-router-dom";
import { LayoutDashboard, SearchCheck, KeyRound, History } from "lucide-react";

const NAV = [
  { to: "/", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/audit", label: "Audit", icon: SearchCheck },
  { to: "/keywords", label: "Keywords", icon: KeyRound },
  { to: "/history", label: "History", icon: History },
];

/** Bottom tab bar, mobile only (4 items, within the ≤5 guideline). */
export default function MobileNav() {
  return (
    <nav
      className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface md:hidden"
      aria-label="Main"
    >
      <div className="grid grid-cols-4">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted hover:text-ink"
              }`
            }
          >
            <Icon className="h-5 w-5" aria-hidden />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
