import { useState } from "preact/hooks";
import type { AuthorizedStaff } from "../EVMClient/types/election";
import { generateSigningKeyPair } from "../EVMClient/utils/crypto";

interface CommissionerDashboardProps {
  onLogout: () => void;
}

export default function CommissionerDashboard({ onLogout }: CommissionerDashboardProps) {
  const [electionId, setElectionId] = useState<string | null>(null);
  const [electionName, setElectionName] = useState("");
  const [staffName, setStaffName] = useState("");
  const [authorizedStaff, setAuthorizedStaff] = useState<AuthorizedStaff[]>([]);
  const [keyPair, setKeyPair] = useState<{ publicKey: string; secretKey: string } | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [electionFrozen, setElectionFrozen] = useState(false);

  const initializeElection = () => {
    if (!electionName.trim()) {
      setMessage({ type: "error", text: "Enter election name" });
      return;
    }
    const id = `elec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setElectionId(id);
    setMessage({ type: "success", text: `Election initialized: ${id}` });
  };

  const authorizeStaff = () => {
    if (!staffName.trim()) {
      setMessage({ type: "error", text: "Enter staff name" });
      return;
    }
    const staff: AuthorizedStaff = {
      id: `staff-${Date.now()}`,
      name: staffName.trim(),
      authorizedAt: new Date().toISOString()
    };
    setAuthorizedStaff((prev) => [...prev, staff]);
    setStaffName("");
    setMessage({ type: "success", text: `${staff.name} authorized` });
  };

  const createKeyPair = () => {
    const pair = generateSigningKeyPair();
    setKeyPair(pair);
    setMessage({ type: "success", text: "Signing key pair created. Store secret key securely." });
  };

  const freezeElection = () => {
    setElectionFrozen(true);
    setMessage({ type: "success", text: "Election has been frozen. No further changes allowed." });
  };

  return (
    <main className="page">
      <header className="card election-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="election-title">Election Commissioner</h1>
          <p className="election-meta">Configure and manage the election</p>
        </div>
        <button type="button" className="remove-btn" onClick={onLogout}>Logout</button>
      </header>

      {message && (
        <div className={`card ${message.type === "success" ? "success-receipt" : ""}`}>
          <p className={message.type === "error" ? "error-text" : "success-title"}>{message.text}</p>
        </div>
      )}

      <section className="card">
        <h2 className="section-title">0. Freeze Election</h2>
        <p className="section-desc">Permanently freeze the election. No further configuration changes will be allowed.</p>
        <button
          type="button"
          className="submit-button"
          style={{ marginTop: 12, background: electionFrozen ? "#9eb2c4" : undefined }}
          onClick={freezeElection}
          disabled={electionFrozen}
        >
          {electionFrozen ? "Election Frozen" : "Freeze Election"}
        </button>
      </section>

      <section className="card">
        <h2 className="section-title">1. Initialize Election</h2>
        <p className="section-desc">Create an election ID for this election.</p>
        <label className="input-label">Election name</label>
        <input
          type="text"
          className="text-input"
          placeholder="e.g. National General Election"
          value={electionName}
          onInput={(e) => setElectionName((e.target as HTMLInputElement).value)}
          disabled={!!electionId || electionFrozen}
        />
        <button
          type="button"
          className="submit-button"
          style={{ marginTop: 12 }}
          onClick={initializeElection}
          disabled={!!electionId || electionFrozen}
        >
          {electionId ? "Election Initialized" : "Initialize Election"}
        </button>
        {electionId && (
          <p className="election-meta" style={{ marginTop: 8 }}>
            Election ID: <strong>{electionId}</strong>
          </p>
        )}
      </section>

      <section className="card">
        <h2 className="section-title">2. Authorize Election Staff</h2>
        <p className="section-desc">Grant authorization to staff who will manage candidates and EVMs.</p>
        <label className="input-label">Staff name</label>
        <input
          type="text"
          className="text-input"
          placeholder="Enter staff member name"
          value={staffName}
          onInput={(e) => setStaffName((e.target as HTMLInputElement).value)}
          disabled={electionFrozen}
        />
        <button
          type="button"
          className="submit-button"
          style={{ marginTop: 12 }}
          onClick={authorizeStaff}
          disabled={electionFrozen}
        >
          Authorize Staff
        </button>
        {authorizedStaff.length > 0 && (
          <ul className="staff-list">
            {authorizedStaff.map((s) => (
              <li key={s.id} className="staff-item">
                <span>{s.name}</span>
                <span className="text-muted">{new Date(s.authorizedAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2 className="section-title">3. Create Signing Key Pair</h2>
        <p className="section-desc">
          Generate a key pair on this machine to sign certificates. Keep the secret key secure.
        </p>
        <button
          type="button"
          className="submit-button"
          style={{ marginTop: 12 }}
          onClick={createKeyPair}
          disabled={!!keyPair || electionFrozen}
        >
          {keyPair ? "Key Pair Created" : "Generate Key Pair"}
        </button>
        {keyPair && (
          <div className="key-pair-output" style={{ marginTop: 16 }}>
            <div>
              <label className="input-label">Public key (for verification)</label>
              <code className="key-display">{keyPair.publicKey}</code>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="input-label">Secret key (store securely, do not share)</label>
              <code className="key-display secret">{keyPair.secretKey}</code>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
