export function monthRange(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, monthIndex - 1, 1));
  const end = new Date(Date.UTC(year, monthIndex, 1));
  return { start, end };
}

export function dateOnly(value: string | Date) {
  const date = new Date(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function todayDateOnly() {
  return dateOnly(new Date());
}

export function currentMonthValue() {
  return new Date().toISOString().slice(0, 7);
}
