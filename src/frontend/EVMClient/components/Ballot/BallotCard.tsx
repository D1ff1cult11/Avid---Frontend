import type { Candidate } from "../../types/election";
import CandidateList from "../Candidates/CandidateList";

interface BallotCardProps {
  position: string;
  candidates: Candidate[];
  selectedCandidateId: string | null;
  onSelectCandidate: (candidateId: string) => void;
}

export default function BallotCard({
  position,
  candidates,
  selectedCandidateId,
  onSelectCandidate
}: BallotCardProps) {
  return (
    <section className="card">
      <h2 className="ballot-position">{position.toUpperCase()}</h2>
      <CandidateList
        candidates={candidates}
        selectedCandidateId={selectedCandidateId}
        onSelect={onSelectCandidate}
      />
    </section>
  );
}
