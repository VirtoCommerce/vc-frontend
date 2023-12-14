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
 * Adds one day and converts ISO 8610 date-only (YYYY-MM-DD) to full date (YYYY-MM-DDTHH:mm:ss.sssZ)
 * @param dateOnly ISO 8601 date without time (YYYY-MM-DD)
 * @returns ISO 8601 date with time (YYYY-MM-DDTHH:mm:ss.sssZ) + 1 day (so from [13 Dec to 14 Dec) means full day of 13 Dec)
 */
export function toEndDateFilterValue(dateOnly?: string): string | undefined {
  if (dateOnly) {
    const date = toDateObject(dateOnly);
    date.setDate(date.getDate() + 1);
    return date.toISOString();
  }
}

function toLocalMidnight(dateOnly: string): string {
  return `${dateOnly}T00:00:00.000`;
}

function toDateObject(dateOnly: string): Date {
  const timestamp = Date.parse(toLocalMidnight(dateOnly));
  return new Date(timestamp);
}
