export const studentImportHeaders = [
  "name",
  "email",
  "phone",
  "studentNumber",
  "batchCode",
  "accessStartsAt",
  "accessEndsAt",
] as const;

export interface StudentImportRow {
  row: number;
  name: string;
  email: string;
  phone: string;
  studentNumber: string;
  batchCode: string;
  accessStartsAt: string;
  accessEndsAt: string;
  errors: string[];
}

function parseLine(line: string) {
  const values: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && quoted && line[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) {
      values.push(value.trim());
      value = "";
    } else value += character;
  }
  values.push(value.trim());
  return values;
}

export function parseStudentImportCsv(csv: string): StudentImportRow[] {
  const lines = csv
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());
  if (!lines.length) return [];
  const headers = parseLine(lines[0] ?? "");
  const indexes = new Map(headers.map((header, index) => [header, index]));

  return lines.slice(1).map((line, index) => {
    const values = parseLine(line);
    const get = (header: (typeof studentImportHeaders)[number]) =>
      values[indexes.get(header) ?? -1]?.trim() ?? "";
    const row: StudentImportRow = {
      row: index + 2,
      name: get("name"),
      email: get("email").toLowerCase(),
      phone: get("phone"),
      studentNumber: get("studentNumber").toUpperCase(),
      batchCode: get("batchCode").toUpperCase(),
      accessStartsAt: get("accessStartsAt"),
      accessEndsAt: get("accessEndsAt"),
      errors: [],
    };
    if (row.name.length < 2) row.errors.push("Name is required");
    if (!/^\S+@\S+\.\S+$/.test(row.email)) row.errors.push("Invalid email");
    if (!row.studentNumber) row.errors.push("Student number is required");
    if (!row.batchCode) row.errors.push("Batch code is required");
    if (row.accessStartsAt && Number.isNaN(Date.parse(row.accessStartsAt)))
      row.errors.push("Invalid access start date");
    if (row.accessEndsAt && Number.isNaN(Date.parse(row.accessEndsAt)))
      row.errors.push("Invalid access end date");
    if (
      row.accessStartsAt &&
      row.accessEndsAt &&
      Date.parse(row.accessEndsAt) < Date.parse(row.accessStartsAt)
    )
      row.errors.push("Access end precedes start");
    return row;
  });
}

export function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
