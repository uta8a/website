# content

フレームワーク非依存のコンテンツデータを置くディレクトリです。

## ルール

- 1記事 = 1ディレクトリ
- パスは `content/<domain>/<date-slug>/` のフラット構造
- 記事本文は `README.md`
- 画像などのアセットは同じディレクトリに置く
- 記事種別はパスではなくfrontmatterの `type` で管理する
- frontmatter は `docs/content-schema.md` に従う

## サイト別ルート

- `content/uta8a.net/`
- `content/chotto.uta8a.net/`
- `content/generated.uta8a.net/`
