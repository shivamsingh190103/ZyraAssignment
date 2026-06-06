import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";

const actionCenter = {
  student: {
    id: "stu_001",
    name: "Maya Patel",
    email: "maya.patel@school.edu",
    grade: 11,
    gpa: 3.2,
    counselorId: "csl_001",
    enrollmentStatus: "at_risk",
  },
  tasks: [
    {
      id: "tsk_001",
      studentId: "stu_001",
      title: "Submit FAFSA application",
      description: "Deadline is approaching. Student has not started the form.",
      status: "todo",
      priority: "urgent",
      dueDate: "2026-06-05",
      createdAt: "2026-05-13T14:00:00Z",
      updatedAt: "2026-05-13T14:00:00Z",
    },
  ],
  messages: [
    {
      id: "msg_001",
      studentId: "stu_001",
      from: "Mrs. Thompson (Math)",
      subject: "Maya missing assignments",
      preview: "Maya has not submitted the last three homework sets...",
      read: false,
      receivedAt: "2026-05-30T08:30:00Z",
    },
  ],
  summary: {
    totalTasks: 1,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 1,
    urgentTasks: 1,
    unreadMessages: 1,
    overdueTasks: 0,
    nextDueDate: "2026-06-05",
    urgencyLevel: "high",
    urgencyReasons: ["1 urgent active task", "student is marked at risk"],
  },
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("App", () => {
  it("renders action center data and updates task status", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(actionCenter), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ task: { ...actionCenter.tasks[0], status: "completed" } }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ...actionCenter,
            tasks: [{ ...actionCenter.tasks[0], status: "completed" }],
            summary: { ...actionCenter.summary, completedTasks: 1, todoTasks: 0 },
          }),
          { status: 200 },
        ),
      );

    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    expect(await screen.findByText("Maya Patel")).toBeInTheDocument();
    expect(screen.getByText("Submit FAFSA application")).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText("Update Submit FAFSA application status"), "completed");

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/tasks/tsk_001/status", expect.objectContaining({ method: "PATCH" }));
    });
  });

  it("shows an error state when the API fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { message: "Student not found" } }), { status: 404 })));

    render(<App />);

    expect(await screen.findByText("Something needs attention")).toBeInTheDocument();
    expect(screen.getByText("Student not found")).toBeInTheDocument();
  });
});

