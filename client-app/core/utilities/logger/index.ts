import { DEVELOPMENT } from "@/core";
import loggerDev from "./logger.dev";
import loggerProd from "./logger.prod";

const Logger = DEVELOPMENT ? loggerDev : loggerProd;

export { Logger };
