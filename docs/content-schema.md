# Content Schema

## 目的

`content/` 配下のMarkdownをフレームワーク非依存で保持し、変換先の実装詳細から切り離す。

## ファイル配置規約

- 1記事ごとにディレクトリを作る
- 記事本文ファイルは `README.md`
- 画像・アセットは同一ディレクトリに置く

例:

```txt
content/uta8a.net/2026-02-14-rethinking-information/README.md
content/uta8a.net/2026-02-14-rethinking-information/ogp-big.webp
```

## Frontmatter スキーマ

```yaml
type: string
title: string
draft: boolean
description: string
ogp: string
tag: string[]
changelog:
  - summary: string
    date: string # Temporal.ZonedDateTime.from() で解釈可能
```

## フィールド定義

- `type`: 記事種別（例: `diary`, `blog`, `note`, `generated`）
- `title`: 記事タイトル
- `draft`: 公開可否
- `description`: 概要文
- `ogp`: OGP画像のファイル名
- `tag`: タグ一覧
- `changelog`: 変更履歴
  - `summary`: 変更要約
  - `date`: タイムゾーン付き日時文字列（`Temporal.ZonedDateTime.from()` で解釈可能）

## 制約

- パスは `content/<domain>/<date-slug>/` のフラット構造にする（`/blog` や `/diary` などの中間ディレクトリは作らない）
- 記事種別はディレクトリ名ではなく `type` フィールドで管理する
- `title` は本文先頭見出しと重複記述しない
- `tag` は空配列を許容するが、公開記事では1件以上を推奨
- `changelog` は新しい変更を末尾追加で管理する
- `changelog.date` は `2026-02-15T11:00:00.000+09:00[Asia/Tokyo]` のようにタイムゾーン名まで含む形式を推奨する
