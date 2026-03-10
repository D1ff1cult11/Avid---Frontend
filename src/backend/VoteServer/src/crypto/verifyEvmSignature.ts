import crypto from "crypto";
import { CertificateChain, EvmRequest } from "../types/evmRequest";

function normalizePem(key: string): string {
  return key.replace(/\\n/g, "\n");
}

function isCertificateChain(value: unknown): value is CertificateChain {
  if (!value || typeof value !== "object") {
    return false;
  }

  const chain = value as Partial<CertificateChain>;
  const evmCertificate = chain.evmCertificate as Partial<CertificateChain["evmCertificate"]> | undefined;
  const esCertificate = chain.esCertificate as Partial<CertificateChain["esCertificate"]> | undefined;

  return Boolean(
    evmCertificate &&
      typeof evmCertificate.evmPublicKey === "string" &&
      typeof evmCertificate.esPublicKey === "string" &&
      typeof evmCertificate.signatureByES === "string" &&
      esCertificate &&
      typeof esCertificate.esPublicKey === "string" &&
      typeof esCertificate.signatureByEC === "string"
  );
}

function buildRequestMessageHash(request: EvmRequest): string {
  // The EVM signs SHA256(publicKeyEvm + nonce + JSON.stringify(requestPayload)).
  const message = `${request.publicKeyEvm}${request.nonce}${JSON.stringify(request.requestPayload)}`;
  return crypto.createHash("sha256").update(message).digest("hex");
}

export function verifyEvmSignature(request: EvmRequest, ecPublicKey: string): boolean {
  try {
    if (!ecPublicKey || !isCertificateChain(request.metadata)) {
      return false;
    }

    const { evmCertificate, esCertificate } = request.metadata;
    const { evmPublicKey, esPublicKey, signatureByES } = evmCertificate;
    const { signatureByEC } = esCertificate;

    // Security check 1: request EVM key must match certified EVM key.
    if (request.publicKeyEvm !== evmPublicKey) {
      return false;
    }

    // Security check 2: EVM cert ES key must match ES cert ES key.
    if (evmCertificate.esPublicKey !== esCertificate.esPublicKey) {
      return false;
    }

    // Step 1: verify EC -> ES certificate signature.
    if (!verifySignature(ecPublicKey, esPublicKey, signatureByEC)) {
      return false;
    }

    // Step 2: verify ES -> EVM certificate signature.
    if (!verifySignature(esPublicKey, evmPublicKey, signatureByES)) {
      return false;
    }

    // Step 3: verify EVM signed request message hash.
    const requestMessageHash = buildRequestMessageHash(request);
    return verifySignature(evmPublicKey, requestMessageHash, request.signature);
  } catch {
    return false;
  }
}

export function verifySignature(publicKey: string, message: string, signature: string): boolean {
  try {
    const verify = crypto.createVerify("SHA256");
    verify.update(message);
    verify.end();

    return verify.verify(normalizePem(publicKey), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}
