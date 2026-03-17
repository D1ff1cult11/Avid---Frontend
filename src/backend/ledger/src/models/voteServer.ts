export enum VoteServerStatus {
  AUTHORIZED = "AUTHORIZED",
  ACTIVE = "ACTIVE",
  LEFT = "LEFT",
  REVOKED = "REVOKED"
}

export interface VoteServer {
  serverId: string;
  electionId: string;
  vsPublicKey: string;
  status: VoteServerStatus;
  joinedAt: string | null;
  leftAt: string | null;
  revokedAt: string | null;
}
