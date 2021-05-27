const defaultLogger = {
  debug: (message: any, ...args) => console.log('[VC][debug]', message, ...args),
  info: (message: any, ...args) => console.log('[VC][info]', message, ...args),
  warn: (message: any, ...args) => console.log('[VC][warn]', message, ...args),
  error: (message: any, ...args) => console.log('[VC][error]', message, ...args)
};

export default defaultLogger;
