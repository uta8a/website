# AGENTS.md

このリポジトリで作業するエージェント向けの運用ガイドです。

## 目的

- 複数サイトを単一リポジトリで管理する
- `content/` を単一のソースオブトゥルースにする
- 実装はサイトごとに分離しつつ、共通運用を維持する

## 必須ルール

- パッケージマネージャは `pnpm` を使う
- タスク実行は `mise` 経由で行う
- 各サイト実装は `Astro` を使う
- `content/` のMarkdownはフレームワーク非依存で維持する

## 変更方針

- `content/` の仕様変更時は `docs/content-schema.md` を先に更新する
- 同期仕様の変更時は `docs/sync-spec.md` を更新する
- サイト追加時は以下3点を同時に更新する
  - `README.md` の対象サイト一覧
  - `content/<domain>/` の雛形
  - `site/<domain>/` の雛形

## ドキュメント優先順位

1. `README.md`
2. `docs/architecture.md`
3. `docs/content-schema.md`
4. `docs/sync-spec.md`

## 現在の前提

- この段階では設計とドキュメントを先行し、実装は次段で行う
- `scripts/` と `site/` は今後の実装対象
