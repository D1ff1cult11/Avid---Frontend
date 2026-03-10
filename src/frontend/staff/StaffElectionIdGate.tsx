import { useState } from "preact/hooks";

interface StaffElectionIdGateProps {
  onElectionIdVerified: (electionId: string) => void;
}

export default function StaffElectionIdGate({ onElectionIdVerified }: StaffElectionIdGateProps) {
  const [electionId, setElectionId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!electionId.trim()) {
      setError("Enter the election ID you are authorized for");
      return;
    }
    setError("");
    onElectionIdVerified(electionId.trim());
  };

  return (
    <main className="page login-page">
      <header className="card election-header">
        <h1 className="election-title">Election Staff</h1>
        <p className="election-meta">Enter authorized election</p>
      </header>

      <div className="card">
        <h2 className="section-title">Election ID</h2>
        <p className="section-desc">
          Enter the election ID you are authorized to manage candidates for.
        </p>
        <label className="input-label">Election ID</label>
        <input
          type="text"
          className="text-input"
          placeholder="e.g. elec-1234567890-abc123"
          value={electionId}
          onInput={(e) => {
            setElectionId((e.target as HTMLInputElement).value);
            setError("");
          }}
        />
        {error && <p className="error-text" style={{ marginTop: 12 }}>{error}</p>}
        <button
          type="button"
          className="submit-button"
          style={{ marginTop: 16 }}
          onClick={handleSubmit}
        >
          Continue to Dashboard
        </button>
      </div>
    </main>
  );
}
