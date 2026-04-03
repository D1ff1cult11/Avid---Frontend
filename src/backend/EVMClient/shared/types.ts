export type VotingServerInfo = {
  serverId: string;
  publicKey: string;
  endpoint: string;
};

export type RequestPayloadType = "ELIGIBILITY_CHECK" | "VOTE" | "MASK";

export interface RequestPayload {
  type: RequestPayloadType;
  voterId?: string;
}

export interface EvmRequestMessage {
  publicKeyEvm: string;
  metadata: Record<string, any>;
  requestPayload: RequestPayload;
  nonce: number;
  signature: string;
}

export interface VsResponseMessage {
  publicKeyVs: string;
  metadata: {
    timestamp: string;
    server_id: string;
    request_nonce: number;
  };
  responsePayload: Record<string, any>;
  signature: string;
}

// UI specifically requested types for IPC
export interface AppConfig {
  ledgerEndpoint: string;
  electionId: string;
  syncIntervalMs: number;
  evmPrivateKey: string;
  evmPublicKey: string;
}
