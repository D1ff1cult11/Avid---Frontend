import { useState } from "preact/hooks";
import type { Candidate } from "../EVMClient/types/election";
import {
  extractTextFromPdf,
  parseCandidateFromText,
  type ParsedCandidate
} from "../shared/utils/pdfParser";

interface AddCandidateFormProps {
  onAdd: (candidate: Omit<Candidate, "id">) => void;
  onCancel?: () => void;
}

export default function AddCandidateForm({ onAdd, onCancel }: AddCandidateFormProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");

  const handlePdfChange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file || file.type !== "application/pdf") {
      setError("Please select a valid PDF file");
      return;
    }
    setPdfFile(file);
    setError("");
    setParsing(true);
    try {
      const text = await extractTextFromPdf(file);
      const parsed: ParsedCandidate = parseCandidateFromText(text);
      if (parsed.name) setName(parsed.name);
      if (parsed.age) setAge(String(parsed.age));
      if (parsed.dob) setDob(parsed.dob);
    } catch (err) {
      setError("Failed to parse PDF");
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setError("");
    const candidate: Omit<Candidate, "id"> = {
      name: name.trim(),
      ...(age.trim() && { age: parseInt(age, 10) }),
      ...(dob.trim() && { dob: dob.trim() })
    };
    onAdd(candidate);
    setName("");
    setAge("");
    setDob("");
    setPdfFile(null);
  };

  return (
    <div className="card add-candidate-form">
      <h3 className="section-title">Add Candidate</h3>

      <div
        className={`pdf-upload-zone ${pdfFile ? "has-file" : ""}`}
        onClick={() => document.getElementById("pdf-input")?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && document.getElementById("pdf-input")?.click()}
      >
        <input
          id="pdf-input"
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          onChange={handlePdfChange}
        />
        {parsing ? (
          <p>Parsing PDF…</p>
        ) : pdfFile ? (
          <p>✓ {pdfFile.name} — Edit fields below if needed</p>
        ) : (
          <p>Click to upload PDF (extracts name, age, DOB)</p>
        )}
      </div>

      <label className="input-label">Name *</label>
      <input
        type="text"
        className="text-input"
        placeholder="Candidate name"
        value={name}
        onInput={(e) => setName((e.target as HTMLInputElement).value)}
      />

      <label className="input-label">Age</label>
      <input
        type="number"
        className="text-input"
        placeholder="Age"
        min={18}
        max={120}
        value={age}
        onInput={(e) => setAge((e.target as HTMLInputElement).value)}
      />

      <label className="input-label">Date of birth</label>
      <input
        type="text"
        className="text-input"
        placeholder="e.g. DD/MM/YYYY"
        value={dob}
        onInput={(e) => setDob((e.target as HTMLInputElement).value)}
      />

      {error && <p className="error-text">{error}</p>}

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button type="button" className="submit-button" onClick={handleSubmit}>
          Add Candidate
        </button>
        {onCancel && (
          <button type="button" className="toggle-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
