import { Bell, CircleHelp, Search } from "lucide-react";

export function Topbar() {
  return (
    <header className="topbar">
      <label className="search-box">
        <Search size={17} />
        <input placeholder="Search students, tasks, messages..." aria-label="Search" />
      </label>
      <div className="topbar-actions">
        <button className="icon-button has-dot" type="button" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <button className="icon-button" type="button" aria-label="Help">
          <CircleHelp size={18} />
        </button>
        <div className="profile-chip">
          <img src="/avatars/elena.svg" alt="Elena Rodriguez" />
          <div>
            <strong>Elena Rodriguez</strong>
            <span>School Counselor</span>
          </div>
        </div>
      </div>
    </header>
  );
}

