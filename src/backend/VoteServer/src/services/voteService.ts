import { pool } from "../config/db";
import { insertVote } from "../repositories/payloadRepository";
import { markVoterAsVoted } from "../repositories/voterRepository";

interface VoterStatusRow {
  has_voted: boolean;
}

export async function submitVote(voterId: string, voteData: string): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const voterResult = await client.query<VoterStatusRow>(
      "SELECT has_voted FROM voters WHERE voter_id = $1 FOR UPDATE",
      [voterId]
    );

    if (voterResult.rowCount === 0) {
      throw new Error("Voter does not exist");
    }

    const voter = voterResult.rows[0];
    if (voter.has_voted) {
      throw new Error("Voter has already voted");
    }

    await insertVote(client, voterId, voteData);
    await markVoterAsVoted(client, voterId);

    await client.query("COMMIT");
    console.log(`Vote submitted for voter: ${voterId}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}