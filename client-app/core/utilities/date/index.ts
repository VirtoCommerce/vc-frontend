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

/**
 * @description Check if the string is a valid ISO 8601 date string
 * @param str string to check
 * @returns true if the string is a valid ISO 8601 date string, otherwise false
 */
export function isDateString(str: string): boolean {
  const date = new Date(str);
  return !Number.isNaN(date.valueOf()) && date.toISOString() === str;
}

/**
 * Validates credit card expiration date (month/year).
 * Accepts month as MM and year as YY or YYYY. Checks that the date is not in the past.
 */
export function isExpirationDateValid(month?: string, year?: string): boolean {
  if (!month || !year) {
    return false;
  }
  if (month.length !== 2 || !/^\d{2}$/.test(month)) {
    return false;
  }
  const m = Number(month);
  if (m < 1 || m > 12) {
    return false;
  }
  if (!(year.length === 2 || year.length === 4) || !/^\d{2,4}$/.test(year)) {
    return false;
  }
  const fullYear = year.length === 2 ? Number(`20${year}`) : Number(year);
  if (Number.isNaN(fullYear) || fullYear < 2000) {
    return false;
  }
  const expDate = new Date(fullYear, m - 1, 1);
  const currentDate = new Date();
  currentDate.setDate(1);
  currentDate.setHours(0, 0, 0, 0);
  return expDate >= currentDate;
}
