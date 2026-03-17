import { ValidationError } from "../errors/AppError";

export function ensureObject(value: unknown, fieldName: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an object`);
  }

  return value as Record<string, unknown>;
}

export function ensureString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} must be a non-empty string`);
  }

  return value;
}

export function ensureOptionalString(value: unknown, fieldName: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return ensureString(value, fieldName);
}

export function ensureNullableString(value: unknown, fieldName: string): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  return ensureString(value, fieldName);
}

export function validateDateString(value: string, fieldName: string): void {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw new ValidationError(`${fieldName} must be a valid date-time string`);
  }
}

export function parsePositiveInteger(value: unknown, fieldName: string): number {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} must be a positive integer`);
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ValidationError(`${fieldName} must be a positive integer`);
  }

  return parsed;
}

export function readQueryParam(
  query: Record<string, unknown>,
  key: string
): string | undefined {
  const value = query[key];
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    throw new ValidationError(`Query parameter '${key}' must appear at most once`);
  }

  return ensureString(value, key);
}

export function isSqliteUniqueConstraintError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const candidate = error as { code?: string; message?: string };
  return (
    candidate.code === "SQLITE_CONSTRAINT" &&
    typeof candidate.message === "string" &&
    candidate.message.includes("UNIQUE")
  );
}
