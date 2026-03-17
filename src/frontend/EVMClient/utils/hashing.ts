import { sha256 } from "js-sha256";

export function hashSha256Hex(value: string): string {
  return sha256(value);
}

export function hashObjectSha256Hex(value: unknown): string {
  return sha256(JSON.stringify(value));
}
