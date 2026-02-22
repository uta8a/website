#!/usr/bin/env -S deno run -A
export const DOMAIN_LIST = ["uta8a.net", "chotto.uta8a.net", "generated.uta8a.net"] as const;
export const IGNORED_DIR_NAME = "files.ignore";
const REQUIRED_KEYS = ["type", "title", "draft", "description", "ogp", "tag", "changelog"] as const;

export function isIgnoredSyncDirectoryName(name: string): boolean {
  return name === IGNORED_DIR_NAME;
}

const rootDir = Deno.cwd();
const contentRoot = `${rootDir}/content`;
const siteRoot = `${rootDir}/site`;

export function splitFrontmatter(markdown: string): { frontmatter: string; body: string } {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error("frontmatter block is missing");
  }
  return { frontmatter: match[1], body: match[2] };
}

export function rewriteLocalAssetPaths(
  markdown: string,
  slug: string,
  domain?: (typeof DOMAIN_LIST)[number],
): string {
  const { frontmatter, body } = splitFrontmatter(markdown);
  const base = `/posts/${slug}/`;

  const rewritePath = (value: string): string => {
    if (!value.startsWith("./")) return value;
    return `${base}${value.slice(2)}`;
  };

  let rewritten = body;
  rewritten = rewritten.replace(/(!?\[[^\]]*\]\()(\.\/[^)\s]+)(\))/g, (_, p1, p2, p3) => {
    return `${p1}${rewritePath(p2)}${p3}`;
  });
  rewritten = rewritten.replace(/(<(?:img|a)\b[^>]*\b(?:src|href)=["'])(\.\/[^"']+)(["'][^>]*>)/g, (_, p1, p2, p3) => {
    return `${p1}${rewritePath(p2)}${p3}`;
  });
  if (domain === "generated.uta8a.net") {
    rewritten = rewritten.replace(/(<iframe\b[^>]*\bsrc=["'])(\.\/[^"']+)(["'][^>]*>)/g, (_, p1, p2, p3) => {
      return `${p1}${rewritePath(p2)}${p3}`;
    });
  }

  return `---\n${frontmatter}\n---\n\n${rewritten}`;
}

export function validateFrontmatter(markdown: string, sourcePath: string): void {
  const { frontmatter } = splitFrontmatter(markdown);
  for (const key of REQUIRED_KEYS) {
    if (!new RegExp(`^${key}:`, "m").test(frontmatter)) {
      throw new Error(`${sourcePath}: required key \"${key}\" is missing`);
    }
  }
  const draftMatch = frontmatter.match(/^draft:\s*(true|false)\s*$/m);
  if (!draftMatch) {
    throw new Error(`${sourcePath}: draft must be boolean`);
  }
  if (!/^tag:\s*$/m.test(frontmatter) || !/^\s+-\s+/.test(frontmatter.split(/^tag:\s*$/m)[1] ?? "")) {
    throw new Error(`${sourcePath}: tag must include list items`);
  }
  if (!/^changelog:\s*$/m.test(frontmatter) || !/^\s+-\s+summary:\s+/.test(frontmatter.split(/^changelog:\s*$/m)[1] ?? "")) {
    throw new Error(`${sourcePath}: changelog must include summary/date entries`);
  }
}

export function extractType(markdown: string, sourcePath: string): string {
  const { frontmatter } = splitFrontmatter(markdown);
  const match = frontmatter.match(/^type:\s*["']?([^"'\n]+)["']?\s*$/m);
  if (!match || !match[1]) {
    throw new Error(`${sourcePath}: type must be a non-empty string`);
  }
  return match[1].trim();
}

async function removeIfExists(path: string): Promise<void> {
  try {
    await Deno.remove(path, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) throw error;
  }
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return false;
    throw error;
  }
}

async function* walkFiles(dir: string): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(dir)) {
    const fullPath = `${dir}/${entry.name}`;
    if (entry.isDirectory) {
      yield* walkFiles(fullPath);
      continue;
    }
    if (entry.isFile) {
      yield fullPath;
    }
  }
}

