# Distributed Voting Ledger Service

Public bulletin-board style ledger for vote-server membership events across multiple elections.

## Stack

- Node.js
- TypeScript
- Express
- SQLite (`sqlite3`)

## Features

- Append-only event log (`JOIN`, `LEAVE`, `REVOKE`)
- Materialized server state cache per election
- EC certificate verification for Vote Servers
- Vote Server and EC signature verification using ECDSA + SHA256
- Open public read APIs (`GET`)
- Layered modular architecture with repository abstraction

## Project Structure

```text
src/
  config/
  crypto/
  db/
  repositories/
  services/
  controllers/
  routes/
  models/
  types/
  middlewares/
  utils/
  app.ts
  server.ts
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Update `EC_PUBLIC_KEY_PEM` in `.env`.

4. Run in development:

```bash
npm run dev
```

5. Build and run production:

```bash
npm run build
npm start
```

## Environment Variables

- `EC_PUBLIC_KEY_PEM`: PEM-encoded EC public key for Election Commissioner
- `PORT`: service port (default `3000`)
- `SQLITE_DB_PATH`: sqlite database file path (default `./ledger.db`)

## API Documentation

Full endpoint documentation (request/response schemas, validation rules, status codes, and errors):

- [`docs/API.md`](docs/API.md)

## API Endpoints

### Writes

- `POST /elections`
- `POST /join`
- `POST /leave`
- `POST /revoke`

### Public Reads

- `GET /elections`
- `GET /elections/:id`
- `GET /elections/:id/servers`
- `GET /servers/:serverId`
- `GET /ledger`
- `GET /ledger?electionId=<id>`
- `GET /ledger?fromId=<n>`
- `GET /ledger/:logId`

## Signature Payload Conventions

The service verifies signatures over canonical JSON strings:

- `JOIN`:
  `{"action":"JOIN","electionId":"...","serverId":"...","vsPublicKey":"...","timestamp":"..."}`
- `LEAVE`:
  `{"action":"LEAVE","electionId":"...","serverId":"...","timestamp":"..."}`
- `REVOKE`:
  `{"action":"REVOKE","electionId":"...","serverId":"...","timestamp":"...","reason":null|"..."}`

EC certificate signature is verified over raw `vsPublicKey` PEM string.

## Example cURL Commands

Create election:

```bash
curl -X POST http://localhost:3000/elections \
  -H "Content-Type: application/json" \
  -d '{
    "electionId": "election-2026-01",
    "startTime": "2026-03-11T10:00:00Z",
    "endTime": null
  }'
```

Join election:

```bash
curl -X POST http://localhost:3000/join \
  -H "Content-Type: application/json" \
  -d '{
    "electionId": "election-2026-01",
    "serverId": "vs-1",
    "certificate": {
      "vsPublicKey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
      "signatureByEC": "<base64-ec-signature-over-vsPublicKey>"
    },
    "timestamp": "2026-03-11T10:05:00Z",
    "signatureByVS": "<base64-vs-signature-over-canonical-join-payload>"
  }'
```

Leave election:

```bash
curl -X POST http://localhost:3000/leave \
  -H "Content-Type: application/json" \
  -d '{
    "electionId": "election-2026-01",
    "serverId": "vs-1",
    "timestamp": "2026-03-11T10:15:00Z",
    "signatureByVS": "<base64-vs-signature-over-canonical-leave-payload>"
  }'
```

Revoke server:

```bash
curl -X POST http://localhost:3000/revoke \
  -H "Content-Type: application/json" \
  -d '{
    "electionId": "election-2026-01",
    "serverId": "vs-1",
    "timestamp": "2026-03-11T10:20:00Z",
    "reason": "manual revocation",
    "signatureByEC": "<base64-ec-signature-over-canonical-revoke-payload>"
  }'
```

Read full ledger:

```bash
curl http://localhost:3000/ledger
```

Read filtered ledger:

```bash
curl "http://localhost:3000/ledger?electionId=election-2026-01"
curl "http://localhost:3000/ledger?fromId=5"
```
