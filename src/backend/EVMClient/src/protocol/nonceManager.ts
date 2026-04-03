import { LocalState } from '../state/localState';

interface NonceSchema {
  nonces: Record<string, number>;
}

export const nonceStore = new LocalState<NonceSchema>('nonces', { nonces: {} });

export class NonceManager {
  static getNextNonce(serverId: string): number {
    const nonces = nonceStore.get('nonces');
    const current = nonces[serverId] || 0;
    const next = current + 1;
    nonces[serverId] = next;
    nonceStore.set('nonces', nonces);
    return next;
  }

  static getCurrentNonce(serverId: string): number {
    return nonceStore.get('nonces')[serverId] || 0;
  }
}
