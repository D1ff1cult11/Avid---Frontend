import type { Candidate } from "../../EVMClient/types/election";

/**
 * Submit candidate to backend. Backend not implemented yet.
 * Payload structure ready for integration.
 */
export async function submitCandidate(
  electionId: string,
  candidate: Omit<Candidate, "id">
): Promise<void> {
  const payload = { electionId, candidate };
  // TODO: Replace with actual API call when backend is ready
  // await fetch('/api/elections/${electionId}/candidates', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(candidate),
  // });
  console.log("Submit candidate (backend not implemented):", payload);
}
