import { electionConfig } from "../config/election";
import type { ServerSubmissionResult, VoteSubmitResult } from "../types/election";
import { encryptPayload, generateSymmetricKey, splitKeyShares } from "../utils/crypto";
import { encodeVote } from "../utils/encoding";
import { hashSha256Hex } from "../utils/hashing";
import { generateRandomVector, maskVote } from "../utils/masking";
import { selectVotingServers } from "../utils/serverSelection";

interface SubmitVoteInput {
  voterId: string;
  selectedCandidateId: string;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export async function submitDistributedVote(
  input: SubmitVoteInput
): Promise<VoteSubmitResult> {
  const voterId = input.voterId.trim();
  if (!voterId) {
    throw new Error("Voter ID is required.");
  }

  const selectedCandidateIndex = electionConfig.candidates.findIndex(
    (candidate) => candidate.id === input.selectedCandidateId
  );
  if (selectedCandidateIndex === -1) {
    throw new Error("Selected candidate is invalid.");
  }

  const totalCandidates = electionConfig.candidates.length;
  const voteVector = encodeVote(selectedCandidateIndex, totalCandidates);
  const randomVector = generateRandomVector(totalCandidates);
  const maskedVote = maskVote(voteVector, randomVector);

  const symmetricKey = generateSymmetricKey();
  const encryptedPayload = encryptPayload(
    {
      electionId: electionConfig.electionId,
      voterId,
      voteVector,
      randomVector,
      maskedVote,
      createdAt: new Date().toISOString()
    },
    symmetricKey
  );

  const targetServers = await selectVotingServers(voterId, electionConfig.electionId);
  if (targetServers.length === 0) {
    throw new Error("No voting servers are configured.");
  }

  const keyShares = splitKeyShares(symmetricKey, targetServers.length);
  const submissions = targetServers.map(async (serverUrl, index) => {
    const keyShare = keyShares[index];
    const responsePayload = {
      payload: encryptedPayload,
      keyShare,
      voterId,
      electionId: electionConfig.electionId
    };

    try {
      const response = await fetch(`${serverUrl}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(responsePayload)
      });

      const body = await parseResponseBody(response);
      const result: ServerSubmissionResult = {
        server: serverUrl,
        ok: response.ok,
        status: response.status,
        response: body
      };
      return result;
    } catch (error) {
      const result: ServerSubmissionResult = {
        server: serverUrl,
        ok: false,
        error: error instanceof Error ? error.message : "Network request failed."
      };
      return result;
    }
  });

  const serverResults = await Promise.all(submissions);
  const successfulSubmissions = serverResults.filter((result) => result.ok).length;

  if (successfulSubmissions === 0) {
    throw new Error("Unable to submit vote to any selected voting server.");
  }

  const receiptHash = `0x${hashSha256Hex(encryptedPayload)}`;
  return { receiptHash, serverResults };
}
