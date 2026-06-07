import { ArrowLeft, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { RightRail } from "./components/RightRail";
import { Sidebar, type WorkspaceView } from "./components/Sidebar";
import { StudentHero } from "./components/StudentHero";
import { SummaryCards } from "./components/SummaryCards";
import { TaskList } from "./components/TaskList";
import { Topbar } from "./components/Topbar";
import { CalendarView, MessagesView, ReportsView, ResourcesView, SettingsView, StudentsView, TasksView } from "./components/WorkspaceViews";
import { fetchActionCenter, updateTaskStatus } from "./lib/api";
import type { ActionCenterPayload, TaskStatus } from "./types";

const STUDENT_IDS = ["stu_001", "stu_002", "stu_003"];

function App() {
  const [centers, setCenters] = useState<ActionCenterPayload[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState(STUDENT_IDS[0]);
  const [activeView, setActiveView] = useState<WorkspaceView>("action-center");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const actionCenter = centers.find(({ student }) => student.id === selectedStudentId) ?? centers[0] ?? null;

  async function loadWorkspace() {
    setIsLoading(true);
    setError(null);
    try {
      setCenters(await Promise.all(STUDENT_IDS.map(fetchActionCenter)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load the counselor workspace.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void loadWorkspace(); }, []);

  function selectStudent(studentId: string) {
    setSelectedStudentId(studentId);
    setActiveView("action-center");
  }

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    setPendingTaskId(taskId);
    setError(null);
    try {
      await updateTaskStatus(taskId, status);
      setCenters(await Promise.all(STUDENT_IDS.map(fetchActionCenter)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update the task status.");
    } finally {
      setPendingTaskId(null);
    }
  }

  function renderView() {
    const viewProps = { centers, pendingTaskId, onSelectStudent: selectStudent, onStatusChange: handleStatusChange };
    if (activeView === "students") return <StudentsView {...viewProps} />;
    if (activeView === "tasks") return <TasksView {...viewProps} />;
    if (activeView === "messages") return <MessagesView {...viewProps} />;
    if (activeView === "calendar") return <CalendarView {...viewProps} />;
    if (activeView === "reports") return <ReportsView {...viewProps} />;
    if (activeView === "resources") return <ResourcesView />;
    if (activeView === "settings") return <SettingsView />;
    if (!actionCenter) return null;
    return (
      <>
        <div className="content-heading">
          <button className="back-button" type="button" onClick={() => setActiveView("students")}><ArrowLeft size={17} />Back to students</button>
          <div><h1>Action Center</h1><p>Quick overview of student priorities, tasks, and communication.</p></div>
          <button className="refresh-button" onClick={loadWorkspace} type="button"><RefreshCcw size={16} />Refresh</button>
        </div>
        <div className="dashboard-grid">
          <div className="dashboard-main">
            <StudentHero actionCenter={actionCenter} />
            <SummaryCards summary={actionCenter.summary} />
            {error ? <div className="inline-error" role="alert">{error}</div> : null}
            <TaskList tasks={actionCenter.tasks} pendingTaskId={pendingTaskId} onStatusChange={handleStatusChange} />
          </div>
          <RightRail actionCenter={actionCenter} onViewMessages={() => setActiveView("messages")} onViewTasks={() => setActiveView("tasks")} />
        </div>
      </>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={setActiveView} />
      <div className="main-shell">
        <Topbar centers={centers} onMenuOpen={() => setSidebarOpen(true)} onNavigate={setActiveView} onSelectStudent={setSelectedStudentId} query={query} setQuery={setQuery} />
        <main className="content">
          {isLoading ? <section className="state-panel" aria-live="polite"><div className="loading-bar" /><strong>Loading counselor workspace...</strong><span>Pulling profiles, priorities, tasks, and unread messages.</span></section>
            : error && !centers.length ? <section className="state-panel error-state" role="alert"><strong>Something needs attention</strong><span>{error}</span><button onClick={loadWorkspace} type="button">Try again</button></section>
              : renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
