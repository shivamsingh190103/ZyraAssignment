import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  Mail,
  MessageSquare,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { formatDate, formatMessageTime, formatPriority, formatStatus } from "../lib/format";
import type { ActionCenterPayload, Message, Task, TaskStatus } from "../types";

interface ViewProps {
  centers: ActionCenterPayload[];
  pendingTaskId: string | null;
  onSelectStudent: (studentId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

function PageHeading({ title, description }: { title: string; description: string }) {
  return <div className="page-heading"><div><h1>{title}</h1><p>{description}</p></div></div>;
}

export function StudentsView({ centers, onSelectStudent }: ViewProps) {
  const [filter, setFilter] = useState("");
  const visible = centers.filter(({ student }) => `${student.name} ${student.email} ${student.id}`.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div className="workspace-page">
      <PageHeading title="Students" description="Review your caseload and open a student's action center." />
      <label className="inline-search"><Search size={17} /><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Search by name, email, or student ID" /></label>
      <section className="student-list">
        {visible.map(({ student, summary }) => (
          <button className="student-list-item" type="button" key={student.id} onClick={() => onSelectStudent(student.id)}>
            <img src={`/avatars/${student.id}.svg`} alt="" />
            <span className="student-list-main"><strong>{student.name}</strong><small>Grade {student.grade} · GPA {student.gpa} · {student.email}</small></span>
            <span className={`badge enrollment-${student.enrollmentStatus}`}>{student.enrollmentStatus === "at_risk" ? "At Risk" : "Active"}</span>
            <span className="student-signal"><AlertCircle size={15} />{summary.urgentTasks} urgent</span>
            <span className="student-signal"><Mail size={15} />{summary.unreadMessages} unread</span>
            <ChevronRight size={18} />
          </button>
        ))}
        {!visible.length ? <EmptyState title="No students found" text="Try a different name, email, or student ID." /> : null}
      </section>
    </div>
  );
}

export function TasksView({ centers, pendingTaskId, onStatusChange }: ViewProps) {
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const rows = centers.flatMap((center) => center.tasks.map((task) => ({ task, student: center.student })))
    .filter(({ task, student }) => `${task.title} ${task.description} ${student.name}`.toLowerCase().includes(filter.toLowerCase()))
    .filter(({ task }) => statusFilter === "all" || task.status === statusFilter)
    .sort((a, b) => a.task.dueDate.localeCompare(b.task.dueDate));
  return (
    <div className="workspace-page">
      <PageHeading title="Tasks" description="Manage and update tasks across all students." />
      <div className="toolbar">
        <label className="inline-search"><Search size={17} /><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Search tasks or students" /></label>
        <select aria-label="Filter tasks by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | TaskStatus)}>
          <option value="all">All statuses</option><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="completed">Completed</option>
        </select>
      </div>
      <section className="data-panel">
        <div className="responsive-table tasks-all-table">
          <div className="data-row data-head"><span>Task</span><span>Student</span><span>Priority</span><span>Due</span><span>Status</span></div>
          {rows.map(({ task, student }) => <AllTaskRow key={task.id} task={task} studentName={student.name} pending={pendingTaskId === task.id} onStatusChange={onStatusChange} />)}
        </div>
      </section>
    </div>
  );
}

function AllTaskRow({ task, studentName, pending, onStatusChange }: { task: Task; studentName: string; pending: boolean; onStatusChange: (taskId: string, status: TaskStatus) => void }) {
  return (
    <div className="data-row">
      <span className="row-primary"><strong>{task.title}</strong><small>{task.description}</small></span>
      <span data-label="Student">{studentName}</span>
      <span data-label="Priority"><span className={`badge priority-${task.priority}`}>{formatPriority(task.priority)}</span></span>
      <span data-label="Due"><strong>{formatDate(task.dueDate)}</strong></span>
      <span data-label="Status"><select disabled={pending} aria-label={`Update ${task.title} status`} value={task.status} onChange={(event) => onStatusChange(task.id, event.target.value as TaskStatus)}><option value="todo">{formatStatus("todo")}</option><option value="in_progress">{formatStatus("in_progress")}</option><option value="completed">{formatStatus("completed")}</option></select></span>
    </div>
  );
}

export function MessagesView({ centers }: ViewProps) {
  const allMessages = centers.flatMap((center) => center.messages.map((message) => ({ message, student: center.student }))).sort((a, b) => b.message.receivedAt.localeCompare(a.message.receivedAt));
  const [selectedId, setSelectedId] = useState(allMessages[0]?.message.id ?? "");
  const [draft, setDraft] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);
  const selected = allMessages.find(({ message }) => message.id === selectedId) ?? allMessages[0];
  return (
    <div className="workspace-page">
      <PageHeading title="Messages" description="Read and prioritize communication across your caseload." />
      <section className="inbox-layout">
        <div className="inbox-list">
          {allMessages.map(({ message, student }) => <MessageButton key={message.id} message={message} studentName={student.name} selected={message.id === selected?.message.id} onClick={() => setSelectedId(message.id)} />)}
        </div>
        <article className="message-detail">
          {selected ? <><div className="message-detail-head"><div><span>{selected.student.name}</span><h2>{selected.message.subject}</h2><p>From {selected.message.from} · {formatMessageTime(selected.message.receivedAt)}</p></div><span className={selected.message.read ? "badge enrollment-active" : "badge enrollment-at_risk"}>{selected.message.read ? "Read" : "Unread"}</span></div><p>{selected.message.preview.replace("...", ".")}</p><p>This message is connected to {selected.student.name}'s counselor record. Review their action center before responding.</p><textarea aria-label="Reply draft" placeholder="Write a reply..." value={draft} onChange={(event) => { setDraft(event.target.value); setDraftSaved(false); }} /><button className="primary-button" type="button" onClick={() => setDraftSaved(true)}>Save reply draft</button>{draftSaved ? <p className="saved-note"><CheckCircle2 size={16} /> Draft saved in this session</p> : null}</> : null}
        </article>
      </section>
    </div>
  );
}

function MessageButton({ message, studentName, selected, onClick }: { message: Message; studentName: string; selected: boolean; onClick: () => void }) {
  return <button className={selected ? "inbox-item selected" : "inbox-item"} type="button" onClick={onClick}><span className="message-icon"><MessageSquare size={17} /></span><span><strong>{message.from}</strong><small>{message.subject}</small><em>{studentName} · {formatMessageTime(message.receivedAt)}</em></span>{!message.read ? <i /> : null}</button>;
}

export function CalendarView({ centers }: ViewProps) {
  const tasks = centers.flatMap((center) => center.tasks.map((task) => ({ task, student: center.student }))).sort((a, b) => a.task.dueDate.localeCompare(b.task.dueDate));
  const [month, setMonth] = useState<6 | 7>(6);
  const daysInMonth = month === 6 ? 30 : 31;
  const monthLabel = month === 6 ? "June 2026" : "July 2026";
  return (
    <div className="workspace-page">
      <PageHeading title="Calendar" description="Upcoming task deadlines for June and July 2026." />
      <section className="calendar-layout">
        <div className="calendar-panel">
          <div className="calendar-head"><button type="button" disabled={month === 6} onClick={() => setMonth(6)}>Previous</button><h2>{monthLabel}</h2><button type="button" disabled={month === 7} onClick={() => setMonth(7)}>Next</button></div>
          <div className="calendar-grid">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day) => <strong key={day}>{day}</strong>)}{Array.from({ length: 35 }, (_, index) => { const day = index + 1; const dayTasks = tasks.filter(({ task }) => task.dueDate === `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`); return <div className="calendar-day" key={day}><span>{day <= daysInMonth ? day : ""}</span>{dayTasks.map(({ task }) => <small className={`calendar-task priority-${task.priority}`} key={task.id}>{task.title}</small>)}</div>; })}</div>
        </div>
        <aside className="agenda-panel"><h2>Upcoming deadlines</h2>{tasks.filter(({ task }) => task.status !== "completed").map(({ task, student }) => <article key={task.id}><span className={`priority-dot priority-${task.priority}`} /><div><strong>{task.title}</strong><small>{student.name} · {formatDate(task.dueDate)}</small></div></article>)}</aside>
      </section>
    </div>
  );
}

