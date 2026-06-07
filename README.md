# Zyra Counselor Student Action Center

A full-stack TypeScript mini feature for helping a school counselor quickly understand a student's profile, tasks, unread messages, and urgency level.

## Functional Workspace

The application goes beyond the required action-center screen and provides a complete, responsive counselor workflow:

- Global search across students, tasks, and messages
- Clickable student caseload with per-student action centers
- All-student task management with live status updates
- Selectable inbox with session-based reply drafts
- Deadline calendar, caseload reports, counselor resources, and settings
- Working notifications, help, profile, refresh, back-navigation, and view-all controls
- Mobile navigation drawer and responsive layouts with no page-level horizontal overflow

## Tech Stack

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express, TypeScript
- Tests: Vitest, Testing Library, Supertest
- Deployment-ready: Vercel static frontend with serverless Express API

## Run Locally

```bash
npm install
npm run dev
```

The API runs at `http://localhost:4000` and the web app runs at `http://localhost:5173`.

## Test and Build

```bash
npm test
npm run build
```

## API Contract

### `GET /api/students/:id/action-center`

Returns the student profile, sorted tasks, sorted messages, and derived summary data.

Example response fields:

```json
{
  "student": { "id": "stu_001", "name": "Maya Patel" },
  "tasks": [],
  "messages": [],
  "summary": {
    "totalTasks": 5,
    "completedTasks": 2,
    "inProgressTasks": 1,
    "todoTasks": 2,
    "urgentTasks": 2,
    "unreadMessages": 2,
    "overdueTasks": 1,
    "nextDueDate": "2026-06-01",
    "urgencyLevel": "high",
    "urgencyReasons": ["2 urgent active tasks"]
  }
}
```

### `PATCH /api/tasks/:taskId/status`

Updates a task status in memory.

Request body:

```json
{ "status": "in_progress" }
```

Allowed status values are `todo`, `in_progress`, and `completed`.

## Architecture Note

The project is split into two apps under `apps/`.

- `apps/api` owns the exact provided mock data, API routes, request logging, request ID middleware, error middleware, and action-center business logic.
- `apps/web` owns the Vite React UI, API client, formatting helpers, and focused component tests.
- `api/index.ts` adapts the same Express app for Vercel serverless deployment so local and deployed API behavior stay aligned.

The backend keeps the source arrays in memory because the assignment uses fixed mock data. Derived fields such as urgency level, unread count, overdue count, and next due date are computed in `actionCenterService` instead of being stored, which avoids duplicating state and keeps PATCH behavior predictable.

## Production Quality Decisions and Tradeoffs

- Request logging writes structured JSON with request ID, method, path, status, and duration so API behavior is traceable in local logs and hosted logs.
- Error responses include the request ID and avoid leaking stack traces to clients.
- Integration coverage verifies the main action-center endpoint, status mutation, and invalid-status error handling.
- Frontend coverage verifies successful rendering, status update calls, and API failure UI.
- The app uses in-memory mutation for task status because no database was requested. In production, the service layer is the place to swap in persistent storage and optimistic concurrency checks.
- The urgency model is intentionally simple and explainable: overdue tasks, urgent active tasks, unread messages, and at-risk enrollment drive counselor-facing priority.

## Test Output

Run:

```bash
npm test
```

Expected result: all backend integration tests and frontend workspace tests pass.
