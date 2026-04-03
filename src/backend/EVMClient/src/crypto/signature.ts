import crypto from 'crypto';

export function signPayload(privateKeyPem: string, payload: any): string {
  const dataString = JSON.stringify(payload); // Canonical serialization in real world
  const sign = crypto.createSign('SHA256');
  sign.update(dataString);
  sign.end();
  return sign.sign(privateKeyPem, 'base64');
}

export function verifySignature(publicKeyPem: string, signatureBase64: string, payload: any): boolean {
  try {
    const dataString = JSON.stringify(payload);
    const verify = crypto.createVerify('SHA256');
    verify.update(dataString);
    verify.end();
    return verify.verify(publicKeyPem, signatureBase64, 'base64');
  } catch (err) {
    return false;
  }
}
