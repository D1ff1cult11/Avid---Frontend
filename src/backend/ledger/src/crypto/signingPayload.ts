export interface JoinSigningPayload {
  electionId: string;
  serverId: string;
  vsPublicKey: string;
  timestamp: string;
}

export interface LeaveSigningPayload {
  electionId: string;
  serverId: string;
  timestamp: string;
}

export interface RevokeSigningPayload {
  electionId: string;
  serverId: string;
  timestamp: string;
  reason?: string;
}

export function buildJoinSigningPayload(input: JoinSigningPayload): string {
  return JSON.stringify({
    action: "JOIN",
    electionId: input.electionId,
    serverId: input.serverId,
    vsPublicKey: input.vsPublicKey,
    timestamp: input.timestamp
  });
}

export function buildLeaveSigningPayload(input: LeaveSigningPayload): string {
  return JSON.stringify({
    action: "LEAVE",
    electionId: input.electionId,
    serverId: input.serverId,
    timestamp: input.timestamp
  });
}

export function buildRevokeSigningPayload(input: RevokeSigningPayload): string {
  return JSON.stringify({
    action: "REVOKE",
    electionId: input.electionId,
    serverId: input.serverId,
    timestamp: input.timestamp,
    reason: input.reason ?? null
  });
}
