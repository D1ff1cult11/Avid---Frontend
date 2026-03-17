export interface Candidate {
  id: string;
  name: string;
  age?: number;
  dob?: string;
}

export interface ElectionConfig {
  electionId: string;
  electionName: string;
  position: string;
  candidates: Candidate[];
}

export interface ServerSubmissionResult {
  server: string;
  ok: boolean;
  status?: number;
  response?: unknown;
  error?: string;
}

export interface VoteSubmitResult {
  receiptHash: string;
  serverResults: ServerSubmissionResult[];
}

export interface AuthorizedStaff {
  id: string;
  name: string;
  authorizedAt: string;
}

export interface EvmClient {
  id: string;
  clientId: string;
  allowed: boolean;
  addedAt: string;
}
