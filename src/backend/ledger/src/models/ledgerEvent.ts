export enum LedgerEventType {
  JOIN = "JOIN",
  LEAVE = "LEAVE",
  REVOKE = "REVOKE"
}

export interface LedgerEvent {
  id: number;
  electionId: string;
  eventType: LedgerEventType;
  serverId: string;
  vsPublicKey: string | null;
  timestamp: string;
  payload: Record<string, unknown>;
}

export interface AppendLedgerEvent {
  electionId: string;
  eventType: LedgerEventType;
  serverId: string;
  vsPublicKey: string | null;
  timestamp: string;
  payload: Record<string, unknown>;
}

export interface LedgerQuery {
  electionId?: string;
  fromId?: number;
}
