/**
 * hCaptcha site key. Set VITE_HCAPTCHA_SITEKEY in .env for production.
 * Get your key at https://dashboard.hcaptcha.com
 */
export const HCAPTCHA_SITEKEY =
  import.meta.env.VITE_HCAPTCHA_SITEKEY || "10000000-ffff-ffff-ffff-000000000001";
