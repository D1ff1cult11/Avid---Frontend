import { createVerify } from "crypto";

export interface SignatureVerificationInput {
  publicKeyPem: string;
  payload: string;
  signatureBase64: string;
}

export function verifySignature(input: SignatureVerificationInput): boolean {
  try {
    const verifier = createVerify("SHA256");
    verifier.update(input.payload, "utf8");
    verifier.end();

    const signatureBuffer = Buffer.from(input.signatureBase64, "base64");
    if (signatureBuffer.length === 0) {
      return false;
    }

    return verifier.verify(input.publicKeyPem, signatureBuffer);
  } catch {
    return false;
  }
}
