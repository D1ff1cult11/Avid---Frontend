import { NextFunction, Request, Response } from "express";
import { verifyEvmSignature } from "../crypto/verifyEvmSignature";
import { EvmRequest } from "../types/evmRequest";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const body = req.body as EvmRequest;

  const isValid = verifyEvmSignature();
  if (!isValid) {
    console.log("Rejected request due to invalid signature");
    res.status(401).json({ error: true, message: "Invalid request signature" });
    return;
  }

  if (!body.publicKeyEvm || !body.signature) {
    console.log("Rejected request due to missing auth fields");
    res.status(400).json({ error: true, message: "Missing authentication fields" });
    return;
  }

  next();
}