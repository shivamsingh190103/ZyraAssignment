import type { ActionCenterPayload, TaskStatus } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "Request failed");
  }

  return payload as T;
}

export async function fetchActionCenter(studentId: string) {
  const response = await fetch(`${API_BASE}/api/students/${studentId}/action-center`);
  return parseResponse<ActionCenterPayload>(response);
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const response = await fetch(`${API_BASE}/api/tasks/${taskId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  return parseResponse<{ task: ActionCenterPayload["tasks"][number] }>(response);
}

