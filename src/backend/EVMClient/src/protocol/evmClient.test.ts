import { EvmClient } from './evmClient';
import { AppConfig } from '../../shared/types';
import crypto from 'crypto';
import { updateMembership } from '../ledger/membershipStore';
import { VotingServerInfo, RequestPayloadType, VsResponseMessage } from '../../shared/types';
import { signPayload } from '../crypto/signature';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('EVMClient Voting Flow', () => {
  let evmClient: EvmClient;
  let testConfig: AppConfig;
  let mockServers: VotingServerInfo[];
  let serverKeys: Record<string, { publicKey: string; privateKey: string }>;

  beforeAll(() => {
    // 1. Generate keys for EVM Client
    const evmKeys = crypto.generateKeyPairSync('ed25519');
    
    testConfig = {
      ledgerEndpoint: 'http://localhost:3000',
      electionId: 'test-election',
      syncIntervalMs: 600000,
      evmPublicKey: evmKeys.publicKey.export({ type: 'spki', format: 'pem' }).toString(),
      evmPrivateKey: evmKeys.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    };

    // 2. Generate mock Voting Servers (n=10, f=3)
    serverKeys = {};
    mockServers = [];
    
    for (let i = 1; i <= 10; i++) {
      const keys = crypto.generateKeyPairSync('ed25519');
      const pubKey = keys.publicKey.export({ type: 'spki', format: 'pem' }).toString();
      const privKey = keys.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
      
      const serverId = `vs-${i}`;
      serverKeys[serverId] = { publicKey: pubKey, privateKey: privKey };
      
      mockServers.push({
        serverId,
        publicKey: pubKey,
        endpoint: `http://localhost:800${i}`
      });
    }

    // Load membership manually
    updateMembership(mockServers);
    evmClient = new EvmClient(testConfig);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const generateMockVsResponse = (serverId: string, responsePayload: any): VsResponseMessage => {
    const pubKey = serverKeys[serverId].publicKey;
    const privKey = serverKeys[serverId].privateKey;
    
    const metadata = { timestamp: new Date().toISOString(), server_id: serverId, request_nonce: 1 };
    
    const plainMessage = {
      publicKeyVs: pubKey,
      metadata,
      responsePayload
    };

    return {
      ...plainMessage,
      signature: signPayload(privKey, plainMessage)
    };
  };

  it('should successfully check eligibility when reaching quorum (f+1 positive responses)', async () => {
    // Mock the axios.post implementation to simulate our servers
    mockedAxios.post.mockImplementation(async (url: string, data: any) => {
      // Find which server this URL belongs to by searching mockServers endpoints
      const server = mockServers.find(s => url.startsWith(s.endpoint));
      if (!server) throw new Error('Unknown server endpoint');

      // Check request signature? (Assuming VsApi sent properly signed payload which it does)
      const res = generateMockVsResponse(server.serverId, { status: 'ELIGIBLE' });
      return { data: res } as any;
    });

    const isEligible = await evmClient.checkEligibility('voter-secret-123');
    expect(isEligible).toBe(true);

    // Should have dispatched to exactly m = 2f+1 servers
    // n=10 => f = floor((10-1)/3) = 3. m = min(2(3)+1, 10) = 7.
    // Quorum needs f+1 = 4 successes!
    // We expect axios post to be called exactly 7 times over the parallel sweep
    expect(mockedAxios.post).toHaveBeenCalledTimes(7);
  });

  it('should successfully submit a vote and mask following eligibility', async () => {
    mockedAxios.post.mockImplementation(async (url: string, data: any) => {
      const server = mockServers.find(s => url.startsWith(s.endpoint));
      const res = generateMockVsResponse(server!.serverId, { status: 'ACK' });
      return { data: res } as any;
    });

    const voteSuccess = await evmClient.submitVote('voter-secret-123', 'candidate-A');
    expect(voteSuccess).toBe(true);
    
    // Vote flow also calls 7 servers
    expect(mockedAxios.post).toHaveBeenCalledTimes(7);
  });

  it('should reject eligibility when servers return bad signature or mismatch', async () => {
    mockedAxios.post.mockImplementation(async (url: string, data: any) => {
      const server = mockServers.find(s => url.startsWith(s.endpoint));
      
      // Deliberately tamper with the response payload so signature verification fails!
      const res = generateMockVsResponse(server!.serverId, { status: 'ELIGIBLE' });
      res.responsePayload.status = 'INELIGIBLE'; // mutated AFTER signing

      return { data: res } as any;
    });

    const isEligible = await evmClient.checkEligibility('voter-imposter');
    expect(isEligible).toBe(false);
  });
});
