import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { LedgerService } from "../services/ledgerService";
import {
  ensureString,
  parsePositiveInteger,
  readQueryParam
} from "../utils/validation";

export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  listLedger = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as Record<string, unknown>;
    const electionId = readQueryParam(query, "electionId");
    const fromIdRaw = readQueryParam(query, "fromId");
    const fromId = fromIdRaw ? parsePositiveInteger(fromIdRaw, "fromId") : undefined;

    const logs = await this.ledgerService.list({
      electionId,
      fromId
    });

    res.status(200).json({ data: logs });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const logId = parsePositiveInteger(ensureString(req.params.logId, "logId"), "logId");
    const logEntry = await this.ledgerService.getByIdOrThrow(logId);
    res.status(200).json({ data: logEntry });
  });
}
