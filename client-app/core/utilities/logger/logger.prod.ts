import { noop } from "@vueuse/core";
import type { LoggerType } from "./logger.type";

export const logger: LoggerType = {
  debug: noop,
  info: noop,
  warn: noop,
  error: noop,
};
