import type { Candidate } from "../../types/election";
import CandidateCard from "./CandidateCard";

interface CandidateListProps {
  candidates: Candidate[];
  selectedCandidateId: string | null;
  onSelect: (candidateId: string) => void;
}

export default function CandidateList({
  candidates,
  selectedCandidateId,
  onSelect
}: CandidateListProps) {
  return (
    <div className="candidate-grid">
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          isSelected={selectedCandidateId === candidate.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
