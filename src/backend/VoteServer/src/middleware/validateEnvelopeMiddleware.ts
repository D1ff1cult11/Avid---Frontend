import { NextFunction, Request, Response } from "express";
import { EvmRequest } from "../types/evmRequest";

export function validateEnvelopeMiddleware(req: Request, res: Response, next: NextFunction): void {
  const body = req.body as Partial<EvmRequest>;

  if (!body || typeof body !== "object") {
    res.status(400).json({ error: true, message: "Invalid request body" });
    return;
  }

  if (!body.publicKeyEvm || typeof body.publicKeyEvm !== "string") {
    res.status(400).json({ error: true, message: "publicKeyEvm is required" });
    return;
  }

  if (!body.metadata || typeof body.metadata !== "object") {
    res.status(400).json({ error: true, message: "metadata is required" });
    return;
  }

  if (!body.requestPayload || typeof body.requestPayload !== "object") {
    res.status(400).json({ error: true, message: "requestPayload is required" });
    return;
  }

  if (typeof body.nonce !== "number") {
    res.status(400).json({ error: true, message: "nonce must be a number" });
    return;
  }

  if (!body.signature || typeof body.signature !== "string") {
    res.status(400).json({ error: true, message: "signature is required" });
    return;
  }

  next();
}