import { hashSha256Hex } from "./hashing";

export const votingServers = [
  "http://localhost:9001",
  "http://localhost:9002",
  "http://localhost:9003",
  "http://localhost:9004",
  "http://localhost:9005",
  "http://localhost:9006",
  "http://localhost:9007"
];

export function selectVotingServers(
  voterId: string,
  electionId: string,
  f = 1,
  serverPool: string[] = votingServers
): string[] {
  if (serverPool.length === 0) {
    return [];
  }

  const requiredCount = Math.min(serverPool.length, 2 * f + 1);
  const selectedServers: string[] = [];
  const usedIndexes = new Set<number>();

  const seedHex = hashSha256Hex(`${voterId}:${electionId}`);
  const modulus = 2n ** 64n;
  let state = BigInt(`0x${seedHex.slice(0, 16)}`);

  while (selectedServers.length < requiredCount) {
    state = (6364136223846793005n * state + 1442695040888963407n) % modulus;
    const selectedIndex = Number(state % BigInt(serverPool.length));

    if (!usedIndexes.has(selectedIndex)) {
      usedIndexes.add(selectedIndex);
      selectedServers.push(serverPool[selectedIndex]);
    }
  }

  return selectedServers;
}
