import { LocalState } from '../state/localState';
import { VotingServerInfo } from '../../shared/types';

interface MembershipSchema {
  servers: VotingServerInfo[];
}

export const membershipStore = new LocalState<MembershipSchema>('membership', { servers: [] });

export function updateMembership(servers: VotingServerInfo[]) {
  membershipStore.set('servers', servers);
}

export function getMembership(): VotingServerInfo[] {
  return membershipStore.get('servers') || [];
}

export function getServerById(serverId: string): VotingServerInfo | undefined {
  const servers = getMembership();
  return servers.find((s) => s.serverId === serverId);
}
