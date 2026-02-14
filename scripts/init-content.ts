#!/usr/bin/env -S deno run -A
type Args = {
  domain: string;
  slug: string;
  type: string;
  title: string;
  description: string;
  draft: boolean;
  tags: string[];
};

const rootDir = Deno.cwd();

function parseArgs(raw: string[]): Args {
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

  const domain = map.get("domain");
  const slug = map.get("slug");
  const type = map.get("type") ?? "note";
  const title = map.get("title") ?? "New Article";
  const description = map.get("description") ?? "";
  const draft = (map.get("draft") ?? "false") === "true";
  const tags = (map.get("tags") ?? type).split(",").map((v) => v.trim()).filter(Boolean);

  if (!domain) throw new Error("--domain is required");
  if (!slug) throw new Error("--slug is required");

  return { domain, slug, type, title, description, draft, tags };
}

function renderTemplate(args: Args): string {
  const now = new Date().toISOString();
  const tagLines = args.tags.length > 0 ? args.tags.map((t) => `  - \"${t}\"`).join("\n") : "  - \"note\"";

  return `---
type: \"${args.type}\"
title: \"${args.title}\"
draft: ${args.draft}
description: \"${args.description}\"
ogp: \"ogp-big.webp\"
tag:
${tagLines}
changelog:
  - summary: \"Initial draft\"
    date: \"${now}\"
---

Write your content here.
`;
}

async function main(): Promise<void> {
  const args = parseArgs(Deno.args);
  const articleDir = `${rootDir}/content/${args.domain}/${args.slug}`;
  const readmePath = `${articleDir}/README.md`;

  await Deno.mkdir(articleDir, { recursive: true });

  try {
    await Deno.stat(readmePath);
    throw new Error(`already exists: ${readmePath}`);
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
  }

  await Deno.writeTextFile(readmePath, renderTemplate(args));
  console.log(`created: ${readmePath}`);
}

if (import.meta.main) {
  await main();
}
