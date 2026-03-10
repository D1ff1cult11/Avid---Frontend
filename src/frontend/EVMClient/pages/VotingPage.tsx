import { electionConfig } from "../config/election";
import BallotCard from "../components/Ballot/BallotCard";
import ElectionHeader from "../components/Header/ElectionHeader";
import SuccessReceipt from "../components/Result/SuccessReceipt";
import SubmitButton from "../components/Submit/SubmitButton";
import VoterIdInput from "../components/Voter/VoterIdInput";
import { useBallot } from "../hooks/useBallot";

export default function VotingPage() {
  const {
    voterId,
    selectedCandidate,
    isSubmitting,
    receiptHash,
    errorMessage,
    canSubmit,
    setVoterId,
    selectCandidate,
    submitVote
  } = useBallot();

  return (
    <main className="page">
      <ElectionHeader />

      <VoterIdInput value={voterId} onChange={setVoterId} />

      <BallotCard
        position={electionConfig.position}
        candidates={electionConfig.candidates}
        selectedCandidateId={selectedCandidate}
        onSelectCandidate={selectCandidate}
      />

      <div className="card submit-card">
        <SubmitButton
          disabled={!canSubmit}
          isSubmitting={isSubmitting}
          onSubmit={submitVote}
        />
        {errorMessage && <p className="error-text">{errorMessage}</p>}
      </div>

      <SuccessReceipt receiptHash={receiptHash} />
    </main>
  );
}
