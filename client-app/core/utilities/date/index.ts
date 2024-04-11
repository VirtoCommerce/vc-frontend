/**
 * Converts ISO 8601 date-only (YYYY-MM-DD) to full date (YYYY-MM-DDTHH:mm:ss.sssZ)
 * @param dateOnly ISO 8601 date without time (YYYY-MM-DD)
 * @returns ISO 8601 date with time (YYYY-MM-DDTHH:mm:ss.sssZ)
 */
export function toStartDateFilterValue(dateOnly?: string): string | undefined {
  if (dateOnly) {
    return toDateObject(dateOnly).toISOString();
  }
}

/**
 * Converts ISO 8610 date-only (YYYY-MM-DD) to full date (YYYY-MM-DDTHH:mm:ss.sssZ) and adds 1 day without 1 millisecond
 * @param dateOnly ISO 8601 date without time (YYYY-MM-DD)
 * @returns ISO 8601 date with time (YYYY-MM-DDTHH:mm:ss.sssZ) + 1 day - 1 millisecond (means full day of 13 Dec)
 */
export function toEndDateFilterValue(dateOnly?: string): string | undefined {
  if (dateOnly) {
    let date = toDateObject(dateOnly);
    date.setDate(date.getDate() + 1);
    date = new Date(date.getTime() - 1);
    return date.toISOString();
  }
}

export function toDateISOString(isoDate: string): string {
  return isoDate.split("T")[0];
}

function toLocalMidnight(dateOnly: string): string {
  return `${dateOnly}T00:00:00.000`;
}

function toDateObject(dateOnly: string): Date {
  const timestamp = Date.parse(toLocalMidnight(dateOnly));
  return new Date(timestamp);
}
