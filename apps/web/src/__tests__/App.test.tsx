import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";

const mayaCenter = {
  student: { id: "stu_001", name: "Maya Patel", email: "maya.patel@school.edu", grade: 11, gpa: 3.2, counselorId: "csl_001", enrollmentStatus: "at_risk" },
  tasks: [{ id: "tsk_001", studentId: "stu_001", title: "Submit FAFSA application", description: "Deadline is approaching.", status: "todo", priority: "urgent", dueDate: "2026-06-05", createdAt: "2026-05-13T14:00:00Z", updatedAt: "2026-05-13T14:00:00Z" }],
  messages: [{ id: "msg_001", studentId: "stu_001", from: "Mrs. Thompson (Math)", subject: "Maya missing assignments", preview: "Maya has not submitted the last three homework sets...", read: false, receivedAt: "2026-05-30T08:30:00Z" }],
  summary: { totalTasks: 1, completedTasks: 0, inProgressTasks: 0, todoTasks: 1, urgentTasks: 1, unreadMessages: 1, overdueTasks: 0, nextDueDate: "2026-06-05", urgencyLevel: "high", urgencyReasons: ["1 urgent active task", "student is marked at risk"] },
};

const jordanCenter = {
  ...mayaCenter,
  student: { ...mayaCenter.student, id: "stu_002", name: "Jordan Lee", email: "jordan.lee@school.edu", grade: 12, gpa: 3.8, enrollmentStatus: "active" },
  tasks: [{ ...mayaCenter.tasks[0], id: "tsk_006", studentId: "stu_002", title: "Finalise Common App essay", priority: "high" }],
  messages: [{ ...mayaCenter.messages[0], id: "msg_004", studentId: "stu_002", from: "Jordan Lee", subject: "Essay draft attached" }],
  summary: { ...mayaCenter.summary, urgencyLevel: "medium" },
};

const carlosCenter = {
  ...mayaCenter,
  student: { ...mayaCenter.student, id: "stu_003", name: "Carlos Rivera", email: "carlos.rivera@school.edu", grade: 10, gpa: 2.4 },
  tasks: [{ ...mayaCenter.tasks[0], id: "tsk_010", studentId: "stu_003", title: "Credit recovery: English 10" }],
  messages: [{ ...mayaCenter.messages[0], id: "msg_006", studentId: "stu_003", from: "Parent - Maria Rivera", subject: "Concerns about Carlos" }],
};

const centers = [mayaCenter, jordanCenter, carlosCenter];

function installSuccessfulFetch() {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (init?.method === "PATCH") return new Response(JSON.stringify({ task: { ...mayaCenter.tasks[0], status: "completed" } }), { status: 200 });
    const center = centers.find(({ student }) => url.includes(student.id)) ?? mayaCenter;
    return new Response(JSON.stringify(center), { status: 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("App", () => {
  it("renders action center data and updates task status", async () => {
    const fetchMock = installSuccessfulFetch();
    render(<App />);
    expect(await screen.findByRole("heading", { name: "Maya Patel" })).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText("Update Submit FAFSA application status"), "completed");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/tasks/tsk_001/status", expect.objectContaining({ method: "PATCH" })));
  });

  it("navigates through the counselor workspace", async () => {
    installSuccessfulFetch();
    render(<App />);
    await screen.findByRole("heading", { name: "Maya Patel" });
    await userEvent.click(screen.getByRole("button", { name: "Students" }));
    expect(screen.getByRole("heading", { name: "Students" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Jordan Lee/ }));
    expect(await screen.findByRole("heading", { name: "Jordan Lee" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Messages" }));
    expect(screen.getByRole("heading", { name: "Messages" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Calendar" }));
    expect(screen.getByRole("heading", { name: "Calendar" })).toBeInTheDocument();
  });

  it("searches across students and opens a result", async () => {
    installSuccessfulFetch();
    render(<App />);
    await screen.findByRole("heading", { name: "Maya Patel" });
    await userEvent.type(screen.getByLabelText("Search students, tasks, messages"), "Carlos");
    expect(screen.getByText("2 results")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Carlos Rivera Student/ }));
    expect(await screen.findByRole("heading", { name: "Carlos Rivera" })).toBeInTheDocument();
  });

  it("shows an error state when the API fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => new Response(JSON.stringify({ error: { message: "Student not found" } }), { status: 404 })));
    render(<App />);
    expect(await screen.findByText("Something needs attention")).toBeInTheDocument();
    expect(screen.getByText("Student not found")).toBeInTheDocument();
  });
});
