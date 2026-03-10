import { useState } from "preact/hooks";
import Captcha from "../shared/components/Captcha";
import OtpInput from "../shared/components/OtpInput";

interface CommissionerLoginPageProps {
  onLoginSuccess: () => void;
}

export default function CommissionerLoginPage({ onLoginSuccess }: CommissionerLoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"creds" | "mfa">("creds");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleCredsSubmit = () => {
    if (!email.trim() || !password.trim()) {
      setError("Enter email and password");
      return;
    }
    if (!captchaVerified) {
      setError("Complete captcha verification");
      return;
    }
    setError("");
    setStep("mfa");
  };

  const handleMfaComplete = (code: string) => {
    // Simulated: any 6-digit OTP "passes" (backend would verify)
    if (code.length === 6) {
      onLoginSuccess();
    }
  };

  return (
    <main className="page login-page">
      <header className="card election-header">
        <h1 className="election-title">Election Commissioner</h1>
        <p className="election-meta">Login</p>
      </header>

      {step === "creds" ? (
        <div className="card">
          <h2 className="section-title">Sign in</h2>
          <label className="input-label">Email</label>
          <input
            type="email"
            className="text-input"
            placeholder="commissioner@election.gov"
            value={email}
            onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
            style={{ marginBottom: 12 }}
          />
          <label className="input-label">Password</label>
          <input
            type="password"
            className="text-input"
            placeholder="••••••••"
            value={password}
            onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
            style={{ marginBottom: 16 }}
          />

          <p className="input-label">Captcha</p>
          <Captcha onVerify={setCaptchaVerified} verified={captchaVerified} />

          {error && <p className="error-text" style={{ marginTop: 12 }}>{error}</p>}
          <button
            type="button"
            className="submit-button"
            style={{ marginTop: 16 }}
            onClick={handleCredsSubmit}
          >
            Continue
          </button>
        </div>
      ) : (
        <div className="card">
          <h2 className="section-title">Multi-factor authentication</h2>
          <p className="section-desc">Enter the 6-digit code from your authenticator app.</p>
          <OtpInput
            digits={6}
            value={otp}
            onChange={setOtp}
            onComplete={handleMfaComplete}
          />
          <button
            type="button"
            className="submit-button"
            onClick={() => handleMfaComplete(otp)}
            disabled={otp.length !== 6}
          >
            Verify & Login
          </button>
        </div>
      )}
    </main>
  );
}
