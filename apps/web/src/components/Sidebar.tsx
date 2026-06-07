import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckSquare,
  Home,
  MessageSquare,
  Settings,
  UserRound,
  Users,
  X,
} from "lucide-react";

export type WorkspaceView = "action-center" | "students" | "tasks" | "messages" | "calendar" | "reports" | "resources" | "settings";

const items: Array<{ icon: typeof Home; label: string; view: WorkspaceView }> = [
  { icon: Home, label: "Action Center", view: "action-center" },
  { icon: Users, label: "Students", view: "students" },
  { icon: CheckSquare, label: "Tasks", view: "tasks" },
  { icon: MessageSquare, label: "Messages", view: "messages" },
  { icon: CalendarDays, label: "Calendar", view: "calendar" },
  { icon: BarChart3, label: "Reports", view: "reports" },
  { icon: BookOpen, label: "Resources", view: "resources" },
  { icon: Settings, label: "Settings", view: "settings" },
];

interface SidebarProps {
  activeView: WorkspaceView;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: WorkspaceView) => void;
}

export function Sidebar({ activeView, isOpen, onClose, onNavigate }: SidebarProps) {
  function navigate(view: WorkspaceView) {
    onNavigate(view);
    onClose();
  }

  return (
    <>
      <button className={isOpen ? "sidebar-scrim visible" : "sidebar-scrim"} type="button" onClick={onClose} aria-label="Close navigation" />
      <aside className={isOpen ? "sidebar open" : "sidebar"} aria-label="Main navigation">
        <div className="brand">
          <img src="/zyra-mark.svg" alt="" />
          <span>Zyra</span>
          <button className="sidebar-close" type="button" onClick={onClose} aria-label="Close navigation">
            <X size={20} />
          </button>
        </div>
        <nav className="nav-list">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={activeView === item.view ? "nav-item active" : "nav-item"}
                key={item.view}
                type="button"
                onClick={() => navigate(item.view)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <button className="counselor-card" type="button" onClick={() => navigate("settings")}>
          <img src="/avatars/elena.svg" alt="Elena Rodriguez" />
          <div>
            <strong>Elena Rodriguez</strong>
            <span>School Counselor</span>
          </div>
          <UserRound size={16} />
        </button>
      </aside>
    </>
  );
}

