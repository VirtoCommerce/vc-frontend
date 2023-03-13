import { noop } from "@vueuse/core";
import type { LoggerType } from "./logger.type";

const logger: LoggerType = {
  debug: noop,
  info: noop,
  warn: noop,
  error: noop,
};

export default logger;
