import { assertEquals, assertThrows } from "jsr:@std/assert";
import {
  extractType,
  isIgnoredSyncDirectoryName,
  rewriteLocalAssetPaths,
  splitFrontmatter,
  validateFrontmatter,
} from "./inotify-sync.ts";

const sample = `---
type: "diary"
title: "Sample"
draft: false
description: "desc"
ogp: "ogp.webp"
tag:
  - "a"
changelog:
  - summary: "created"
    date: "2026-02-14T00:00:00.000+09:00[Asia/Tokyo]"
---

![local](./img.png)
<a href="./foo/bar.pdf">link</a>
`;

Deno.test("splitFrontmatter returns frontmatter and body", () => {
  const { frontmatter, body } = splitFrontmatter(sample);
  assertEquals(frontmatter.includes("type:"), true);
  assertEquals(body.includes("![local]"), true);
});

Deno.test("validateFrontmatter accepts valid sample", () => {
  validateFrontmatter(sample, "sample.md");
});

Deno.test("extractType returns type from frontmatter", () => {
  assertEquals(extractType(sample, "sample.md"), "diary");
});

Deno.test("rewriteLocalAssetPaths rewrites dot-slash paths", () => {
  const out = rewriteLocalAssetPaths(sample, "2026-02-14-foo", "uta8a.net");
  assertEquals(out.includes("/posts/2026-02-14-foo/img.png"), true);
  assertEquals(out.includes("/posts/2026-02-14-foo/foo/bar.pdf"), true);
});

Deno.test("rewriteLocalAssetPaths rewrites iframe src only for generated.uta8a.net", () => {
  const iframeSample = `${sample}
<iframe src="./embed/index.html"></iframe>
`;
  const generatedOut = rewriteLocalAssetPaths(iframeSample, "2026-02-14-foo", "generated.uta8a.net");
  const uta8aOut = rewriteLocalAssetPaths(iframeSample, "2026-02-14-foo", "uta8a.net");

  assertEquals(generatedOut.includes('src="/posts/2026-02-14-foo/embed/index.html"'), true);
  assertEquals(uta8aOut.includes('src="./embed/index.html"'), true);
});

Deno.test("validateFrontmatter throws for missing keys", () => {
  assertThrows(() => validateFrontmatter("---\ntitle: x\n---", "bad.md"));
});

Deno.test("isIgnoredSyncDirectoryName matches files.ignore only", () => {
  assertEquals(isIgnoredSyncDirectoryName("files.ignore"), true);
  assertEquals(isIgnoredSyncDirectoryName("images"), false);
  assertEquals(isIgnoredSyncDirectoryName("README.md"), false);
});
