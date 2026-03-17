import { AppendLedgerEvent, LedgerEvent, LedgerQuery } from "../models/ledgerEvent";
import { LedgerRepository } from "../repositories/ledgerRepo";
import { NotFoundError } from "../errors/AppError";

export class LedgerService {
  constructor(private readonly ledgerRepo: LedgerRepository) {}

  async append(event: AppendLedgerEvent): Promise<LedgerEvent> {
    // This service intentionally exposes append-only behavior.
    return this.ledgerRepo.append(event);
  }

  async getByIdOrThrow(logId: number): Promise<LedgerEvent> {
    const event = await this.ledgerRepo.findById(logId);
    if (!event) {
      throw new NotFoundError("Ledger entry not found", { logId });
    }

    return event;
  }

  async list(query: LedgerQuery): Promise<LedgerEvent[]> {
    return this.ledgerRepo.list(query);
  }
}
