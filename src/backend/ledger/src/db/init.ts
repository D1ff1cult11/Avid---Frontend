import { SQLiteClient } from "./sqlite";

export async function initializeDatabase(db: SQLiteClient): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS elections (
      election_id TEXT PRIMARY KEY,
      start_time TEXT NOT NULL,
      end_time TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ledger_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      election_id TEXT NOT NULL,
      event_type TEXT NOT NULL CHECK (event_type IN ('JOIN', 'LEAVE', 'REVOKE')),
      server_id TEXT NOT NULL,
      vs_public_key TEXT,
      timestamp TEXT NOT NULL,
      payload TEXT NOT NULL,
      FOREIGN KEY (election_id) REFERENCES elections (election_id)
    );

    CREATE INDEX IF NOT EXISTS idx_ledger_log_election_id ON ledger_log (election_id);
    CREATE INDEX IF NOT EXISTS idx_ledger_log_server_id ON ledger_log (server_id);

    CREATE TABLE IF NOT EXISTS vote_servers (
      server_id TEXT NOT NULL,
      election_id TEXT NOT NULL,
      vs_public_key TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('AUTHORIZED', 'ACTIVE', 'LEFT', 'REVOKED')),
      joined_at TEXT,
      left_at TEXT,
      revoked_at TEXT,
      PRIMARY KEY (server_id, election_id),
      FOREIGN KEY (election_id) REFERENCES elections (election_id)
    );

    CREATE INDEX IF NOT EXISTS idx_vote_servers_election_id ON vote_servers (election_id);
    CREATE INDEX IF NOT EXISTS idx_vote_servers_server_id ON vote_servers (server_id);
  `);
}
