import { useRef } from "preact/hooks";

interface OtpInputProps {
  digits?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
}

export default function OtpInput({
  digits = 6,
  value,
  onChange,
  onComplete,
  disabled = false
}: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const chars = value.split("").concat(Array(digits).fill("")).slice(0, digits);

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, "").slice(-1);
    const next = chars.slice();
    next[index] = digit;
    const combined = next.join("");
    onChange(combined);
    if (digit && index < digits - 1) {
      inputs.current[index + 1]?.focus();
    }
    if (combined.length === digits && onComplete) {
      onComplete(combined);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === "Backspace" && !chars[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pasted = (e.clipboardData?.getData("text") || "").replace(/\D/g, "").slice(0, digits);
    const next = chars.slice();
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    onChange(next.join(""));
    const focusIndex = Math.min(pasted.length, digits - 1);
    inputs.current[focusIndex]?.focus();
    if (pasted.length === digits && onComplete) {
      onComplete(pasted);
    }
  };

  return (
    <div className="otp-input-wrap">
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className="otp-digit"
          value={c}
          disabled={disabled}
          onInput={(e) => handleChange(i, (e.target as HTMLInputElement).value)}
          onKeyDown={(e) => handleKeyDown(i, e as unknown as KeyboardEvent)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
