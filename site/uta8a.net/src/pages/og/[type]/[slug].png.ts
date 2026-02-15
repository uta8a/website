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
  const posts = (await getCollection("posts")).filter((post) => !post.data.draft && post.data.type === "blog");

  return posts
    .map((post) => {
      const [type, slug] = post.slug.split("/");
      if (!type || !slug) return null;
      return {
        params: { type, slug },
        props: {
          title: post.data.title,
          description: post.data.description,
          site: "uta8a.net",
        },
      };
    })
    .filter((v): v is { params: { type: string; slug: string }; props: { title: string; description: string; site: string } } => v !== null);
};

export const GET: APIRoute = async ({ props }) => {
  const fontData = await loadFont();
  const title = typeof props?.title === "string" ? props.title : "untitled";
  const description = typeof props?.description === "string" ? props.description : "";
  const site = typeof props?.site === "string" ? props.site : "uta8a.net";

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
          background: "#f6f4ef",
          color: "#1f2328",
          border: "10px solid #ddd6cb",
          borderRadius: "36px",
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
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            width: "14px",
                            height: "52px",
                            borderRadius: "999px",
                            background: "#1d4b6f",
                          },
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "27px",
                            letterSpacing: "0.02em",
                            opacity: 0.88,
                          },
                          children: site,
                        },
                      },
                    ],
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "22px",
                      letterSpacing: "0.08em",
                      border: "2px solid #c9c1b6",
                      borderRadius: "999px",
                      padding: "8px 18px",
                      color: "#3b4450",
                    },
                    children: "BLOG",
                  },
                },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: {
                fontSize: "70px",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                maxHeight: "360px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
              },
              children: title,
            },
          },
          {
            type: "div",
            props: {
              style: {
                fontSize: "28px",
                opacity: 0.8,
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
                borderTop: "2px solid #d8d0c4",
                paddingTop: "20px",
              },
              children: description || "blog post",
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
