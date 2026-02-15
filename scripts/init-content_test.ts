import { assertEquals, assertStringIncludes, assertThrows } from "jsr:@std/assert";
import { parseArgs, renderTemplate, wantsHelp } from "./init-content.ts";

Deno.test("parseArgs parses required and optional args", () => {
  const args = parseArgs([
    "--domain",
    "chotto.uta8a.net",
    "--slug",
    "2026-02-15-test-post",
    "--type",
    "diary",
    "--title",
    "Hello",
    "--description",
    "Desc",
    "--draft",
    "true",
    "--tags",
    "a,b",
  ]);

  assertEquals(args.domain, "chotto.uta8a.net");
  assertEquals(args.slug, "2026-02-15-test-post");
  assertEquals(args.type, "diary");
  assertEquals(args.title, "Hello");
  assertEquals(args.description, "Desc");
  assertEquals(args.draft, true);
  assertEquals(args.tags, ["a", "b"]);
  assertEquals(args.timezone, "Asia/Tokyo");
});

Deno.test("parseArgs throws for missing required args", () => {
  assertThrows(() => parseArgs(["--domain", "chotto.uta8a.net"]), Error, "--slug is required");
});

Deno.test("wantsHelp returns true for help flags", () => {
  assertEquals(wantsHelp(["--help"]), true);
  assertEquals(wantsHelp(["-h"]), true);
  assertEquals(wantsHelp(["--domain", "chotto.uta8a.net"]), false);
});

Deno.test("renderTemplate includes frontmatter and body", () => {
  const out = renderTemplate({
    domain: "chotto.uta8a.net",
    slug: "2026-02-15-test-post",
    type: "note",
    title: "Title",
    description: "Description",
    draft: false,
    tags: ["note"],
    timezone: "Asia/Tokyo",
  });

  assertStringIncludes(out, 'type: "note"');
  assertStringIncludes(out, 'title: "Title"');
  assertStringIncludes(out, "draft: false");
  assertStringIncludes(out, "[Asia/Tokyo]");
  assertStringIncludes(out, "Write your content here.");
});
