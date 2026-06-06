import { Router } from "express";
import { getActionCenter, updateTaskStatus } from "../services/actionCenterService.js";

const router = Router();

router.get("/students/:id/action-center", (req, res) => {
  res.json(getActionCenter(req.params.id));
});

router.patch("/tasks/:taskId/status", (req, res) => {
  res.json({ task: updateTaskStatus(req.params.taskId, req.body.status) });
});

export default router;
