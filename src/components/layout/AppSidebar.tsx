import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Filter,
  Users,
  CalendarDays,
  MessageSquare,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutGrid },
  { title: "Pipeline", path: "/pipeline", icon: Filter },
  { title: "Contacts", path: "/contacts", icon: Users },
  { title: "Calendar", path: "/calendar", icon: CalendarDays },
  { title: "Outreach", path: "/outreach", icon: MessageSquare },
  { title: "Reports", path: "/reports", icon: BarChart3 },
  { title: "Settings", path: "/settings", icon: Settings },
];

export default function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-sidebar flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">
          Rabix Technologies
        </h1>
        <span className="text-xs text-sidebar-muted uppercase tracking-widest">
          CRM
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground border-l-[3px] border-sidebar-primary"
                  : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50 border-l-[3px] border-transparent"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-sidebar-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-xs font-bold text-sidebar-primary-foreground">
          AH
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-sidebar-foreground truncate">
            Ammaz Hussain
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-xs text-sidebar-muted">Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
