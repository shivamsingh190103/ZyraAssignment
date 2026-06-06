import { messages, students, tasks } from "../data/zyra-mock-data.js";
import { ApiError } from "../errors.js";
import type { ActionCenterPayload, TaskStatus } from "../types.js";

const TODAY = new Date("2026-06-01T00:00:00Z");
const validStatuses: TaskStatus[] = ["todo", "in_progress", "completed"];

export function getActionCenter(studentId: string): ActionCenterPayload {
  const student = students.find((item) => item.id === studentId);

  if (!student) {
    throw new ApiError(404, `Student ${studentId} was not found.`);
  }

  const studentTasks = tasks
    .filter((task) => task.studentId === student.id)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const studentMessages = messages
    .filter((message) => message.studentId === student.id)
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());

  const activeTasks = studentTasks.filter((task) => task.status !== "completed");
  const urgentTasks = activeTasks.filter((task) => task.priority === "urgent").length;
  const overdueTasks = activeTasks.filter((task) => new Date(`${task.dueDate}T00:00:00Z`) < TODAY).length;
  const unreadMessages = studentMessages.filter((message) => !message.read).length;
  const completedTasks = studentTasks.filter((task) => task.status === "completed").length;
  const inProgressTasks = studentTasks.filter((task) => task.status === "in_progress").length;
  const todoTasks = studentTasks.filter((task) => task.status === "todo").length;
  const nextDueTask = activeTasks.find(Boolean);

  const urgencyReasons: string[] = [];
  if (urgentTasks > 0) urgencyReasons.push(`${urgentTasks} urgent active task${urgentTasks === 1 ? "" : "s"}`);
  if (overdueTasks > 0) urgencyReasons.push(`${overdueTasks} overdue task${overdueTasks === 1 ? "" : "s"}`);
  if (unreadMessages > 1) urgencyReasons.push(`${unreadMessages} unread messages`);
  if (student.enrollmentStatus === "at_risk") urgencyReasons.push("student is marked at risk");

  const urgencyLevel =
    urgentTasks >= 2 || overdueTasks > 0 || student.enrollmentStatus === "at_risk"
      ? "high"
      : urgentTasks === 1 || unreadMessages > 0 || inProgressTasks > 1
        ? "medium"
        : "low";

  return {
    student,
    tasks: studentTasks,
    messages: studentMessages,
    summary: {
      totalTasks: studentTasks.length,
      completedTasks,
      inProgressTasks,
      todoTasks,
      urgentTasks,
      unreadMessages,
      overdueTasks,
      nextDueDate: nextDueTask?.dueDate ?? null,
      urgencyLevel,
      urgencyReasons: urgencyReasons.length ? urgencyReasons : ["no immediate blockers"],
    },
  };
}

export function updateTaskStatus(taskId: string, status: unknown) {
  if (typeof status !== "string" || !validStatuses.includes(status as TaskStatus)) {
    throw new ApiError(400, "status must be one of: todo, in_progress, completed.");
  }

  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    throw new ApiError(404, `Task ${taskId} was not found.`);
  }

  task.status = status as TaskStatus;
  task.updatedAt = new Date().toISOString();

  return task;
}
