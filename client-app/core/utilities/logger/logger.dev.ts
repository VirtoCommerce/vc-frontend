/* eslint-disable no-console */
import type { LoggerType } from "./logger.type";

export const logger: LoggerType = {
  debug: (message, ...args): void => console.debug("[VC][debug]", message, ...args),
  info: (message, ...args): void => console.log("[VC][info]", message, ...args),
  warn: (message, ...args): void => console.warn("[VC][warn]", message, ...args),
  error: (message, ...args): void => console.error("[VC][error]", message, ...args),
};
