import crypto from "crypto";

export function signResponse(payload: unknown): string {
  const privateKey = process.env.VS_PRIVATE_KEY || "";

  if (!privateKey) {
    throw new Error("VS_PRIVATE_KEY is not configured");
  }

  const sign = crypto.createSign("SHA256");
  sign.update(JSON.stringify(payload));
  sign.end();

  // Support env values with escaped newlines.
  const normalizedPrivateKey = privateKey.replace(/\\n/g, "\n");
  return sign.sign(normalizedPrivateKey, "base64");
}

