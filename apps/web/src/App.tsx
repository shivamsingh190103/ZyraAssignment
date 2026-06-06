import { ArrowLeft, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { RightRail } from "./components/RightRail";
import { Sidebar } from "./components/Sidebar";
import { StudentHero } from "./components/StudentHero";
import { SummaryCards } from "./components/SummaryCards";
import { TaskList } from "./components/TaskList";
import { Topbar } from "./components/Topbar";
import { fetchActionCenter, updateTaskStatus } from "./lib/api";
import type { ActionCenterPayload, TaskStatus } from "./types";

const DEFAULT_STUDENT_ID = "stu_001";

function App() {
  const [actionCenter, setActionCenter] = useState<ActionCenterPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);

  async function loadActionCenter() {
    setIsLoading(true);
    setError(null);

    try {
      setActionCenter(await fetchActionCenter(DEFAULT_STUDENT_ID));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load the action center.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadActionCenter();
  }, []);

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    if (!actionCenter) return;

    setPendingTaskId(taskId);
    setError(null);

    try {
      await updateTaskStatus(taskId, status);
      setActionCenter(await fetchActionCenter(DEFAULT_STUDENT_ID));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update the task status.");
    } finally {
      setPendingTaskId(null);
    }
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-shell">
        <Topbar />
        <main className="content">
          <div className="content-heading">
            <button className="back-button" type="button">
              <ArrowLeft size={17} />
              Back to students
            </button>
            <div>
              <h1>Action Center</h1>
              <p>Quick overview of student priorities, tasks, and communication.</p>
            </div>
            <button className="refresh-button" onClick={loadActionCenter} type="button">
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          {isLoading ? (
            <section className="state-panel" aria-live="polite">
              <div className="loading-bar" />
              <strong>Loading student action center...</strong>
              <span>Pulling profile, priorities, tasks, and unread messages.</span>
            </section>
          ) : error ? (
            <section className="state-panel error-state" role="alert">
              <strong>Something needs attention</strong>
              <span>{error}</span>
              <button onClick={loadActionCenter} type="button">Try again</button>
            </section>
          ) : actionCenter ? (
            <div className="dashboard-grid">
              <div className="dashboard-main">
                <StudentHero actionCenter={actionCenter} />
                <SummaryCards summary={actionCenter.summary} />
                {error ? <div className="inline-error" role="alert">{error}</div> : null}
                <TaskList tasks={actionCenter.tasks} pendingTaskId={pendingTaskId} onStatusChange={handleStatusChange} />
              </div>
              <RightRail actionCenter={actionCenter} />
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default App;

