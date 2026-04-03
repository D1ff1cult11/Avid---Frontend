import { VsApi } from '../network/vsApi';
import { Quorum } from './quorum';
import { getDeterministicSelectionKey, selectServers } from '../selection/deterministicSelection';
import { CertificateVerifier } from '../crypto/certificateVerifier';
import { verifySignature } from '../crypto/signature';
import { VotingServerInfo } from '../../shared/types';
import { startSession } from '../state/voteSessionStore';
import { v4 as uuidv4 } from 'uuid';

export class EligibilityFlow {
  constructor(private vsApi: VsApi) {}

  public async runCheck(voterId: string): Promise<boolean> {
    const key = getDeterministicSelectionKey('ELIGIBILITY_CHECK', voterId);
    const selectedServers = selectServers(key);
    
    if (selectedServers.length === 0) {
      throw new Error('No membership available to select servers.');
    }

    try {
      const reps = await Quorum.awaitQuorum(selectedServers, async (server: VotingServerInfo) => {
        const response = await this.vsApi.sendRequest(server, { type: 'ELIGIBILITY_CHECK', voterId });
        
        // 1. Verify response signature
        const isSigValid = verifySignature(response.publicKeyVs, response.signature, {
          publicKeyVs: response.publicKeyVs,
          metadata: response.metadata,
          responsePayload: response.responsePayload
        });

        if (!isSigValid) {
          throw new Error('Invalid signature from server ' + server.serverId);
        }

        // 2. Verify identity matches 
        if (!CertificateVerifier.verifyIdentity(response.publicKeyVs, server.publicKey)) {
          throw new Error('Public key mismatch for server ' + server.serverId);
        }
        
        // Check actual payload status
        if (response.responsePayload && response.responsePayload.status !== 'ELIGIBLE') {
          throw new Error('Voter not eligible on server ' + server.serverId);
        }

        return response;
      });
      
      // Quorum reached!
      const voteSessionId = uuidv4();
      startSession(voteSessionId, voterId);
      return true;

    } catch (err) {
      console.error('Eligibility flow failed:', err);
      return false;
    }
  }
}
