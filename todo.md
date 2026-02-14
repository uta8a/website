# TODO

- [x] AGENTS.md
- [x] README.mdの拡充
- [x] contentの雛形
- [x] syncツールの実装
- [x] 各サイトの雛形
  - [x] 各サイトは全てAstroで実装する

## 次の実装対象候補

- [x] init-contentの改善
  - [x] --helpコマンドの追加
- [x] 各Astroサイトの基本機能
  - [x] タグ一覧ページ
  - [x] RSSフィード
  - [x] OGPメタタグ出力
- [x] テスト追加
  - [x] `scripts/inotify-sync.ts` の単体テスト
  - [x] `scripts/init-content.ts` の単体テスト

## 将来的な改善

- [ ] syncツールの改善
  - [ ] frontmatterバリデーションを厳密化（型・必須項目・日付形式）
  - [ ] 差分同期（変更がない記事はスキップ）
  - [ ] ログ整備（domain/slug単位の結果表示）
  - [ ] 画像パス解決の改善
- [ ] 開発体験の整備
  - [ ] `mise` タスク追加（`check`, `build`, `dev:all`）
  - [ ] CIで `sync` + `pnpm -r check` を実行
