export function startDateToString(dateOnly?: string): string | undefined {
  if (dateOnly) {
    return toDate(dateOnly).toISOString();
  }
}

export function endDateToString(dateOnly?: string): string | undefined {
  if (dateOnly) {
    const date = toDate(dateOnly);
    date.setDate(date.getDate() + 1);
    return date.toISOString();
  }
}

function toLocalMidnight(dateOnly: string): string {
  return `${dateOnly}T00:00:00.000`;
}

function toDate(dateOnly: string): Date {
  const timestamp = Date.parse(toLocalMidnight(dateOnly));
  return new Date(timestamp);
}
