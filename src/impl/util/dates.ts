export function utcDate(year: number, month: number, date: number, hours?: number, minutes?: number, seconds?: number, ms?: number): Date {
  const ts = ms ? Date.UTC(year, month, date, hours, minutes, seconds, ms)
    : seconds ? Date.UTC(year, month, date, hours, minutes, seconds)
      : minutes ? Date.UTC(year, month, date, hours, minutes)
        : hours ? Date.UTC(year, month, date, hours)
          : Date.UTC(year, month, date);
  return new Date(ts)
}