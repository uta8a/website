# TODO

- [x] AGENTS.md
- [x] README.mdの拡充
- [x] contentの雛形
- [x] syncツールの実装
- [x] 各サイトの雛形
  - [x] 各サイトは全てAstroで実装する

## 次の実装対象候補

- [ ] syncツールの改善
  - [ ] frontmatterバリデーションを厳密化（型・必須項目・日付形式）
  - [ ] 差分同期（変更がない記事はスキップ）
  - [ ] ログ整備（domain/slug単位の結果表示）
  - [ ] 画像パス解決の改善
    - [ ] 現状確認: Markdown内の相対画像パス（`./foo.png` など）が `/type/slug/` で壊れるケースを再現テスト化
    - [ ] 方針A: sync時に本文の画像URLを `/posts/<slug>/<asset>` へrewriteする
    - [ ] 方針B: Astro側のremark/rehypeで `post.slug` を使って画像URLを解決する
    - [ ] A/B比較して1つに統一（実装コスト、可搬性、将来のframework移行耐性）
    - [ ] 採用方針を `docs/sync-spec.md` に追記
- [ ] init-contentの改善
  - [ ] 対話なしで使えるCLIオプションの拡充（`--lang`, `--ogp` など）
  - [ ] スラッグ命名規則チェック（`YYYY-MM-DD-...`）
- [ ] 各Astroサイトの基本機能
  - [ ] タグ一覧ページ
  - [ ] RSSフィード
  - [ ] OGPメタタグ出力
- [ ] 開発体験の整備
  - [ ] `mise` タスク追加（`check`, `build`, `dev:all`）
  - [ ] CIで `sync` + `pnpm -r check` を実行
- [ ] テスト追加
  - [ ] `scripts/inotify-sync.ts` の単体テスト
  - [ ] `scripts/init-content.ts` の単体テスト
