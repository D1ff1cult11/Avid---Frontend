import { useState } from "preact/hooks";
import type { Candidate, EvmClient } from "../EVMClient/types/election";
import { submitCandidate } from "./api/candidates";
import AddCandidateForm from "./AddCandidateForm";
import StaffElectionIdGate from "./StaffElectionIdGate";
import StaffLoginPage from "./StaffLoginPage";

interface StaffDashboardProps {
  electionId: string;
  onLogout: () => void;
}

function StaffDashboard({ electionId, onLogout }: StaffDashboardProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [evmClientId, setEvmClientId] = useState("");
  const [evmClients, setEvmClients] = useState<EvmClient[]>([]);
  const [voterAllowed, setVoterAllowed] = useState(true);
  const [certSigned, setCertSigned] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const addCandidate = async (candidate: Omit<Candidate, "id">) => {
    const c: Candidate = {
      ...candidate,
      id: `c${candidates.length + 1}-${Date.now()}`
    };
    setCandidates((prev) => [...prev, c]);
    setShowAddForm(false);
    setMessage({ type: "success", text: `${c.name} added` });
    await submitCandidate(electionId, candidate);
  };

  const removeCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  const addEvmClient = () => {
    if (!evmClientId.trim()) {
      setMessage({ type: "error", text: "Enter EVM client ID" });
      return;
    }
    const client: EvmClient = {
      id: `evm-${Date.now()}`,
      clientId: evmClientId.trim(),
      allowed: true,
      addedAt: new Date().toISOString()
    };
    setEvmClients((prev) => [...prev, client]);
    setEvmClientId("");
    setMessage({ type: "success", text: `EVM client ${client.clientId} initialized` });
  };

  const toggleEvmAllowed = (id: string) => {
    setEvmClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, allowed: !c.allowed } : c))
    );
  };

  const signEvmCertificate = () => {
    setCertSigned(true);
    setMessage({ type: "success", text: "EVM certificate signed" });
  };

  const setVoterAllowance = (allowed: boolean) => {
    setVoterAllowed(allowed);
    setMessage({
      type: "success",
      text: allowed ? "Voters allowed to vote" : "Voters disallowed (cannot change during election)"
    });
  };

  return (
    <main className="page">
      <header className="card election-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="election-title">Election Staff</h1>
          <p className="election-meta">Election ID: {electionId}</p>
        </div>
        <button type="button" className="remove-btn" onClick={onLogout}>Logout</button>
      </header>

      {message && (
        <div className={`card ${message.type === "success" ? "success-receipt" : ""}`}>
          <p className={message.type === "error" ? "error-text" : "success-title"}>{message.text}</p>
        </div>
      )}

      <section className="card">
        <h2 className="section-title">1. Candidate Details</h2>
        <p className="section-desc">Add candidates with name, age, and date of birth. Upload a PDF to auto-fill.</p>
        {showAddForm ? (
          <AddCandidateForm
            onAdd={addCandidate}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <button
            type="button"
            className="submit-button"
            style={{ marginTop: 0 }}
            onClick={() => setShowAddForm(true)}
          >
            Add Candidate
          </button>
        )}
        {candidates.length > 0 && (
          <ul className="candidate-list-staff" style={{ marginTop: 16 }}>
            {candidates.map((c) => (
              <li key={c.id} className="candidate-item-staff">
                <span>{c.name}{c.age != null && `, ${c.age}`}{c.dob && ` (${c.dob})`}</span>
                <button type="button" className="remove-btn" onClick={() => removeCandidate(c.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2 className="section-title">2. Sign EVM Certificate</h2>
        <p className="section-desc">Sign the certificate for the EVM to verify authenticity.</p>
        <button
          type="button"
          className="submit-button"
          style={{ marginTop: 12 }}
          onClick={signEvmCertificate}
          disabled={certSigned}
        >
          {certSigned ? "Certificate Signed" : "Sign EVM Certificate"}
        </button>
      </section>

      <section className="card">
        <h2 className="section-title">3. Allow / Disallow Voters</h2>
        <p className="section-desc">
          Enable or disable voting. This cannot be changed during the election.
        </p>
        <div className="voter-toggle">
          <button
            type="button"
            className={`toggle-btn ${voterAllowed ? "active" : ""}`}
            onClick={() => setVoterAllowance(true)}
          >
            Allow
          </button>
          <button
            type="button"
            className={`toggle-btn ${!voterAllowed ? "active" : ""}`}
            onClick={() => setVoterAllowance(false)}
          >
            Disallow
          </button>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">4. Valid EVM Clients</h2>
        <p className="section-desc">Initialize and manage the list of valid EVM clients (stored on your DB).</p>
        <label className="input-label">EVM client ID</label>
        <input
          type="text"
          className="text-input"
          placeholder="Enter EVM client ID"
          value={evmClientId}
          onInput={(e) => setEvmClientId((e.target as HTMLInputElement).value)}
        />
        <button type="button" className="submit-button" style={{ marginTop: 12 }} onClick={addEvmClient}>
          Initialize EVM Client
        </button>
        {evmClients.length > 0 && (
          <ul className="evm-list">
            {evmClients.map((c) => (
              <li key={c.id} className="evm-item">
                <span>{c.clientId}</span>
                <button
                  type="button"
                  className={`toggle-btn small ${c.allowed ? "active" : ""}`}
                  onClick={() => toggleEvmAllowed(c.id)}
                >
                  {c.allowed ? "Allowed" : "Disabled"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default function StaffPage() {
  const [step, setStep] = useState<"login" | "electionId" | "dashboard">("login");
  const [electionId, setElectionId] = useState("");

  if (step === "login") {
    return <StaffLoginPage onLoginSuccess={() => setStep("electionId")} />;
  }

  if (step === "electionId") {
    return (
      <StaffElectionIdGate
        onElectionIdVerified={(id) => {
          setElectionId(id);
          setStep("dashboard");
        }}
      />
    );
  }

  return (
    <StaffDashboard
      electionId={electionId}
      onLogout={() => {
        setStep("login");
        setElectionId("");
      }}
    />
  );
}
