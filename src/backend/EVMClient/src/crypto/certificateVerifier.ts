import { verifySignature } from './signature';

export class CertificateVerifier {
  // In a real AVID protocol, the VS certificate is signed by the Election Commission.
  // This verifies the VS certificate signature.
  static verifyVSCertificate(vsPublicKey: string, signatureByEC: string, ecPublicKey: string): boolean {
    return verifySignature(ecPublicKey, signatureByEC, { publicKey: vsPublicKey });
  }

  // Ensures the response publicKey matches the ledger publicKey
  static verifyIdentity(responsePublicKey: string, ledgerPublicKey: string): boolean {
    return responsePublicKey === ledgerPublicKey;
  }
}
