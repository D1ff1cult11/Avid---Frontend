export interface EligibilityCheckPayload {
  type: "ELIGIBILITY_CHECK";
  voterId: string;
}

export interface VotePayload {
  type: "VOTE";
  voterId: string;
  vote_data: string;
}

export interface MaskPayload {
  type: "MASK";
  mask_data: string;
}

export type Payload = EligibilityCheckPayload | VotePayload | MaskPayload;

export interface Candidate {
  id: number;
  name: string;
  metadata: Record<string, unknown> | null;
}