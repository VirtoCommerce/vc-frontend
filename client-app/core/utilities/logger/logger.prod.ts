import { noop } from "@vueuse/core";
import { TLogger } from "./logger.type";

const logger: TLogger = {
  debug: noop,
  info: noop,
  warn: noop,
  error: noop,
};

export default logger;
