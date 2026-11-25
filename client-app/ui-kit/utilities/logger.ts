type VcLoggerType = {
  debug: (message: unknown, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
};

let current: VcLoggerType = console;

/**
 * Routes the kit's logging to the app's logger; without it the kit logs to `console`. Call it before
 * anything else of the kit runs: utilities such as `getLocales` log outside components.
 */
export function setLogger(logger: VcLoggerType): void {
  current = logger;
}

export const Logger: VcLoggerType = {
  debug: (message, ...args) => current.debug(message, ...args),
  info: (message, ...args) => current.info(message, ...args),
  warn: (message, ...args) => current.warn(message, ...args),
  error: (message, ...args) => current.error(message, ...args),
};
