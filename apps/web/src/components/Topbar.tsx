import { Bell, CircleHelp, Menu, Search, X } from "lucide-react";
import type { ActionCenterPayload } from "../types";
import type { WorkspaceView } from "./Sidebar";

interface TopbarProps {
  centers: ActionCenterPayload[];
  onMenuOpen: () => void;
  onNavigate: (view: WorkspaceView) => void;
  onSelectStudent: (studentId: string) => void;
  query: string;
  setQuery: (query: string) => void;
}

export function Topbar({ centers, onMenuOpen, onNavigate, onSelectStudent, query, setQuery }: TopbarProps) {
  const normalized = query.trim().toLowerCase();
  const studentResults = normalized
    ? centers.filter(({ student }) => `${student.name} ${student.email} ${student.id}`.toLowerCase().includes(normalized))
    : [];
  const taskResults = normalized
    ? centers.flatMap((center) => center.tasks.map((task) => ({ task, student: center.student }))).filter(({ task }) => `${task.title} ${task.description}`.toLowerCase().includes(normalized)).slice(0, 4)
    : [];
  const messageResults = normalized
    ? centers.flatMap((center) => center.messages.map((message) => ({ message, student: center.student }))).filter(({ message }) => `${message.from} ${message.subject} ${message.preview}`.toLowerCase().includes(normalized)).slice(0, 4)
    : [];
  const totalResults = studentResults.length + taskResults.length + messageResults.length;

  function chooseStudent(studentId: string) {
    onSelectStudent(studentId);
    onNavigate("action-center");
    setQuery("");
  }

  return (
    <header className="topbar">
      <button className="mobile-menu-button" type="button" onClick={onMenuOpen} aria-label="Open navigation">
        <Menu size={20} />
      </button>
      <div className="search-wrap">
        <label className="search-box">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search students, tasks, messages..."
            aria-label="Search students, tasks, messages"
          />
          {query ? (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
              <X size={16} />
            </button>
          ) : null}
        </label>
        {normalized ? (
          <div className="search-results" role="dialog" aria-label="Search results">
            <div className="search-results-head">
              <strong>{totalResults} results</strong>
              <span>Search across your caseload</span>
            </div>
            {studentResults.map(({ student }) => (
              <button type="button" key={student.id} onClick={() => chooseStudent(student.id)}>
                <img src={`/avatars/${student.id}.svg`} alt="" />
                <span><strong>{student.name}</strong><small>Student · {student.email}</small></span>
              </button>
            ))}
            {taskResults.map(({ task, student }) => (
              <button type="button" key={task.id} onClick={() => { onNavigate("tasks"); setQuery(""); }}>
                <span className="search-result-icon">T</span>
                <span><strong>{task.title}</strong><small>Task · {student.name}</small></span>
              </button>
            ))}
            {messageResults.map(({ message, student }) => (
              <button type="button" key={message.id} onClick={() => { onSelectStudent(student.id); onNavigate("messages"); setQuery(""); }}>
                <span className="search-result-icon">M</span>
                <span><strong>{message.subject}</strong><small>Message · {message.from}</small></span>
              </button>
            ))}
            {!totalResults ? <p className="empty-search">No matching students, tasks, or messages.</p> : null}
          </div>
        ) : null}
      </div>
      <div className="topbar-actions">
        <details className="topbar-menu">
          <summary className="icon-button has-dot" aria-label="Notifications"><Bell size={18} /></summary>
          <div className="popover">
            <strong>Notifications</strong>
            <p>{centers.reduce((total, center) => total + center.summary.unreadMessages, 0)} unread messages need review.</p>
            <button type="button" onClick={() => onNavigate("messages")}>Open inbox</button>
          </div>
        </details>
        <details className="topbar-menu">
          <summary className="icon-button" aria-label="Help"><CircleHelp size={18} /></summary>
          <div className="popover">
            <strong>Action Center help</strong>
            <p>Use urgency, deadlines, and unread messages to decide who needs attention first.</p>
          </div>
        </details>
        <button className="profile-chip" type="button" onClick={() => onNavigate("settings")}>
          <img src="/avatars/elena.svg" alt="Elena Rodriguez" />
          <div><strong>Elena Rodriguez</strong><span>School Counselor</span></div>
        </button>
      </div>
    </header>
  );
}

