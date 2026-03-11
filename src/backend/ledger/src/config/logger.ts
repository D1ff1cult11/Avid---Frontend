type LogLevel = "INFO" | "WARN" | "ERROR";

function emit(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const payload = {
    level,
    message,
    time: new Date().toISOString(),
    ...(context ? { context } : {})
  };

  const line = JSON.stringify(payload);
  if (level === "ERROR") {
    console.error(line);
    return;
  }

  console.log(line);
}

export const logger = {
  info(message: string, context?: Record<string, unknown>): void {
    emit("INFO", message, context);
  },
  warn(message: string, context?: Record<string, unknown>): void {
    emit("WARN", message, context);
  },
  error(message: string, context?: Record<string, unknown>): void {
    emit("ERROR", message, context);
  }
};
