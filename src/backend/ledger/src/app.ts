import express, { Express, Request, Response } from "express";
import { logger } from "./config/logger";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { Controllers, createApiRouter } from "./routes";

export function createApp(controllers: Controllers): Express {
  const app = express();

  app.use(express.json({ limit: "1mb" }));
  app.use((req: Request, _res: Response, next) => {
    logger.info("Incoming request", {
      method: req.method,
      path: req.path
    });
    next();
  });

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/", createApiRouter(controllers));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
