import { assertEquals, assertStringIncludes, assertThrows } from "jsr:@std/assert";
import { getNowIso, parseArgs, renderChangelogObject, wantsHelp } from "./changelog-object.ts";

Deno.test("parseArgs parses summary and options", () => {
  const args = parseArgs([
    "--summary",
    "Fix typo",
    "--date",
    "2026-02-15T11:00:00.000+09:00[Asia/Tokyo]",
    "--timezone",
    "Asia/Tokyo",
  ]);

  assertEquals(args.summary, "Fix typo");
  assertEquals(args.date, "2026-02-15T11:00:00.000+09:00[Asia/Tokyo]");
  assertEquals(args.timezone, "Asia/Tokyo");
});

Deno.test("parseArgs throws for missing summary", () => {
  assertThrows(() => parseArgs(["--date", "2026-02-15T11:00:00.000+09:00[Asia/Tokyo]"]), Error, "--summary is required");
});

Deno.test("wantsHelp returns true for help flags", () => {
  assertEquals(wantsHelp(["--help"]), true);
  assertEquals(wantsHelp(["-h"]), true);
  assertEquals(wantsHelp(["--summary", "test"]), false);
});

Deno.test("renderChangelogObject renders yaml list object", () => {
  const out = renderChangelogObject({
    summary: "Fix typo",
    date: "2026-02-15T11:00:00.000+09:00[Asia/Tokyo]",
    timezone: "Asia/Tokyo",
  });

  assertStringIncludes(out, '  - summary: "Fix typo"');
  assertStringIncludes(out, '    date: "2026-02-15T11:00:00.000+09:00[Asia/Tokyo]"');
});

Deno.test("getNowIso returns timezone-bracket format", () => {
  const out = getNowIso("Asia/Tokyo");
  assertEquals(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}\[Asia\/Tokyo\]/.test(out), true);
});
