import { useMemo, useState } from "preact/hooks";
import { submitDistributedVote } from "../services/votingApi";

export function useBallot() {
  const [voterId, setVoterIdState] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptHash, setReceiptHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function setVoterId(nextVoterId: string) {
    setVoterIdState(nextVoterId);
    setReceiptHash(null);
    setErrorMessage(null);
  }

  function selectCandidate(candidateId: string) {
    setSelectedCandidate(candidateId);
    setReceiptHash(null);
    setErrorMessage(null);
  }

  async function submitVote() {
    if (!voterId.trim() || !selectedCandidate) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await submitDistributedVote({
        voterId,
        selectedCandidateId: selectedCandidate
      });
      setReceiptHash(result.receiptHash);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Vote submission failed.";
      setErrorMessage(message);
      setReceiptHash(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit = useMemo(() => {
    return voterId.trim().length > 0 && selectedCandidate !== null && !isSubmitting;
  }, [isSubmitting, selectedCandidate, voterId]);

  return {
    voterId,
    selectedCandidate,
    isSubmitting,
    receiptHash,
    errorMessage,
    canSubmit,
    setVoterId,
    selectCandidate,
    submitVote
  };
}
