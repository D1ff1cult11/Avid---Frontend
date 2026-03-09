export function encodeVote(
  candidateIndex: number,
  totalCandidates: number
): number[] {
  if (
    totalCandidates <= 0 ||
    candidateIndex < 0 ||
    candidateIndex >= totalCandidates
  ) {
    throw new Error("Invalid vote encoding input.");
  }

  const voteVector = new Array<number>(totalCandidates).fill(0);
  voteVector[candidateIndex] = 1;
  return voteVector;
}
