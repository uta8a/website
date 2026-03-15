---
type: "note"
title: "1 billion row challengeについてのメモ"
draft: false
description: "そのうち取り組んでみたいChallenge"
ogp: "ogp-big.webp"
tag:
  - "note"
  - "challenge"
  - "todo"
changelog:
  - summary: "Initial draft"
    date: "2026-03-15T11:25:34.078+09:00[Asia/Tokyo]"
---

Javaについて調べてたら偶然2024年に流行った1 billion row challengeというのを見つけました。

元ネタは[こちら](https://x.com/gunnarmorling/status/1741839724933751238)で、リンクされているブログが[The One Billion Row Challenge - Gunnar Morling](https://www.morling.dev/blog/one-billion-row-challenge/)です。
内容としては以下のようなデータが与えられるので、

```txt
Hamburg;12.0
Bulawayo;8.9
Palembang;38.8
St. John's;15.2
Cracow;12.6
...
```

下のように変換します

```txt
{Abha=5.0/18.0/27.4, Abidjan=15.7/26.0/34.1, Abéché=12.1/29.4/35.6, Accra=14.7/26.4/33.1, Addis Ababa=2.1/16.0/24.3, Adelaide=4.1/17.3/29.7, ...}
```

Mapしながらmin, avg, maxを計算する感じですね。
ただデータは10億行あります。そこで速度を競うというのがこのchallengeの趣旨のようです。

- リポジトリ: [gunnarmorling/1brc](https://github.com/gunnarmorling/1brc)
- サイト: [1 Billion Row Challenge](https://1brc.dev/)
- QuestDBのブログ: [The Billion Row Challenge (1BRC) - Step-by-step from 71s to 1.7s \| QuestDB](https://questdb.com/blog/billion-row-challenge-step-by-step/)
- Rust実装: [beowolx/fast_1brc](https://github.com/beowolx/fast_1brc)

どこかで取り組んでみたいのでメモ。
