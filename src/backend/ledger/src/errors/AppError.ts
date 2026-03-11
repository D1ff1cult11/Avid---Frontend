export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    options: { statusCode: number; code: string; details?: Record<string, unknown> }
  ) {
    super(message);
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, { statusCode: 400, code: "VALIDATION_ERROR", details });
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, { statusCode: 404, code: "NOT_FOUND", details });
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, { statusCode: 409, code: "CONFLICT", details });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, { statusCode: 401, code: "UNAUTHORIZED", details });
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, { statusCode: 403, code: "FORBIDDEN", details });
  }
}
