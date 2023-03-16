import { IS_DEVELOPMENT } from "../../constants";
import loggerDev from "./logger.dev";
import loggerProd from "./logger.prod";

const Logger = IS_DEVELOPMENT ? loggerDev : loggerProd;

export { Logger };
