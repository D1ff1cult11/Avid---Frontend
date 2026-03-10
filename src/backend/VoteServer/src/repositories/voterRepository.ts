import { PoolClient } from "pg";
import { pool } from "../config/db";
import { Candidate } from "../types/payloadTypes";

interface VoterRow {
  voter_id: string;
  has_voted: boolean;
}

export async function findVoterById(voterId: string): Promise<VoterRow | null> {
  const query = `SELECT voter_id, has_voted FROM voters WHERE voter_id = $1`;
  const result = await pool.query<VoterRow>(query, [voterId]);
  return result.rows[0] ?? null;
}

export async function listCandidates(): Promise<Candidate[]> {
  const query = `SELECT id, name, metadata FROM candidates ORDER BY id ASC`;
  const result = await pool.query<Candidate>(query);
  return result.rows;
}

export async function markVoterAsVoted(client: PoolClient, voterId: string): Promise<void> {
  const query = `UPDATE voters SET has_voted = TRUE WHERE voter_id = $1`;
  await client.query(query, [voterId]);
}