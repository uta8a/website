# website

複数サイトを1つのリポジトリで管理するためのモノレポです。  
`content/` にフレームワーク非依存のMarkdownデータを置き、`scripts/` の同期ツールで `site/` 配下の各Astroサイトへ反映する設計です。

## 対象サイト

- `uta8a.net`
- `chotto.uta8a.net`
- `generated.uta8a.net`

## 設計方針

- `content/` はデータレイヤーとして管理し、フロントエンド実装（Astro）から分離する
- `site/` にはサイトごとのAstroプロジェクトを配置する
- 同期責務は `scripts/inotify-sync.ts` に限定し、プレビューやビルドは各フレームワークに委譲する
- ツール実行は `mise` 経由、パッケージ管理は `pnpm` を利用する

## 想定ディレクトリ構成

```txt
.
├── AGENTS.md
├── README.md
├── docs/
│   ├── architecture.md
│   ├── content-schema.md
│   └── sync-spec.md
├── content/
│   ├── README.md
│   ├── uta8a.net/
│   ├── chotto.uta8a.net/
│   └── generated.uta8a.net/
├── scripts/
│   ├── changelog-object.ts
│   ├── dev-all.ts
│   ├── inotify-sync.ts
│   └── init-content.ts
├── site/
│   ├── uta8a.net/
│   ├── chotto.uta8a.net/
│   └── generated.uta8a.net/
└── mise.toml
```

## コンテンツ仕様

`content/` の記事は「1記事 = 1ディレクトリ」に集約し、`README.md` とアセットを同居させます。  
記事ディレクトリは `content/<domain>/<date-slug>/` のフラット構造にし、`type` はfrontmatterで管理します。

例:

```txt
content/uta8a.net/2026-02-14-rethinking-information/README.md
content/uta8a.net/2026-02-14-rethinking-information/ogp-big.webp
```

frontmatter は以下の共通スキーマを採用します（詳細は `docs/content-schema.md`）。

```yaml
type: string
title: string
draft: boolean
description: string
ogp: string
tag: string[]
changelog:
  - summary: string
    date: ISO 8601 string
```

## この段階で作成済みドキュメント

- `AGENTS.md`: リポジトリ運用ポリシー
- `docs/architecture.md`: 全体アーキテクチャ
- `docs/content-schema.md`: frontmatter仕様
- `docs/sync-spec.md`: 同期ツール仕様
- `content/` 配下のサンプル記事Markdown

## 実装済み（初期フェーズ）

- `mise.toml` の作成とタスク定義
- `scripts/init-content.ts` の実装
- `scripts/changelog-object.ts` の実装（changelog追記用object生成）
- `scripts/inotify-sync.ts` の実装
- `scripts/dev-all.ts` の実装（landing page + 全サイトdev起動）
- `site/` 配下3サイトのAstro雛形作成

## 開発コマンド

- 全サイト + 同期watch + landing page:
  - `mise run dev:all`
- landing page:
  - `http://127.0.0.1:4300`
- 各サイト:
  - `http://127.0.0.1:4321` (`uta8a.net`)
  - `http://127.0.0.1:4322` (`chotto.uta8a.net`)
  - `http://127.0.0.1:4323` (`generated.uta8a.net`)

## init-content の使い方

- ヘルプ表示（必須引数不要）:
  - `mise run init-content -- --help`
  - `mise run init-content -- -h`
- 記事作成:
  - `mise run init-content -- --domain chotto.uta8a.net --slug 2026-02-15-my-post --type note --title "My Post"`

## changelog-object の使い方

- ヘルプ表示:
  - `mise run changelog-object -- --help`
- object生成（日時は現在時刻）:
  - `mise run changelog-object -- --summary "Typo fix"`
- 日時を明示:
  - `mise run changelog-object -- --summary "Add benchmark result" --date "2026-02-15T11:00:00.000+09:00[Asia/Tokyo]"`
