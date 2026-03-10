import type { Candidate } from "../../types/election";

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: (candidateId: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function CandidateCard({
  candidate,
  isSelected,
  onSelect
}: CandidateCardProps) {
  const cardClasses = `candidate-card ${isSelected ? "selected" : ""}`;

  return (
    <label className={cardClasses}>
      <div className="candidate-name">{candidate.name}</div>
      <div className="candidate-avatar" aria-hidden="true">
        {getInitials(candidate.name)}
      </div>
      <div className="candidate-select-row">
        <input
          type="radio"
          name="candidate"
          checked={isSelected}
          onChange={() => onSelect(candidate.id)}
        />
        <span>Select</span>
      </div>
    </label>
  );
}
