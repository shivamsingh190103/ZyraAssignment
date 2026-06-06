import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app.js";

describe("action center API", () => {
  it("returns derived action center data and request IDs", async () => {
    const response = await request(app).get("/api/students/stu_001/action-center").expect(200);

    expect(response.headers["x-request-id"]).toBeTruthy();
    expect(response.body.student.id).toBe("stu_001");
    expect(response.body.summary).toMatchObject({
      totalTasks: 5,
      urgentTasks: 2,
      unreadMessages: 2,
      urgencyLevel: "high",
    });
  });

  it("updates a task status", async () => {
    const response = await request(app).patch("/api/tasks/tsk_004/status").send({ status: "in_progress" }).expect(200);

    expect(response.body.task).toMatchObject({
      id: "tsk_004",
      status: "in_progress",
    });
  });

  it("rejects invalid task statuses with a request-scoped error", async () => {
    const response = await request(app).patch("/api/tasks/tsk_004/status").send({ status: "paused" }).expect(400);

    expect(response.body.error.message).toContain("status must be one of");
    expect(response.body.error.requestId).toBeTruthy();
  });
});
