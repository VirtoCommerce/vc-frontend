import { IS_DEVELOPMENT } from "@/core/constants/environment";
import loggerDev from "./logger.dev";
import loggerProd from "./logger.prod";

const Logger = IS_DEVELOPMENT ? loggerDev : loggerProd;

export { Logger };
