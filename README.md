# AVID Secure Voting Frontend (EVM Client)

A Preact + Vite + TypeScript frontend that implements the Electronic Voting Machine (EVM) client UI for the AVID distributed voting flow.

The app collects a voter ID and ballot choice, then performs:
- one-hot vote encoding
- random vote masking
- payload encryption
- key-share generation
- deterministic server selection (`2f + 1`)
- parallel submission to distributed voting servers
- receipt hash generation (`sha256`)

## Tech Stack

- Preact
- Vite
- TypeScript
- `tweetnacl` for symmetric encryption primitives
- `js-sha256` for hashing

## Project Structure

All frontend code is under `src/frontend/`:

```text
src/frontend/
├── main.tsx
├── App.tsx
├── styles/
├── config/
├── types/
├── utils/
├── services/
├── hooks/
├── components/
└── pages/
```

## Quick Start

## Prerequisites

- Node.js 20+ (recommended)
- npm

## Install

```bash
npm install
```

## Run (development)

```bash
npm run dev
```

Default local URL: `http://localhost:5173`

## Build

```bash
npm run build
```

## Preview production build

```bash
npm run preview
```

## AVID Client Flow (Implemented)

Submission pipeline in `src/frontend/services/votingApi.ts`:

1. Encode selected candidate into one-hot vector (`encodeVote`)
2. Generate random vector (`generateRandomVector`)
3. Mask vote (`maskVote = vote + random`)
4. Generate symmetric key (`generateSymmetricKey`)
5. Encrypt payload (`encryptPayload`)
6. Split key into shares (`splitKeyShares`)
7. Deterministically select `2f+1` servers (`selectVotingServers`)
8. Send `(payload, keyShare, voterId, electionId)` to each server in parallel
9. Compute receipt hash: `0x${sha256(encryptedPayload)}`

The UI marks submission successful when at least one selected server responds with HTTP success.

## Election Metadata

Hardcoded election config:

- File: `src/frontend/config/election.ts`
- Election ID: `2026`
- Election Name: `National General Election`
- Position: `President`
- Candidates: `Candidate A`, `Candidate B`, `Candidate C`

## Voting Server Targets

Default server pool in `src/frontend/utils/serverSelection.ts`:

- `http://localhost:9001`
- `http://localhost:9002`
- `http://localhost:9003`
- `http://localhost:9004`
- `http://localhost:9005`
- `http://localhost:9006`
- `http://localhost:9007`

Selected endpoint per server:

- `POST /vote`

Request body sent by client:

```json
{
  "payload": "<encrypted-base64>",
  "keyShare": "<base64-share>",
  "voterId": "<voter-id>",
  "electionId": "2026"
}
```

## UI Summary

- Election header
- Voter ID input (required)
- Candidate cards (single selection/radio semantics)
- Submit button (disabled until valid input)
- Success receipt with `0x...` hash
- Secure terminal cues:
  - `SECURE EVM TERMINAL`
  - `✓ Cryptographic masking enabled`
  - `✓ Distributed vote submission active`

## Notes

- This is a frontend protocol prototype and not a complete production-grade election system.
- Key-share logic is lightweight for demo behavior and should be replaced with audited threshold cryptography for production.
- Ensure backend voting servers allow CORS from the frontend origin during local development.
