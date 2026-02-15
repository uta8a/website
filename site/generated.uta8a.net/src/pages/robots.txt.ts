export async function GET({ site }: { site: URL | undefined }) {
  const base = site ?? new URL("https://generated.uta8a.net");
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${new URL("/sitemap.xml", base).toString()}\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
