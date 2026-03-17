# API Documentation

This service exposes a public, append-only membership ledger for distributed voting elections.

## Base URL

- Local default: `http://localhost:3000`

## Content Type

- Request body: `application/json`
- Response body: `application/json`

## Response Format

Successful responses use:

```json
{
  "data": {}
}
```

Error responses use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": null
  }
}
```

`details` is optional for some errors.

## Common Error Codes

- `VALIDATION_ERROR` (`400`): invalid body/query/path values
- `INVALID_JSON` (`400`): malformed JSON request body
- `UNAUTHORIZED` (`401`): invalid cryptographic signature
- `FORBIDDEN` (`403`): operation is not allowed in current state
- `NOT_FOUND` (`404`): missing route/resource
- `CONFLICT` (`409`): state conflict (duplicate election, invalid status transition)
- `INTERNAL_SERVER_ERROR` (`500`): unexpected server error

## Data Models

### Election

```json
{
  "electionId": "election-2026-01",
  "startTime": "2026-03-11T10:00:00Z",
  "endTime": null,
  "createdAt": "2026-03-11T10:00:01.123Z"
}
```

### VoteServer

```json
{
  "serverId": "vs-1",
  "electionId": "election-2026-01",
  "vsPublicKey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
  "status": "ACTIVE",
  "joinedAt": "2026-03-11T10:05:00Z",
  "leftAt": null,
  "revokedAt": null
}
```

`status` enum: `AUTHORIZED | ACTIVE | LEFT | REVOKED`

### LedgerEvent

```json
{
  "id": 1,
  "electionId": "election-2026-01",
  "eventType": "JOIN",
  "serverId": "vs-1",
  "vsPublicKey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
  "timestamp": "2026-03-11T10:05:00Z",
  "payload": {}
}
```

`eventType` enum: `JOIN | LEAVE | REVOKE`

## Endpoints

### `GET /health`

Health check.

Success (`200`):

```json
{
  "status": "ok",
  "timestamp": "2026-03-11T10:00:00.000Z"
}
```

### `POST /elections`

Create an election.

Body:

```json
{
  "electionId": "election-2026-01",
  "startTime": "2026-03-11T10:00:00Z",
  "endTime": null
}
```

Rules:

- `electionId` must be a non-empty string.
- `startTime` must be a valid date-time string.
- `endTime` is optional/null; if set, must be a valid date-time string.
- If `endTime` is provided, it must be greater than or equal to `startTime`.

Success (`201`): `data` is an `Election`.

Common errors:

- `400 VALIDATION_ERROR`
- `409 CONFLICT` when `electionId` already exists

### `GET /elections`

List elections ordered by `createdAt` ascending.

Success (`200`): `data` is `Election[]`.

### `GET /elections/:id`

Fetch one election by `electionId`.

Success (`200`): `data` is an `Election`.

Common errors:

- `404 NOT_FOUND` when election does not exist

### `GET /elections/:id/servers`

List all server membership records for one election, ordered by `serverId` ascending.

Success (`200`): `data` is `VoteServer[]`.

Common errors:

- `404 NOT_FOUND` when election does not exist

### `POST /join`

Register or re-activate a Vote Server in an election and append a `JOIN` ledger event.

Body:

```json
{
  "electionId": "election-2026-01",
  "serverId": "vs-1",
  "certificate": {
    "vsPublicKey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
    "signatureByEC": "<base64-signature-over-vsPublicKey>"
  },
  "timestamp": "2026-03-11T10:05:00Z",
  "signatureByVS": "<base64-signature-over-canonical-join-payload>"
}
```

Rules:

- Election must exist.
- `certificate.signatureByEC` must verify against `EC_PUBLIC_KEY_PEM` over raw `vsPublicKey`.
- `signatureByVS` must verify against `vsPublicKey` over canonical payload:

```json
{"action":"JOIN","electionId":"...","serverId":"...","vsPublicKey":"...","timestamp":"..."}
```

State constraints:

- If current status is `ACTIVE`, request fails (`409 CONFLICT`).
- If current status is `REVOKED`, request fails (`403 FORBIDDEN`).

Success (`200`): `data` is updated `VoteServer`.

Common errors:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED` for bad certificate or join signature
- `403 FORBIDDEN`
- `404 NOT_FOUND` when election does not exist
- `409 CONFLICT`

### `POST /leave`

Mark an `ACTIVE` server as `LEFT` and append a `LEAVE` ledger event.

Body:

```json
{
  "electionId": "election-2026-01",
  "serverId": "vs-1",
  "timestamp": "2026-03-11T10:15:00Z",
  "signatureByVS": "<base64-signature-over-canonical-leave-payload>"
}
```

Rules:

- Election and membership record must exist.
- Current status must be `ACTIVE`.
- `signatureByVS` must verify against current stored `vsPublicKey` over:

```json
{"action":"LEAVE","electionId":"...","serverId":"...","timestamp":"..."}
```

Success (`200`): `data` is updated `VoteServer`.

Common errors:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED` for bad leave signature
- `404 NOT_FOUND`
- `409 CONFLICT` when status is not `ACTIVE`

### `POST /revoke`

Force revoke a server and append a `REVOKE` ledger event.

Body:

```json
{
  "electionId": "election-2026-01",
  "serverId": "vs-1",
  "timestamp": "2026-03-11T10:20:00Z",
  "reason": "manual revocation",
  "signatureByEC": "<base64-signature-over-canonical-revoke-payload>"
}
```

Rules:

- Election and membership record must exist.
- Current status must not already be `REVOKED`.
- `signatureByEC` must verify against `EC_PUBLIC_KEY_PEM` over:

```json
{"action":"REVOKE","electionId":"...","serverId":"...","timestamp":"...","reason":null|"..."}
```

Success (`200`): `data` is updated `VoteServer`.

Common errors:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED` for bad EC signature
- `404 NOT_FOUND`
- `409 CONFLICT` when already revoked

### `GET /servers/:serverId`

List all election membership records for one server, ordered by `electionId` ascending.

Success (`200`): `data` is `VoteServer[]`.

### `GET /ledger`

List ledger events ordered by `id` ascending.

Query params:

- `electionId` (optional, string): filter by election id
- `fromId` (optional, positive integer): include events with `id >= fromId`

Examples:

- `GET /ledger`
- `GET /ledger?electionId=election-2026-01`
- `GET /ledger?fromId=5`
- `GET /ledger?electionId=election-2026-01&fromId=5`

Success (`200`): `data` is `LedgerEvent[]`.

Common errors:

- `400 VALIDATION_ERROR` for invalid query param values or repeated query keys

### `GET /ledger/:logId`

Fetch one ledger event by numeric log id.

Path params:

- `logId` must be a positive integer.

Success (`200`): `data` is `LedgerEvent`.

Common errors:

- `400 VALIDATION_ERROR`
- `404 NOT_FOUND` when log id does not exist

## Ledger Payload Shapes

`LedgerEvent.payload` varies by event type:

- `JOIN`

```json
{
  "certificate": {
    "vsPublicKey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
    "signatureByEC": "<base64>"
  },
  "timestamp": "2026-03-11T10:05:00Z",
  "signatureByVS": "<base64>"
}
```

- `LEAVE`

```json
{
  "timestamp": "2026-03-11T10:15:00Z",
  "signatureByVS": "<base64>"
}
```

- `REVOKE`

```json
{
  "timestamp": "2026-03-11T10:20:00Z",
  "reason": "manual revocation",
  "signatureByEC": "<base64>"
}
```
