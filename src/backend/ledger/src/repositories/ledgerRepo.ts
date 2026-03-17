import { AppendLedgerEvent, LedgerEvent, LedgerEventType, LedgerQuery } from "../models/ledgerEvent";
import { SQLiteClient } from "../db/sqlite";

interface LedgerRow {
  id: number;
  electionId: string;
  eventType: LedgerEventType;
  serverId: string;
  vsPublicKey: string | null;
  timestamp: string;
  payload: string;
}

export class LedgerRepository {
  constructor(private readonly db: SQLiteClient) {}

  async append(event: AppendLedgerEvent): Promise<LedgerEvent> {
    const result = await this.db.run(
      `
      INSERT INTO ledger_log (election_id, event_type, server_id, vs_public_key, timestamp, payload)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        event.electionId,
        event.eventType,
        event.serverId,
        event.vsPublicKey,
        event.timestamp,
        JSON.stringify(event.payload)
      ]
    );

    const inserted = await this.findById(result.lastID);
    if (!inserted) {
      throw new Error("Ledger append failed");
    }

    return inserted;
  }

  async findById(logId: number): Promise<LedgerEvent | null> {
    const row = await this.db.get<LedgerRow>(
      `
      SELECT
        id,
        election_id AS electionId,
        event_type AS eventType,
        server_id AS serverId,
        vs_public_key AS vsPublicKey,
        timestamp,
        payload
      FROM ledger_log
      WHERE id = ?
      `,
      [logId]
    );

    return row ? this.mapRow(row) : null;
  }

  async list(query: LedgerQuery): Promise<LedgerEvent[]> {
    const where: string[] = [];
    const params: unknown[] = [];

    if (query.electionId) {
      where.push("election_id = ?");
      params.push(query.electionId);
    }

    if (typeof query.fromId === "number") {
      where.push("id >= ?");
      params.push(query.fromId);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
    const rows = await this.db.all<LedgerRow>(
      `
      SELECT
        id,
        election_id AS electionId,
        event_type AS eventType,
        server_id AS serverId,
        vs_public_key AS vsPublicKey,
        timestamp,
        payload
      FROM ledger_log
      ${whereClause}
      ORDER BY id ASC
      `,
      params
    );

    return rows.map((row) => this.mapRow(row));
  }

  private mapRow(row: LedgerRow): LedgerEvent {
    let parsedPayload: Record<string, unknown> = {};
    try {
      parsedPayload = JSON.parse(row.payload) as Record<string, unknown>;
    } catch {
      parsedPayload = { raw: row.payload };
    }

    return {
      id: row.id,
      electionId: row.electionId,
      eventType: row.eventType,
      serverId: row.serverId,
      vsPublicKey: row.vsPublicKey,
      timestamp: row.timestamp,
      payload: parsedPayload
    };
  }
}
