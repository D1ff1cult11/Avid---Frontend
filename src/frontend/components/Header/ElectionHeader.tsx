import { electionConfig } from "../../config/election";

export default function ElectionHeader() {
  return (
    <header className="card election-header">
      <h1 className="election-title">{electionConfig.electionName}</h1>
      <p className="election-meta">Election ID: {electionConfig.electionId}</p>
    </header>
  );
}
