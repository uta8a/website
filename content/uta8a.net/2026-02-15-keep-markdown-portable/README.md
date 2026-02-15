---
type: "blog"
title: "Designing a Portable Blog Structure"
draft: false
description: "Keeping Markdown portable and independent from frameworks for blog articles"
ogp: "ogp-big.webp"
tag:
  - "note"
  - "markdown"
  - "design"
changelog:
  - summary: "publish"
    date: "2026-02-15T12:52:21.775+09:00[Asia/Tokyo]"
---

I write blog articles in markdown on [blog.uta8a.net](https://blog.uta8a.net) (ja). I've used several frameworks over the years:

- First generation: Hugo
- Second generation: Next.js
- Third generation: Hugo
- Fourth generation: Lume

Looking back, frameworks tend to be replaced more often than Markdown. Every time I migrate, I have to write a script to convert the Markdown. So, I decided to do the following:

- Write Markdown under the `content` directory
  - Include frontmatter with my own defined fields
- Avoid writing framework-specific syntax
- Write a script to synchronize changes in the `content` directory with the framework's code
  - This allows for real-time preview

I implemented this in [uta8a/website](https://github.com/uta8a/website). It keeps content independent from rendering logic.

I also thought a lot about what elements should be included in the frontmatter. I want the following elements:

- Title
- Edit history
- Tags
- Slug
- Description
- Draft status
- OGP link

While I often see `created_at` and `updated_at`, I don't see many people including edit history, so I think it's a bit original.
Here's how it looks:

```yaml
type: "note"
title: "New Article"
draft: false
description: "description"
ogp: "ogp-big.webp"
tag:
  - "note"
changelog:
  - summary: "publish"
    date: "2026-02-15T12:52:21.775+09:00[Asia/Tokyo]"
```

# Summary

The lifespan of the frameworks for blog articles is shorter than the lifespan of the Markdown, so I want to keep the Markdown portable and separate the data from the framework.