export async function copyAssetsRecursively(srcDir: string, destDir: string): Promise<void> {
  await Deno.mkdir(destDir, { recursive: true });
  for await (const entry of Deno.readDir(srcDir)) {
    if (entry.name === "README.md") continue;
    if (entry.isDirectory && isIgnoredSyncDirectoryName(entry.name)) continue;
    const from = `${srcDir}/${entry.name}`;
    const to = `${destDir}/${entry.name}`;
    if (entry.isDirectory) {
      await copyAssetsRecursively(from, to);
      continue;
    }
    if (entry.isFile) {
      await Deno.mkdir(destDir, { recursive: true });
      await Deno.copyFile(from, to);
    }
  }
}

async function syncDomain(domain: (typeof DOMAIN_LIST)[number]): Promise<{ ok: number; failed: number }> {
  const inDir = `${contentRoot}/${domain}`;
  const outPostsDir = `${siteRoot}/${domain}/src/content/posts`;
  const outPublicDir = `${siteRoot}/${domain}/public/posts`;

  await Deno.mkdir(outPostsDir, { recursive: true });
  await Deno.mkdir(outPublicDir, { recursive: true });

  const sourceEntries = new Set<string>();
  let ok = 0;
  let failed = 0;

  for await (const entry of Deno.readDir(inDir)) {
    if (!entry.isDirectory) continue;
    if (isIgnoredSyncDirectoryName(entry.name)) continue;
    const slug = entry.name;

    const articleDir = `${inDir}/${slug}`;
    const sourceMd = `${articleDir}/README.md`;

    if (!(await pathExists(sourceMd))) {
      console.error(`[${domain}] skip ${slug}: README.md not found`);
      failed += 1;
      continue;
    }

    try {
      const originalMarkdown = await Deno.readTextFile(sourceMd);
      validateFrontmatter(originalMarkdown, sourceMd);
      const type = extractType(originalMarkdown, sourceMd);
      const markdown = rewriteLocalAssetPaths(originalMarkdown, slug, domain);

      const outTypeDir = `${outPostsDir}/${type}`;
      await Deno.mkdir(outTypeDir, { recursive: true });
      const outMd = `${outTypeDir}/${slug}.md`;
      await Deno.writeTextFile(outMd, markdown);
      sourceEntries.add(`${type}/${slug}`);

      await removeIfExists(`${outPublicDir}/${slug}`);
      await copyAssetsRecursively(articleDir, `${outPublicDir}/${slug}`);

      ok += 1;
    } catch (error) {
      failed += 1;
      console.error(`[${domain}] failed ${slug}:`, error instanceof Error ? error.message : error);
    }
  }

  for await (const filePath of walkFiles(outPostsDir)) {
    if (!filePath.endsWith(".md")) continue;
    const relative = filePath.slice(outPostsDir.length + 1, -3);
    if (sourceEntries.has(relative)) continue;
    const slug = relative.split("/").pop() ?? relative;
    await removeIfExists(filePath);
    await removeIfExists(`${outPublicDir}/${slug}`);
  }

  return { ok, failed };
}

export async function runSync(): Promise<number> {
  let totalOk = 0;
  let totalFailed = 0;

  for (const domain of DOMAIN_LIST) {
    const inDir = `${contentRoot}/${domain}`;
    if (!(await pathExists(inDir))) {
      console.error(`[${domain}] input directory not found: ${inDir}`);
      totalFailed += 1;
      continue;
    }
    const result = await syncDomain(domain);
    totalOk += result.ok;
    totalFailed += result.failed;
  }

  console.log(`sync complete: ok=${totalOk} failed=${totalFailed}`);
  return totalFailed === 0 ? 0 : 1;
}

async function runWatch(): Promise<void> {
  let running = false;
  let queued = false;

  async function trigger(): Promise<void> {
    if (running) {
      queued = true;
      return;
    }
    running = true;
    const code = await runSync();
    if (code !== 0) {
      console.error("sync completed with validation errors");
    }
    running = false;
    if (queued) {
      queued = false;
      await trigger();
    }
  }

  await trigger();
  console.log("watching content directory...");

  const watcher = Deno.watchFs(contentRoot, { recursive: true });
  for await (const _event of watcher) {
    await trigger();
  }
}

export async function main(args: string[]): Promise<number> {
  const watchMode = args.includes("--watch");
  if (!watchMode) {
    return await runSync();
  }
  await runWatch();
  return 0;
}

if (import.meta.main) {
  Deno.exit(await main(Deno.args));
}
