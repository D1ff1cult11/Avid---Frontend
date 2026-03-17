import dotenv from "dotenv";

dotenv.config();

export interface EnvConfig {
  port: number;
  sqliteDbPath: string;
  ecPublicKeyPem: string;
}

function normalizePem(input: string): string {
  return input.replace(/\\n/g, "\n").trim();
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function loadEnvConfig(): EnvConfig {
  const portRaw = process.env.PORT ?? "3000";
  const port = Number.parseInt(portRaw, 10);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid PORT value: ${portRaw}`);
  }

  return {
    port,
    sqliteDbPath: process.env.SQLITE_DB_PATH?.trim() || "./ledger.db",
    ecPublicKeyPem: normalizePem(requireEnv("EC_PUBLIC_KEY_PEM"))
  };
}
