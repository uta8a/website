import { defineConfig } from "astro/config";
import remarkBreaks from "remark-breaks";

export default defineConfig({
  site: "https://chotto.uta8a.net",
  markdown: {
    remarkPlugins: [remarkBreaks],
  },
});
