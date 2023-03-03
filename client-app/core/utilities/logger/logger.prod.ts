import { noop } from "@vueuse/core";
import { LoggerType } from "./logger.type";

const logger: LoggerType = {
  debug: noop,
  info: noop,
  warn: noop,
  error: noop,
};

export default logger;
