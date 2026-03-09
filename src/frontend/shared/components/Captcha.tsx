import { useRef } from "preact/hooks";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { HCAPTCHA_SITEKEY } from "../config/hcaptcha";

const HCaptchaWidget = HCaptcha as any;

interface CaptchaProps {
  onVerify: (verified: boolean) => void;
  verified?: boolean;
}

export default function Captcha({ onVerify, verified = false }: CaptchaProps) {
  const captchaRef = useRef<unknown>(null);

  const handleVerify = (_token: string) => {
    onVerify(true);
  };

  const handleExpire = () => {
    onVerify(false);
  };

  const handleError = () => {
    onVerify(false);
  };

  if (verified) {
    return (
      <div className="captcha-box captcha-verified">
        <span className="success-title">✓ Captcha verified</span>
      </div>
    );
  }

  return (
    <div className="captcha-box">
      <HCaptchaWidget
        ref={captchaRef}
        sitekey={HCAPTCHA_SITEKEY}
        onVerify={handleVerify}
        onExpire={handleExpire}
        onError={handleError}
        theme="light"
      />
    </div>
  );
}
