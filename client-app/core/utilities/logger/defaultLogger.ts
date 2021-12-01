const defaultLogger = {
  debug: (message: string | unknown, ...args: unknown[]): void => console.log("[VC][debug]", message, ...args),
  info: (message: string | unknown, ...args: unknown[]): void => console.log("[VC][info]", message, ...args),
  warn: (message: string | unknown, ...args: unknown[]): void => console.log("[VC][warn]", message, ...args),
  error: (message: string | unknown, ...args: unknown[]): void => console.log("[VC][error]", message, ...args),
};

export default defaultLogger;
