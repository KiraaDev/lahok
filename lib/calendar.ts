const TIME_ZONE = "Asia/Manila";
const MONTH_PARAM = /^\d{4}-(0[1-9]|1[0-2])$/;

const pad = (n: number) => String(n).padStart(2, "0");

const dayParts = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function keyOf(date: Date) {
  const p = Object.fromEntries(
    dayParts.formatToParts(date).map((part) => [part.type, part.value])
  );
  return `${p.year}-${p.month}-${p.day}`;
}

export function dateKey(iso: string) {
  return keyOf(new Date(iso));
}

export function getTodayKey() {
  return keyOf(new Date());
}

export function resolveMonth(param: string | undefined, todayKey: string) {
  const value = param && MONTH_PARAM.test(param) ? param : todayKey.slice(0, 7);
  const [year, month] = value.split("-").map(Number);
  return { year, month, value };
}

export function shiftMonth(value: string, delta: number) {
  const [year, month] = value.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

export function monthRange(year: number, month: number) {
  const current = `${year}-${pad(month)}`;
  const from = new Date(`${current}-01T00:00:00+08:00`);
  const to = new Date(`${shiftMonth(current, 1)}-01T00:00:00+08:00`);
  return { from: from.toISOString(), to: to.toISOString() };
}

export type DayCell = { key: string; day: number; inMonth: boolean };

export function buildMonthGrid(year: number, month: number): DayCell[][] {
  const lead = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const total = Math.ceil((lead + daysInMonth) / 7) * 7;

  const cells: DayCell[] = [];
  for (let i = 0; i < total; i++) {
    const d = new Date(Date.UTC(year, month - 1, 1 - lead + i));
    cells.push({
      key: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
      day: d.getUTCDate(),
      inMonth: d.getUTCMonth() === month - 1,
    });
  }

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}