declare global {
  type VcCalendarSizeType = "xs" | "sm" | "md";

  type VcCalendarFirstDayOfWeekType = 0 | 1 | 2 | 3 | 4 | 5 | 6;

  type VcCalendarWeekdayFormatType = "narrow" | "short";

  type VcCalendarDisabledDateType = (date: string) => boolean;
}

export {};
