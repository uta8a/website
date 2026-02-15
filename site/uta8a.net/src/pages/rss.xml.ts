import { getCollection } from "astro:content";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function toRfc822(value: string): string {
  const cleaned = value.replace(/\[[^\]]+\]$/, "");
  const date = new Date(cleaned);
  if (Number.isNaN(date.getTime())) {
    return new Date(0).toUTCString();
  }
  return date.toUTCString();
}

export async function GET({ site }: { site: URL | undefined }) {
  const base = site ?? new URL("http://localhost:4321");
  const posts = (await getCollection("posts"))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.slug.localeCompare(a.slug));

  const items = posts
    .map((post) => {
      const link = new URL(`/${post.slug}/`, base).toString();
      const latest = post.data.changelog[post.data.changelog.length - 1]?.date ?? new Date(0).toISOString();
      return `<item>
<title>${escapeXml(post.data.title)}</title>
<link>${escapeXml(link)}</link>
<guid>${escapeXml(link)}</guid>
<description>${escapeXml(post.data.description)}</description>
<pubDate>${escapeXml(toRfc822(latest))}</pubDate>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
<title>${escapeXml(base.hostname)}</title>
<link>${escapeXml(base.toString())}</link>
<description>${escapeXml(base.hostname)} posts</description>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
