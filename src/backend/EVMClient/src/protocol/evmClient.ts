import { AppConfig } from '../config/config';
import { LedgerClient } from '../ledger/ledgerClient';
import { VsApi } from '../network/vsApi';
import { EligibilityFlow } from './eligibilityFlow';
import { VoteFlow } from './voteFlow';
import { MaskFlow } from './maskFlow';

export class EvmClient {
  private ledgerClient: LedgerClient;
  private vsApi: VsApi;
  private eligibilityFlow: EligibilityFlow;
  private voteFlow: VoteFlow;
  private maskFlow: MaskFlow;

  constructor(private config: AppConfig) {
    this.ledgerClient = new LedgerClient(this.config);
    this.vsApi = new VsApi(this.config);
    this.eligibilityFlow = new EligibilityFlow(this.vsApi);
    this.voteFlow = new VoteFlow(this.vsApi);
    this.maskFlow = new MaskFlow(this.vsApi);
  }

  public async start() {
    this.ledgerClient.startPeriodicSync();
    console.log('EVM Client Started and Ledger Sync scheduled.');
  }

  public async stop() {
    this.ledgerClient.stopPeriodicSync();
  }

  public async checkEligibility(voterId: string): Promise<boolean> {
    return this.eligibilityFlow.runCheck(voterId);
  }

  public async submitVote(voterId: string, candidateId: string): Promise<boolean> {
    const success = await this.voteFlow.submitVote(candidateId);
    if (success) {
      // Fire and forget mask flow immediately after
      this.maskFlow.submitMask().catch(err => console.error('Mask flow failed:', err));
    }
    return success;
  }
}