export function ReportsView({ centers }: ViewProps) {
  const totals = useMemo(() => ({ students: centers.length, tasks: centers.reduce((n, c) => n + c.summary.totalTasks, 0), urgent: centers.reduce((n, c) => n + c.summary.urgentTasks, 0), unread: centers.reduce((n, c) => n + c.summary.unreadMessages, 0) }), [centers]);
  const [exported, setExported] = useState(false);
  return (
    <div className="workspace-page">
      <PageHeading title="Reports" description="Caseload health and intervention signals." />
      <section className="report-metrics"><Metric icon={Users} value={totals.students} label="Students" /><Metric icon={CheckSquare} value={totals.tasks} label="Total tasks" /><Metric icon={AlertCircle} value={totals.urgent} label="Urgent tasks" /><Metric icon={Mail} value={totals.unread} label="Unread messages" /></section>
      <section className="report-grid"><article className="data-panel report-panel"><h2>Caseload risk</h2>{centers.map(({ student, summary }) => <div className="risk-row" key={student.id}><span><strong>{student.name}</strong><small>{summary.urgencyReasons.slice(0, 2).join(" · ")}</small></span><div className="progress-track"><i style={{ width: `${Math.min(100, 25 + summary.urgentTasks * 25 + summary.overdueTasks * 20)}%` }} /></div><b>{summary.urgencyLevel}</b></div>)}</article><article className="data-panel report-panel"><h2>Recommended focus</h2><ol className="focus-list"><li>Resolve overdue attendance and recovery tasks.</li><li>Respond to unread student and parent messages.</li><li>Review active high-priority interventions.</li></ol><button className="secondary-button" type="button" onClick={() => setExported(true)}><Download size={16} /> Export summary</button>{exported ? <p className="saved-note"><CheckCircle2 size={16} /> Summary prepared for export</p> : null}</article></section>
    </div>
  );
}

