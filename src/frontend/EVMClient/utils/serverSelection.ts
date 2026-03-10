import { hashSha256Hex } from "./hashing";

export async function getVotingServers(electionId: string): Promise<string[]> {
  try {
    const res = await fetch(`http://localhost:3001/api/vote-servers/${electionId}`);
    if (!res.ok) throw new Error('Failed to fetch vote servers');
    const data = await res.json();
    return data.voteServers || [];
  } catch (error) {
    console.error('Error fetching vote servers:', error);
    return [];
  }
}

export async function selectVotingServers(
  voterId: string,
  electionId: string,
  f = 1,
  serverPool?: string[]
): Promise<string[]> {
  const pool = serverPool || await getVotingServers(electionId);

  if (pool.length === 0) {
    return [];
  }

  const requiredCount = Math.min(pool.length, 2 * f + 1);
  const selectedServers: string[] = [];
  const usedIndexes = new Set<number>();

  const seedHex = hashSha256Hex(`${voterId}:${electionId}`);
  const modulus = 2n ** 64n;
  let state = BigInt(`0x${seedHex.slice(0, 16)}`);

  while (selectedServers.length < requiredCount) {
    state = (6364136223846793005n * state + 1442695040888963407n) % modulus;
    const selectedIndex = Number(state % BigInt(pool.length));

    if (!usedIndexes.has(selectedIndex)) {
      usedIndexes.add(selectedIndex);
      selectedServers.push(pool[selectedIndex]);
    }
  }

  return selectedServers;
}
