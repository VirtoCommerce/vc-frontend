import { TLogger } from "./logger.type";
import { noop } from "@vueuse/core";

const logger: TLogger = {
  debug: noop,
  info: noop,
  warn: noop,
  error: noop,
};

export default logger;
