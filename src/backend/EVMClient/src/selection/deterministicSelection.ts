import { sha256 } from '../crypto/hash';
import { VotingServerInfo, RequestPayloadType } from '../../shared/types';
import { getMembership } from '../ledger/membershipStore';

export function getDeterministicSelectionKey(type: RequestPayloadType, voterId?: string, prevVoteId?: string): string {
  switch (type) {
    case 'ELIGIBILITY_CHECK':
    case 'VOTE':
      if (!voterId) throw new Error('voterId required for ' + type);
      return voterId;
    case 'MASK':
      if (!prevVoteId) throw new Error('prevVoteId required for MASK');
      return sha256(`${prevVoteId}mask`);
    default:
      throw new Error('Unknown request type');
  }
}

export function selectServers(key: string): VotingServerInfo[] {
  const allServers = getMembership();
  if (allServers.length === 0) return [];

  const n = allServers.length;
  // f represents the maximum number of faulty nodes tolerated
  const f = Math.floor((n - 1) / 3);
  const m = Math.min(2 * f + 1, n);

  // score(s) = SHA256(key || serverId)
  const scoredServers = allServers.map(server => ({
    server,
    score: sha256(`${key}${server.serverId}`)
  }));

  // Sort ascending by score string
  scoredServers.sort((a, b) => a.score.localeCompare(b.score));

  // Select first m servers
  return scoredServers.slice(0, m).map(s => s.server);
}
