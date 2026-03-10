import { Candidate } from "../types/payloadTypes";
import { findVoterById, listCandidates } from "../repositories/voterRepository";

export interface EligibilityResult {
  eligible: boolean;
  candidates: Candidate[];
}

export async function checkEligibility(voterId: string): Promise<EligibilityResult> {
  const voter = await findVoterById(voterId);

  if (!voter) {
    throw new Error("Voter does not exist");
  }

  if (voter.has_voted) {
    throw new Error("Voter has already voted");
  }

  const candidates = await listCandidates();
  return {
    eligible: true,
    candidates
  };
}