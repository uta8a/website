import { defineConfig } from "astro/config";
import remarkBreaks from "remark-breaks";

export default defineConfig({
  site: "https://uta8a.net",
  markdown: {
    remarkPlugins: [remarkBreaks],
  },
});
