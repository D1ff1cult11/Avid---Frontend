import { PoolClient } from "pg";
import { pool } from "../config/db";

export async function insertVote(
  client: PoolClient,
  voterId: string,
  voteData: string
): Promise<void> {
  const query = `
    INSERT INTO payloads (type, voter_id, vote_data)
    VALUES ('vote', $1, $2)
  `;
  await client.query(query, [voterId, voteData]);
}

export async function insertMask(maskData: string): Promise<void> {
  const query = `
    INSERT INTO payloads (type, mask_data)
    VALUES ('mask', $1)
  `;
  await pool.query(query, [maskData]);
}