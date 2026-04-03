import { VsApi } from '../network/vsApi';
import { getDeterministicSelectionKey, selectServers } from '../selection/deterministicSelection';
import { getCurrentSession } from '../state/voteSessionStore';
import { saveMaskData, markMaskSubmitted } from '../state/maskStore';
import { sha256 } from '../crypto/hash';

export class MaskFlow {
  constructor(private vsApi: VsApi) {}

  public async submitMask(): Promise<boolean> {
    const session = getCurrentSession();
    if (!session || session.status !== 'VOTED') {
      throw new Error('Cannot submit mask without a voted session.');
    }

    const prevVoteId = session.sessionId;
    const maskKeyMaterial = sha256(`${prevVoteId}maskKey`);
    saveMaskData(prevVoteId, maskKeyMaterial);

    const key = getDeterministicSelectionKey('MASK', undefined, prevVoteId);
    const selectedServers = selectServers(key);

    const promises = selectedServers.map(server => {
      return this.vsApi.sendRequest(server, { type: 'MASK', prevVoteId, maskKey: maskKeyMaterial })
        .catch(err => console.warn(`Failed to send mask to ${server.serverId}:`, err));
    });

    await Promise.allSettled(promises);
    markMaskSubmitted(prevVoteId);
    return true;
  }
}
