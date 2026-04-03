import { AppConfig } from '../../shared/types';
import crypto from 'crypto';

// For simplicity, generating an EVM keypair if not provided
const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');

export const defaultConfig: AppConfig = {
  ledgerEndpoint: process.env.LEDGER_HOST || 'http://localhost:3000',
  electionId: process.env.ELECTION_ID || 'election-1',
  syncIntervalMs: 10 * 60 * 1000, // 10 minutes
  evmPrivateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
  evmPublicKey: publicKey.export({ type: 'spki', format: 'pem' }).toString()
};
