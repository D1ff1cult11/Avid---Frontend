import { SQLiteClient } from "../db/sqlite";
import { VoteServer, VoteServerStatus } from "../models/voteServer";

interface VoteServerRow {
  serverId: string;
  electionId: string;
  vsPublicKey: string;
  status: VoteServerStatus;
  joinedAt: string | null;
  leftAt: string | null;
  revokedAt: string | null;
}

export class ServerRepository {
  constructor(private readonly db: SQLiteClient) {}

  async findByServerAndElection(serverId: string, electionId: string): Promise<VoteServer | null> {
    const row = await this.db.get<VoteServerRow>(
      `
      SELECT
        server_id AS serverId,
        election_id AS electionId,
        vs_public_key AS vsPublicKey,
        status,
        joined_at AS joinedAt,
        left_at AS leftAt,
        revoked_at AS revokedAt
      FROM vote_servers
      WHERE server_id = ? AND election_id = ?
      `,
      [serverId, electionId]
    );

    return row ?? null;
  }

  async listByElection(electionId: string): Promise<VoteServer[]> {
    return this.db.all<VoteServerRow>(
      `
      SELECT
        server_id AS serverId,
        election_id AS electionId,
        vs_public_key AS vsPublicKey,
        status,
        joined_at AS joinedAt,
        left_at AS leftAt,
        revoked_at AS revokedAt
      FROM vote_servers
      WHERE election_id = ?
      ORDER BY server_id ASC
      `,
      [electionId]
    );
  }

  async listByServer(serverId: string): Promise<VoteServer[]> {
    return this.db.all<VoteServerRow>(
      `
      SELECT
        server_id AS serverId,
        election_id AS electionId,
        vs_public_key AS vsPublicKey,
        status,
        joined_at AS joinedAt,
        left_at AS leftAt,
        revoked_at AS revokedAt
      FROM vote_servers
      WHERE server_id = ?
      ORDER BY election_id ASC
      `,
      [serverId]
    );
  }

  async upsertOnJoin(input: {
    serverId: string;
    electionId: string;
    vsPublicKey: string;
    joinedAt: string;
  }): Promise<void> {
    await this.db.run(
      `
      INSERT INTO vote_servers
        (server_id, election_id, vs_public_key, status, joined_at, left_at, revoked_at)
      VALUES (?, ?, ?, ?, ?, NULL, NULL)
      ON CONFLICT(server_id, election_id)
      DO UPDATE SET
        vs_public_key = excluded.vs_public_key,
        status = ?,
        joined_at = excluded.joined_at,
        left_at = NULL,
        revoked_at = NULL
      `,
      [
        input.serverId,
        input.electionId,
        input.vsPublicKey,
        VoteServerStatus.ACTIVE,
        input.joinedAt,
        VoteServerStatus.ACTIVE
      ]
    );
  }

  async markLeft(serverId: string, electionId: string, leftAt: string): Promise<void> {
    await this.db.run(
      `
      UPDATE vote_servers
      SET status = ?, left_at = ?
      WHERE server_id = ? AND election_id = ?
      `,
      [VoteServerStatus.LEFT, leftAt, serverId, electionId]
    );
  }

  async markRevoked(serverId: string, electionId: string, revokedAt: string): Promise<void> {
    await this.db.run(
      `
      UPDATE vote_servers
      SET status = ?, revoked_at = ?
      WHERE server_id = ? AND election_id = ?
      `,
      [VoteServerStatus.REVOKED, revokedAt, serverId, electionId]
    );
  }
}
