import { BarChart3, BookOpen, CalendarDays, CheckSquare, Home, MessageSquare, Settings, Users } from "lucide-react";

const items = [
  { icon: Home, label: "Action Center", active: true },
  { icon: Users, label: "Students" },
  { icon: CheckSquare, label: "Tasks" },
  { icon: MessageSquare, label: "Messages" },
  { icon: CalendarDays, label: "Calendar" },
  { icon: BarChart3, label: "Reports" },
  { icon: BookOpen, label: "Resources" },
  { icon: Settings, label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="brand">
        <img src="/zyra-mark.svg" alt="" />
        <span>Zyra</span>
      </div>
      <nav className="nav-list">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button className={item.active ? "nav-item active" : "nav-item"} key={item.label} type="button">
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="counselor-card">
        <img src="/avatars/elena.svg" alt="Elena Rodriguez" />
        <div>
          <strong>Counselor</strong>
          <span>csl_001</span>
        </div>
      </div>
    </aside>
  );
}

