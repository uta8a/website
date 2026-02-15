#!/usr/bin/env -S deno run -A
export type Args = {
  summary: string;
  date?: string;
  timezone: string;
};

export const HELP_TEXT = `changelog-object

Usage:
  deno run -A scripts/changelog-object.ts --help
  deno run -A scripts/changelog-object.ts -h
  deno run -A scripts/changelog-object.ts --summary <text> [options]

Required:
  (help表示時は不要)
  --summary       changelog summary text

Options:
  --date          ISO 8601 date string (default: now)
  --timezone      IANA timezone (default: Asia/Tokyo)
  --help, -h      show this help
`;

export function wantsHelp(raw: string[]): boolean {
  return raw.includes("--help") || raw.includes("-h");
}

export function parseArgs(raw: string[]): Args {
  const map = new Map<string, string>();
  for (let i = 0; i < raw.length; i += 1) {
    const token = raw[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const value = raw[i + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`missing value for --${key}`);
    }
    map.set(key, value);
    i += 1;
  }

  const summary = map.get("summary");
  const date = map.get("date");
  const timezone = map.get("timezone") ?? "Asia/Tokyo";

  if (!summary) throw new Error("--summary is required");
  return { summary, date, timezone };
}

function getOffset(date: Date, timezone: string): string {
  const part = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
  }).formatToParts(date).find((p) => p.type === "timeZoneName")?.value;

  if (!part || part === "GMT") return "+00:00";

  const match = part.match(/^GMT([+-])(\d{1,2})(?::?(\d{2}))?$/);
  if (!match) {
    throw new Error(`failed to parse timezone offset: ${part}`);
  }

  const sign = match[1];
  const hour = match[2].padStart(2, "0");
  const minute = (match[3] ?? "00").padStart(2, "0");
  return `${sign}${hour}:${minute}`;
}

export function getNowIso(timezone: string): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
    hourCycle: "h23",
  }).formatToParts(now);

  const values = Object.fromEntries(parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value]));
  const offset = getOffset(now, timezone);

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}.${values.fractionalSecond}${offset}[${timezone}]`;
}

export function renderChangelogObject(args: Args): string {
  const date = args.date ?? getNowIso(args.timezone);
  return `  - summary: ${JSON.stringify(args.summary)}\n    date: ${JSON.stringify(date)}`;
}

async function main(): Promise<void> {
  if (wantsHelp(Deno.args)) {
    console.log(HELP_TEXT);
    return;
  }
  const args = parseArgs(Deno.args);
  console.log(renderChangelogObject(args));
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    Deno.exit(1);
  }
}
