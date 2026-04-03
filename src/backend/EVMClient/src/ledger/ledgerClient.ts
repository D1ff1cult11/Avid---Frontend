import { AppConfig } from '../config/config';
import axios from 'axios';
import { VotingServerInfo } from '../../shared/types';
import { updateMembership } from './membershipStore';

export class LedgerClient {
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing = false;

  constructor(private config: AppConfig) {}

  public async sync(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;
    try {
      const response = await axios.get(`${this.config.ledgerEndpoint}/elections/${this.config.electionId}/servers`);
      if (response.data && response.data.data) {
        const servers: VotingServerInfo[] = response.data.data;
        updateMembership(servers);
        console.log(`[LedgerClient] Synced ${servers.length} servers`);
      }
    } catch (err) {
      console.error(`[LedgerClient] Failed to sync ledger:`, err);
    } finally {
      this.isSyncing = false;
    }
  }

  public startPeriodicSync() {
    this.sync();
    this.syncInterval = setInterval(() => this.sync(), this.config.syncIntervalMs);
  }

  public stopPeriodicSync() {
    if (this.syncInterval) clearInterval(this.syncInterval);
  }
}
