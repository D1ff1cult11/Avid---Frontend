interface VoterIdInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function VoterIdInput({ value, onChange }: VoterIdInputProps) {
  return (
    <section className="card">
      <label className="input-label" htmlFor="voterId">
        Enter Voter ID
      </label>
      <input
        id="voterId"
        className="text-input"
        type="text"
        autoComplete="off"
        value={value}
        onInput={(event) =>
          onChange((event.currentTarget as HTMLInputElement).value)
        }
        placeholder="Voter Identification Number"
      />
    </section>
  );
}
