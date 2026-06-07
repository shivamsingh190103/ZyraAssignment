import type { ActionCenterPayload, TaskStatus } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function parseResponse<T>(response: Response): Promise<T> {
  const rawBody = await response.text();
  let payload: any = null;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? `Request failed with status ${response.status}`);
  }

  if (!payload) throw new Error("The server returned an invalid response.");
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
