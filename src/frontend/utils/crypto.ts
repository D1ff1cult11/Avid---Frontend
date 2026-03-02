import nacl from "tweetnacl";

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary);
}

function xorBytes(left: Uint8Array, right: Uint8Array): Uint8Array {
  if (left.length !== right.length) {
    throw new Error("Byte arrays must have the same length.");
  }

  const out = new Uint8Array(left.length);
  for (let index = 0; index < left.length; index += 1) {
    out[index] = left[index] ^ right[index];
  }
  return out;
}

export function generateSymmetricKey(): Uint8Array {
  return nacl.randomBytes(nacl.secretbox.keyLength);
}

export function encryptPayload(payload: unknown, key: Uint8Array): string {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const encrypted = nacl.secretbox(payloadBytes, nonce, key);

  const packed = new Uint8Array(nonce.length + encrypted.length);
  packed.set(nonce);
  packed.set(encrypted, nonce.length);
  return bytesToBase64(packed);
}

export function splitKeyShares(
  key: Uint8Array,
  shareCount = 3
): string[] {
  if (shareCount <= 1) {
    return [bytesToBase64(key)];
  }

  const randomShares: Uint8Array[] = [];
  for (let index = 0; index < shareCount - 1; index += 1) {
    randomShares.push(nacl.randomBytes(key.length));
  }

  const finalShare = randomShares.reduce(
    (current, share) => xorBytes(current, share),
    key
  );

  return [...randomShares, finalShare].map(bytesToBase64);
}
