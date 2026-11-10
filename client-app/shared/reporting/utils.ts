// Date bounds of the report's month windows: built on the user's clock, sent as UTC instants.

/** Epoch ms of a moment on the user's clock. */
export const local = (year: number, month: number, day: number, hours = 0, minutes = 0, seconds = 0, ms = 0): number =>
  new Date(year, month, day, hours, minutes, seconds, ms).getTime();

/** End of a day on the user's clock: the inclusive upper bound every "to" window uses. */
export const eod = (year: number, month: number, day: number): number => local(year, month, day, 23, 59, 59, 999);

/** Every bound leaves here as a UTC instant; only where the user's day starts differs from UTC's. */
export const iso = (ms: number): string => new Date(ms).toISOString();
