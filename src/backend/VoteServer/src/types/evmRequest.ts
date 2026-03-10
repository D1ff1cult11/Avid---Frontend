import { Payload } from "./payloadTypes";

export interface EvmRequest {
  publicKeyEvm: string;
  metadata: Record<string, unknown>;
  requestPayload: Payload;
  nonce: number;
  signature: string;
}

export interface VsResponse {
  publicKeyVs: string;
  metadata: {
    timestamp: string;
    server_id: string;
    request_nonce: number;
    [key: string]: unknown;
  };
  responsePayload: unknown;
  signature: string;
}