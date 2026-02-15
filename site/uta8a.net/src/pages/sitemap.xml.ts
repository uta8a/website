import { getCollection } from "astro:content";

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export async function GET({ site }: { site: URL | undefined }) {
  const base = site ?? new URL("https://uta8a.net");
  const posts = (await getCollection("posts")).filter((post) => !post.data.draft);
  const tags = new Set<string>();
  for (const post of posts) for (const tag of post.data.tag) tags.add(tag);

  const fixed = ["/", "/blog/", "/contact", "/tags/", "/rss.xml"];
  const dynamicPosts = posts.map((post) => `/${post.slug}/`);
  const dynamicTags = [...tags].map((tag) => `/tags/${encodeURIComponent(tag)}/`);
  const urls = [...new Set([...fixed, ...dynamicPosts, ...dynamicTags])];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((path) => `  <url><loc>${escapeXml(new URL(path, base).toString())}</loc></url>`).join("\n")}\n</urlset>`;

  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
