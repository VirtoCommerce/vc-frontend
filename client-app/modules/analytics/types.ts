/** Where and when the action happened, for a caller that reports it later than it happened. */
export type CaptureOptionsType = { path?: string; occurredAt?: Date };

export type CaptureType = (
  eventName: string,
  properties?: Record<string, unknown>,
  options?: CaptureOptionsType,
) => void;
