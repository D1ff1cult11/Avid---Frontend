import express, { Request, Response } from 'express';
import cors from 'cors';
import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL || `http://localhost:${PORT}/stub`;

app.use(cors());
app.use(express.json());

let db: Database<sqlite3.Database, sqlite3.Statement>;

async function initDB() {
  db = await open({
    filename: path.join(__dirname, 'vote_servers.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS vote_servers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      election_id TEXT NOT NULL,
      server_url TEXT NOT NULL,
      UNIQUE(election_id, server_url)
    )
  `);
  console.log('SQLite database initialized.');
}

// Stub endpoint simulating the external web API
app.get('/stub', (req: Request, res: Response) => {
  const electionId = req.query.electionId || 'default';
  
  // Return some dummy vote servers
  const dummyServers = [
    "http://localhost:9001",
    "http://localhost:9002",
    "http://localhost:9003"
  ];
  
  res.json({
    electionId,
    voteServers: dummyServers
  });
});

// Endpoint called by EVMClient frontend
app.get('/api/vote-servers/:electionId', async (req: Request, res: Response) => {
  const { electionId } = req.params;

  try {
    const existingServers = await db.all(
      'SELECT server_url FROM vote_servers WHERE election_id = ?',
      [electionId]
    ) as { server_url: string }[];

    if (existingServers.length > 0) {
      console.log(`Returning ${existingServers.length} servers from SQLite for election ${electionId}`);
      res.json({
        electionId,
        voteServers: existingServers.map(row => row.server_url)
      });
      return;
    }

    console.log(`Fetching from external API for election ${electionId} at ${EXTERNAL_API_URL}`);
    
    const fetchUrl = `${EXTERNAL_API_URL}?electionId=${electionId}`;
    const response = await fetch(fetchUrl);
    
    if (!response.ok) {
      throw new Error(`External API responded with status ${response.status}`);
    }

    const data = await (response.json() as Promise<{ voteServers?: string[] }>);
    const serversToStore = data.voteServers || [];

    for (const url of serversToStore) {
      try {
        await db.run(
          'INSERT INTO vote_servers (election_id, server_url) VALUES (?, ?)',
          [electionId, url]
        );
      } catch (err: any) {
        if (!err.message.includes('UNIQUE constraint failed')) {
          console.error('Error inserting into DB:', err);
        }
      }
    }

    console.log(`Stored ${serversToStore.length} servers into SQLite for election ${electionId}`);
    
    res.json({
      electionId,
      voteServers: serversToStore
    });
  } catch (error) {
    console.error('Error in /api/vote-servers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start Server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`EVMClient Backend running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
