import { Payload } from "./payloadTypes";

export interface EvmCertificate {
  evmPublicKey: string;
  esPublicKey: string;
  signatureByES: string;
}

export interface EsCertificate {
  esPublicKey: string;
  signatureByEC: string;
}

export interface CertificateChain {
  evmCertificate: EvmCertificate;
  esCertificate: EsCertificate;
}

export interface VSCertificate {
  vsPublicKey: string;
  signatureByEC: string;
}

export interface EvmRequest {
  publicKeyEvm: string;
  metadata: CertificateChain;
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
    vs_cert: VSCertificate;
  };
  responsePayload: unknown;
  signature: string;
}