function Metric({ icon: Icon, value, label }: { icon: typeof Users; value: number; label: string }) { return <article className="report-metric"><Icon size={20} /><strong>{value}</strong><span>{label}</span></article>; }

export function ResourcesView() {
  const resources = [{ icon: BookOpen, title: "FAFSA counselor toolkit", text: "Guidance for financial aid application support." }, { icon: ShieldCheck, title: "At-risk intervention guide", text: "A structured checklist for timely interventions." }, { icon: CalendarDays, title: "College planning calendar", text: "Key milestones for grades 10 through 12." }, { icon: MessageSquare, title: "Family outreach templates", text: "Reusable communication prompts and follow-ups." }];
  const [opened, setOpened] = useState<string | null>(null);
  return <div className="workspace-page"><PageHeading title="Resources" description="Practical counselor tools for common student needs." /><section className="resource-grid">{resources.map(({ icon: Icon, title, text }) => <button className="resource-card" type="button" key={title} onClick={() => setOpened(title)}><Icon size={24} /><span><strong>{title}</strong><small>{text}</small></span><ExternalLink size={17} /></button>)}</section>{opened ? <div className="resource-preview"><div><strong>{opened}</strong><p>This resource is ready to use in your next student conversation. It includes a short checklist, recommended follow-up, and documentation prompts.</p></div><button type="button" onClick={() => setOpened(null)}>Close preview</button></div> : null}</div>;
}

export function SettingsView() {
  const [email, setEmail] = useState(true); const [urgent, setUrgent] = useState(true); const [digest, setDigest] = useState(false); const [saved, setSaved] = useState(false);
  return <div className="workspace-page"><PageHeading title="Counselor settings" description="Manage your profile and action-center preferences." /><section className="settings-grid"><article className="data-panel profile-settings"><img src="/avatars/elena.svg" alt="Elena Rodriguez" /><div><h2>Elena Rodriguez</h2><p>School Counselor · Counselor ID csl_001</p><span className="badge enrollment-active">Active caseload</span></div></article><article className="data-panel preference-panel"><h2>Notifications</h2><Toggle label="Email notifications" checked={email} setChecked={setEmail} /><Toggle label="Urgent task alerts" checked={urgent} setChecked={setUrgent} /><Toggle label="Weekly caseload digest" checked={digest} setChecked={setDigest} /><button className="primary-button" type="button" onClick={() => setSaved(true)}>Save preferences</button>{saved ? <p className="saved-note"><CheckCircle2 size={16} /> Preferences saved</p> : null}</article></section></div>;
}

function Toggle({ label, checked, setChecked }: { label: string; checked: boolean; setChecked: (value: boolean) => void }) { return <label className="toggle-row"><span>{label}</span><input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} /><i /></label>; }
function EmptyState({ title, text }: { title: string; text: string }) { return <div className="empty-state"><Clock3 size={24} /><strong>{title}</strong><span>{text}</span></div>; }
