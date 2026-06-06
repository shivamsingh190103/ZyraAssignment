import { Loader2 } from "lucide-react";
import { formatDate, formatPriority, formatStatus } from "../lib/format";
import type { Task, TaskStatus } from "../types";

interface TaskListProps {
  tasks: Task[];
  pendingTaskId: string | null;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export function TaskList({ tasks, pendingTaskId, onStatusChange }: TaskListProps) {
  return (
    <section className="task-panel">
      <div className="panel-header">
        <div>
          <h2>Tasks</h2>
          <p>{tasks.length} priorities ordered by due date</p>
        </div>
      </div>
      <div className="task-table" role="table" aria-label="Task list">
        <div className="table-row table-head" role="row">
          <span role="columnheader">Task</span>
          <span role="columnheader">Priority</span>
          <span role="columnheader">Due Date</span>
          <span role="columnheader">Status</span>
        </div>
        {tasks.map((task) => (
          <div className="table-row" role="row" key={task.id}>
            <div className="task-title" role="cell">
              <strong>{task.title}</strong>
              <span>{task.description}</span>
            </div>
            <div role="cell">
              <span className={`badge priority-${task.priority}`}>{formatPriority(task.priority)}</span>
            </div>
            <div className="due-cell" role="cell">
              <strong>{formatDate(task.dueDate)}</strong>
              {task.status !== "completed" && new Date(`${task.dueDate}T00:00:00Z`) < new Date("2026-06-01T00:00:00Z") ? (
                <span>Overdue</span>
              ) : null}
            </div>
            <div className="status-cell" role="cell">
              {pendingTaskId === task.id ? <Loader2 className="spin" size={17} aria-label="Saving" /> : null}
              <select
                aria-label={`Update ${task.title} status`}
                value={task.status}
                disabled={pendingTaskId === task.id}
                onChange={(event) => onStatusChange(task.id, event.target.value as TaskStatus)}
              >
                <option value="todo">{formatStatus("todo")}</option>
                <option value="in_progress">{formatStatus("in_progress")}</option>
                <option value="completed">{formatStatus("completed")}</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

