export function generateRandomVector(length: number): number[] {
  if (length <= 0) {
    throw new Error("Random vector length must be positive.");
  }

  const randomInts = new Uint16Array(length);
  crypto.getRandomValues(randomInts);
  return Array.from(randomInts, (value) => value % 1000);
}

export function maskVote(voteVector: number[], randomVector: number[]): number[] {
  if (voteVector.length !== randomVector.length) {
    throw new Error("Vote and random vectors must have same length.");
  }

  return voteVector.map((voteValue, index) => voteValue + randomVector[index]);
}
