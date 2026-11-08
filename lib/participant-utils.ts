import {
  AGE_GROUPS,
  AGE_GROUP_RANGES,
  type AgeGroup,
} from "@/types/participant";

const pad = (n: number) => String(n).padStart(2, "0");

const isLeapYear = (year: number) =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

function parseKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return { year, month, day };
}

export function calculateAge(birthdate: string, todayKey: string) {
  const b = parseKey(birthdate);
  const t = parseKey(todayKey);
  let age = t.year - b.year;
  if (t.month < b.month || (t.month === b.month && t.day < b.day)) age -= 1;
  return Math.max(age, 0);
}

export function getAgeGroup(age: number): AgeGroup {
  for (const group of AGE_GROUPS) {
    const { min, max } = AGE_GROUP_RANGES[group];
    if (age >= min && (max === null || age <= max)) return group;
  }
  return "senior";
}

export function subtractYears(key: string, years: number) {
  const { year, month, day } = parseKey(key);
  const target = year - years;
  const safeDay = month === 2 && day === 29 && !isLeapYear(target) ? 28 : day;
  return `${target}-${pad(month)}-${pad(safeDay)}`;
}

export function birthdateBounds(group: AgeGroup, todayKey: string) {
  const { min, max } = AGE_GROUP_RANGES[group];
  return {
    onOrBefore: subtractYears(todayKey, min),
    after: max === null ? undefined : subtractYears(todayKey, max + 1),
  };
}

type NameParts = {
  first_name: string;
  middle_name: string | null;
  last_name: string;
};

export function formatFullName(p: NameParts) {
  return [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(" ");
}

export function formatListName(p: NameParts) {
  const middle = p.middle_name ? ` ${p.middle_name.charAt(0).toUpperCase()}.` : "";
  return `${p.last_name}, ${p.first_name}${middle}`;
}

export function getInitials(p: Pick<NameParts, "first_name" | "last_name">) {
  return (p.first_name.charAt(0) + p.last_name.charAt(0)).toUpperCase() || "?";
}