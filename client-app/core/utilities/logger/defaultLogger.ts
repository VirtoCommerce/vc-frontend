const defaultLogger = {
  debug: (message: string | unknown, ...args: unknown[]): void => console.debug("[VC][debug]", message, ...args),
  info: (message: string | unknown, ...args: unknown[]): void => console.log("[VC][info]", message, ...args),
  warn: (message: string | unknown, ...args: unknown[]): void => console.warn("[VC][warn]", message, ...args),
  error: (message: string | unknown, ...args: unknown[]): void => console.error("[VC][error]", message, ...args),
};

export default defaultLogger;
