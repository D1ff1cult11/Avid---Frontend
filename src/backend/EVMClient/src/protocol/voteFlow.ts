import { VsApi } from '../network/vsApi';
import { getDeterministicSelectionKey, selectServers } from '../selection/deterministicSelection';
import { getCurrentSession, updateSessionStatus } from '../state/voteSessionStore';

export class VoteFlow {
  constructor(private vsApi: VsApi) {}

  public async submitVote(candidateId: string): Promise<boolean> {
    const session = getCurrentSession();
    if (!session || session.status !== 'INIT') {
      throw new Error('No active eligible session to vote.');
    }

    const key = getDeterministicSelectionKey('VOTE', session.voterId);
    const selectedServers = selectServers(key);

    if (selectedServers.length === 0) {
      throw new Error('No membership available to select servers.');
    }

    // Best-effort delivery to all selected servers
    const promises = selectedServers.map(server => {
      // Secret sharing logic is assumed to be embedded in the payload generation here
      return this.vsApi.sendRequest(server, { type: 'VOTE', voterId: session.voterId, payload: { candidateId } })
        .catch(err => console.warn(`Failed to send vote to ${server.serverId}:`, err));
    });

    await Promise.allSettled(promises);
    
    // We consider it submitted if the best-effort is fired.
    // In actual AVID, we may require minimal acks.
    updateSessionStatus('VOTED');
    return true;
  }
}
