import express from 'express';
import cors from 'cors';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL || `http://localhost:${PORT}/stub`;

app.use(cors());
app.use(express.json());

let db;

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
app.get('/stub', (req, res) => {
  const electionId = req.query.electionId || 'default';
  
  // Return some dummy vote servers
  const dummyServers = [
    "http://localhost:9001",
    "http://localhost:9002",
    "http://localhost:9003",
    "http://localhost:9004",
    "http://localhost:9005",
    "http://localhost:9006",
    "http://localhost:9007"
  ];
  
  res.json({
    electionId,
    voteServers: dummyServers
  });
});

// Endpoint called by EVMClient frontend
app.get('/api/vote-servers/:electionId', async (req, res) => {
  const { electionId } = req.params;

  try {
    // 1. Check if we already have servers for this electionId in DB
    const existingServers = await db.all(
      'SELECT server_url FROM vote_servers WHERE election_id = ?',
      [electionId]
    );

    if (existingServers.length > 0) {
      console.log(`Returning ${existingServers.length} servers from SQLite for election ${electionId}`);
      return res.json({
        electionId,
        voteServers: existingServers.map(row => row.server_url)
      });
    }

    // 2. If not, fetch from external API (our stub)
    console.log(`Fetching from external API for election ${electionId} at ${EXTERNAL_API_URL}`);
    
    // Add electionId as query param if using GET
    const fetchUrl = `${EXTERNAL_API_URL}?electionId=${electionId}`;
    const response = await fetch(fetchUrl);
    
    if (!response.ok) {
      throw new Error(`External API responded with status ${response.status}`);
    }

    const data = await response.json();
    const serversToStore = data.voteServers || [];

    // 3. Store in SQLite database
    for (const url of serversToStore) {
      try {
        await db.run(
          'INSERT INTO vote_servers (election_id, server_url) VALUES (?, ?)',
          [electionId, url]
        );
      } catch (err) {
        // Ignore unique constraint errors if concurrent requests insert the same data
        if (!err.message.includes('UNIQUE constraint failed')) {
          console.error('Error inserting into DB:', err);
        }
      }
    }

    console.log(`Stored ${serversToStore.length} servers into SQLite for election ${electionId}`);
    
    // 4. Return to frontend
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
