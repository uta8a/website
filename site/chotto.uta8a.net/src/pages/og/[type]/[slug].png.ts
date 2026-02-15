import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFile } from "fs/promises";

export const prerender = true;

const WIDTH = 1200;
const HEIGHT = 630;

async function loadFont(): Promise<Buffer> {
  const candidates = [
    "/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
  ];

  for (const path of candidates) {
    try {
      return await readFile(path);
    } catch {
      // fallback to next candidate
    }
  }

  throw new Error("No usable font found for OGP generation");
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = (await getCollection("posts")).filter((post) => !post.data.draft);

  return posts
    .map((post) => {
      const [type, slug] = post.slug.split("/");
      if (!type || !slug) return null;
      return {
        params: { type, slug },
        props: {
          title: post.data.title,
          description: post.data.description,
          site: "chotto.uta8a.net",
          type,
        },
      };
    })
    .filter((v): v is { params: { type: string; slug: string }; props: { title: string; description: string; site: string; type: string } } => v !== null);
};

export const GET: APIRoute = async ({ props }) => {
  const fontData = await loadFont();
  const title = typeof props?.title === "string" ? props.title : "untitled";
  const description = typeof props?.description === "string" ? props.description : "";
  const site = typeof props?.site === "string" ? props.site : "chotto.uta8a.net";
  const type = typeof props?.type === "string" ? props.type : "note";

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: `${WIDTH}px`,
          height: `${HEIGHT}px`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "#f4f4f2",
          color: "#1f2326",
          border: "6px solid #d8d8d3",
          borderRadius: "28px",
          fontFamily: "OGFont",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "28px",
                      opacity: 0.82,
                    },
                    children: site,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "24px",
                      color: "#4e565d",
                      border: "2px solid #cfd2cc",
                      borderRadius: "10px",
                      padding: "6px 14px",
                    },
                    children: type.toUpperCase(),
                  },
                },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: {
                fontSize: "64px",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                maxHeight: "350px",
                overflow: "hidden",
                borderLeft: "10px solid #2c536d",
                paddingLeft: "22px",
              },
              children: title,
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "16px",
                color: "#4b535a",
                fontSize: "27px",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      flex: 1,
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    },
                    children: description || "short note",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "22px",
                      opacity: 0.8,
                    },
                    children: "chotto",
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        {
          name: "OGFont",
          data: fontData,
          weight: 400,
          style: "normal",
        },
      ],
    },
  );

  const png = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } }).render().asPng();

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
