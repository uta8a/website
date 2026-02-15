---
type: "note"
title: "Markdownはフレームワークより長生きする"
draft: false
description: "ブログのMarkdownは可搬性を保ち、フレームワークから独立であると良いのではないか"
ogp: "ogp-big.webp"
tag:
  - "note"
  - "markdown"
  - "design"
changelog:
  - summary: "publish"
    date: "2026-02-15T12:52:40.440+09:00[Asia/Tokyo]"
---

[blog.uta8a.net](https://blog.uta8a.net)に書いてあるブログ記事はmarkdownで書いている。フレームワークはこれまで様々なものを使ってきた

- 初代: Hugo
- 二代目: Next.js
- 三代目: Hugo
- 四代目: Lume

こうしてみると、ブログ記事のMarkdownの寿命よりもフレームワークの寿命の方が短い。移行のたびにMarkdownを変換するスクリプトを書く手間が生じる。そこで、僕は以下のようにすることにした。

- Markdownは `content` ディレクトリ以下に書く
  - frontmatterは自分で決めたものを入れる
- フレームワークの独自記法を書かない
  - GitHub Flavored Markdownくらいの範囲の記法で書く
- `content` ディレクトリに変更があったら、フレームワークのコードの下に同期するスクリプトを書く
  - こうすればリアルタイムプレビューが可能になる

これを実現したのが [uta8a/website](https://github.com/uta8a/website) で、いろいろ整っていて便利。

また、frontmatterに含めるべき要素も結構考えた。以下の要素が欲しいと思っている。

- タイトル
- 編集履歴
- タグ
- slugに使うもの
- description
- 下書き状態かどうか
- ogpの指定

`created_at` や `updated_at` を入れるケースは見かけるけど、編集履歴を入れている人はあまり見かけないのでちょっぴりオリジナル性があると勝手に思っています。笑
これを反映したのが以下

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
    date: "2026-02-15T12:52:40.440+09:00[Asia/Tokyo]"
```

通常 `type` とかはブログのフレームワークが特別扱いしていることになっているけど、同期タイミングで適切にfrontmatterを変換することで、フレームワークに依存したkeyを避けられる。

# まとめ

Markdownよりブログに使うフレームワークの方が寿命が短いので、可搬性の高いMarkdownを心がけて、データとフレームワークを分離していきたい。
