import { Election } from "../models/election";
import { SQLiteClient } from "../db/sqlite";

interface ElectionRow {
  electionId: string;
  startTime: string;
  endTime: string | null;
  createdAt: string;
}

export class ElectionRepository {
  constructor(private readonly db: SQLiteClient) {}

  async create(input: {
    electionId: string;
    startTime: string;
    endTime: string | null;
    createdAt: string;
  }): Promise<Election> {
    await this.db.run(
      `
      INSERT INTO elections (election_id, start_time, end_time, created_at)
      VALUES (?, ?, ?, ?)
      `,
      [input.electionId, input.startTime, input.endTime, input.createdAt]
    );

    const election = await this.findById(input.electionId);
    if (!election) {
      throw new Error("Election insertion failed");
    }

    return election;
  }

  async findById(electionId: string): Promise<Election | null> {
    const row = await this.db.get<ElectionRow>(
      `
      SELECT
        election_id AS electionId,
        start_time AS startTime,
        end_time AS endTime,
        created_at AS createdAt
      FROM elections
      WHERE election_id = ?
      `,
      [electionId]
    );

    return row ?? null;
  }

  async listAll(): Promise<Election[]> {
    return this.db.all<ElectionRow>(
      `
      SELECT
        election_id AS electionId,
        start_time AS startTime,
        end_time AS endTime,
        created_at AS createdAt
      FROM elections
      ORDER BY created_at ASC
      `
    );
  }
}
