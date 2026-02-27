import { Search, Bell, Plus } from "lucide-react";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/pipeline": "Pipeline",
  "/contacts": "Contacts",
  "/calendar": "Calendar",
  "/outreach": "Outreach",
  "/reports": "Reports",
  "/workspace": "Workspace",
  "/settings": "Settings",
};

export default function AppHeader() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Dashboard";

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>

      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contacts, deals, companies..."
            className="w-full h-10 pl-10 pr-4 bg-accent border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-accent rounded-lg transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full text-[10px] font-bold text-primary-foreground flex items-center justify-center">
            3
          </span>
        </button>

        <button className="flex items-center gap-2 h-9 px-3 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" />
          Add Contact
        </button>

        <span className="text-sm text-muted-foreground">
          {format(new Date(), "MMM d, yyyy")}
        </span>
      </div>
    </header>
  );
}
