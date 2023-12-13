export function addTimeToStartDate(dateOnly?: string): string | undefined {
  if (dateOnly) {
    return toDateObject(dateOnly).toISOString();
  }
}

export function addTimeToEndDate(dateOnly?: string): string | undefined {
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
