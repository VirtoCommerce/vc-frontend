import { IS_DEVELOPMENT } from "../../constants";
import { logger as loggerDev } from "./logger.dev";
import { logger as loggerProd } from "./logger.prod";

const Logger = IS_DEVELOPMENT ? loggerDev : loggerProd;

export { Logger };
