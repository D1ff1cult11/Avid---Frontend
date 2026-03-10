import express from "express";
import requestRoutes from "./routes/requestRoutes";

const app = express();

app.use(express.json());
app.use(requestRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled application error:", err);
  res.status(500).json({ error: true, message: "Internal server error" });
});

export default app;