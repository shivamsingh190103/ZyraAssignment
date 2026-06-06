import cors from "cors";
import express from "express";
import actionCenterRoutes from "./routes/actionCenterRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestContext } from "./middleware/requestContext.js";
import { requestLogger } from "./middleware/requestLogger.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestContext);
app.use(requestLogger);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", actionCenterRoutes);
app.use(errorHandler);

export default app;
