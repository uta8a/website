# Architecture

## 概要

このリポジトリは、複数ドメインのWebサイトを以下3層で分離して管理する。

- Data層: `content/` (フレームワーク非依存Markdown)
- Tooling層: `scripts/` (同期・雛形生成)
- Rendering層: `site/` (各Astroプロジェクト)

## レイヤー責務

### 1) content/

- 記事本文とfrontmatterを管理する
- 1記事1ディレクトリで `README.md` と関連画像を同居させる
- サイト実装都合のメタデータは持たない

### 2) scripts/

- `init-content.ts`: 記事テンプレート・frontmatter雛形を生成
- `inotify-sync.ts`: `content/` の変更を検知し、`site/` 向けに変換・配置
- `dev-all.ts`: `sync:watch` と3サイトのdevサーバを起動し、ローカルlanding pageを提供
- プレビュー機能は持たず、同期のみ担当

### 3) site/

- 各ドメインを独立したAstroアプリとして管理
- `content/` 直読はせず、同期済みデータを入力として扱う

## 対象ドメイン

- `uta8a.net`: ポートフォリオ + 英語ブログ (`/blog`)
- `chotto.uta8a.net`: 短文記事の蓄積
- `generated.uta8a.net`: 生成・実験系コンテンツ

## 設計上の利点

- フレームワーク変更時に `content/` を再利用できる
- サイトごとのUI/実装を独立して進化できる
- 同期ロジックを集中管理できる
