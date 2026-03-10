const nonceStore = new Map<string, number>();

export function getLastNonce(publicKeyEvm: string): number | undefined {
  return nonceStore.get(publicKeyEvm);
}

export function setLastNonce(publicKeyEvm: string, nonce: number): void {
  nonceStore.set(publicKeyEvm, nonce);
}