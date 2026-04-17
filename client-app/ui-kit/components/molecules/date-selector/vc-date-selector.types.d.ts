declare global {
  type VcDateSelectorEventSourceType = "input" | "picker" | "blur";

  type VcDateSelectorEventType = {
    /** Date value in YYYY-MM-DD format, or empty string when incomplete */
    value: string;
    /** True when all date segments are filled (value !== "") */
    complete: boolean;
    /** True when complete AND within min/max bounds */
    valid: boolean;
    /** What triggered this event */
    eventSource: VcDateSelectorEventSourceType;
  };
}

export {};
