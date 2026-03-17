# Voting Server (VS)

A clean layered Node.js + TypeScript + Express + PostgreSQL implementation of a Voting Server for distributed electronic voting.

## Features

- Single endpoint: `POST /request`
- Envelope validation middleware
- Nonce replay protection (`Map<evmPublicKey, lastNonce>` in memory)
- Request authentication middleware (placeholder signature verifier)
- Eligibility checks
- Atomic vote submission (transactional)
- Mask storage
- Cryptographically signed responses (ECDSA via Node `crypto`)
- Structured errors and basic logging

## Project Structure

```text
src
 |-- app.ts
 |-- server.ts
 |-- config
 |   |-- db.ts
 |-- controllers
 |   |-- requestController.ts
 |-- middleware
 |   |-- validateEnvelopeMiddleware.ts
 |   |-- nonceMiddleware.ts
 |   |-- authMiddleware.ts
 |-- services
 |   |-- voteService.ts
 |   |-- maskService.ts
 |   |-- voterService.ts
 |-- crypto
 |   |-- signResponse.ts
 |   |-- verifyEvmSignature.ts
 |-- repositories
 |   |-- voterRepository.ts
 |   |-- payloadRepository.ts
 |-- routes
 |   |-- requestRoutes.ts
 |-- types
 |   |-- evmRequest.ts
 |   |-- payloadTypes.ts
 |-- utils
     |-- nonceStore.ts
```

## Prerequisites

- Node.js 18+
- PostgreSQL

## Environment Variables

Use `.env` (example included in `.env.example`):

```env
PORT=3000
DATABASE_URL=postgres://...
VS_PUBLIC_KEY=...
VS_PRIVATE_KEY=...
SERVER_ID=vs1
```

## Database Setup

Run `schema.sql` on your PostgreSQL database.

## Install and Run

```bash
npm install
npm run dev
```

Build and run production:

```bash
npm run build
npm start
```

## API

### `POST /request`

Request body:

```json
{
  "publicKeyEvm": "string",
  "metadata": {},
  "requestPayload": {
    "type": "ELIGIBILITY_CHECK",
    "voterId": "voter-1"
  },
  "nonce": 1,
  "signature": "base64-signature"
}
```

Supported payload types:

- `ELIGIBILITY_CHECK`
- `VOTE`
- `MASK`

Responses are wrapped and signed by VS:

```json
{
  "publicKeyVs": "...",
  "metadata": {
    "timestamp": "...",
    "server_id": "vs1",
    "request_nonce": 1
  },
  "responsePayload": {},
  "signature": "base64-signature"
}
```

## Notes

- Vote/mask data is treated as opaque raw strings.
- No vote encryption, mask verification, or certificate/ledger logic is implemented.
- `verifyEvmSignature()` intentionally contains placeholder logic per requirement.