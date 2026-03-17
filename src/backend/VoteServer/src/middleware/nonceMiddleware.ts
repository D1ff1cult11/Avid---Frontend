import { NextFunction, Request, Response } from "express";
import { EvmRequest } from "../types/evmRequest";
import { getLastNonce, setLastNonce } from "../utils/nonceStore";

export function nonceMiddleware(req: Request, res: Response, next: NextFunction): void {
  const body = req.body as EvmRequest;

  const evmKey = body?.publicKeyEvm;
  const incomingNonce = body?.nonce;

  if (!evmKey || typeof incomingNonce !== "number") {
    console.log("Rejected request due to invalid nonce envelope");
    res.status(400).json({ error: true, message: "Invalid nonce envelope" });
    return;
  }

  const lastNonce = getLastNonce(evmKey);

  if (typeof lastNonce === "number" && incomingNonce <= lastNonce) {
    console.log(`Rejected request due to replay nonce. incoming=${incomingNonce}, last=${lastNonce}`);
    res.status(409).json({ error: true, message: "Replay detected: nonce is not fresh" });
    return;
  }

  setLastNonce(evmKey, incomingNonce);
  next();
}