type Cell = string | number | null | undefined;

const FORMULA_START = /^[=+\-@\t\r]/;

function csvCell(value: Cell) {
  let text = value === null || value === undefined ? "" : String(value);
  if (FORMULA_START.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function buildCsv(rows: Cell[][]) {
  const body = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  return `\uFEFF${body}\r\n`;
}