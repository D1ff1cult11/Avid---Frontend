import axios from 'axios';
import { VotingServerInfo, EvmRequestMessage, VsResponseMessage, RequestPayload } from '../../shared/types';
import { AppConfig } from '../config/config';
import { signPayload } from '../crypto/signature';
import { NonceManager } from '../protocol/nonceManager';

// Wait this class will only wrap logic to send the signed payload and return it
export class VsApi {
  constructor(private config: AppConfig) {}

  public async sendRequest(server: VotingServerInfo, payload: RequestPayload): Promise<VsResponseMessage> {
    const nonce = NonceManager.getNextNonce(server.serverId);
    
    // Construct the metadata to be signed inside the request
    const metadata = { timestamp: new Date().toISOString() };
    
    const plainMessage = {
      publicKeyEvm: this.config.evmPublicKey,
      metadata,
      requestPayload: payload,
      nonce
    };

    const signature = signPayload(this.config.evmPrivateKey, plainMessage);

    const fullMessage: EvmRequestMessage = {
      ...plainMessage,
      signature
    };

    const url = `${server.endpoint}/request`;
    
    const response = await axios.post<VsResponseMessage>(url, fullMessage, {
      timeout: 5000 // 5 seconds timeout
    });

    return response.data;
  }
}
