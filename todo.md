# TODO

- [x] AGENTS.md
- [x] README.mdの拡充
- [x] contentの雛形
- [x] syncツールの実装
- [x] 各サイトの雛形
  - [x] 各サイトは全てAstroで実装する
- [x] init-contentの改善
  - [x] --helpコマンドの追加
- [x] 各Astroサイトの基本機能
  - [x] タグ一覧ページ
  - [x] RSSフィード
  - [x] OGPメタタグ出力
- [x] テスト追加
  - [x] `scripts/inotify-sync.ts` の単体テスト
  - [x] `scripts/init-content.ts` の単体テスト

## 次の実装対象候補

- [x] ドメインごとのページの見た目改善
  - [x] chotto.uta8a.net
    - [x] シンプルな見た目
    - [x] listページは最初の日付でsort
    - [x] listページで日付とタイトルとタグが並んでいるイメージ。一画面当たりの情報量は多い。
    - [x] listページでタグは右端に小さめに表示
    - [x] 本体ページはタイトルが大きく表示され、タイトル。内容に集中できるデザインになっている。
    - [x] 本体ページは下にdetail summaryとして編集履歴がchangelogから生成されている。また、contact情報が載っている。(uta8a.net/contactへのリンク)
  - [x] uta8a.net
    - [x] /contact
      - [x] 問い合わせ先として、Twitter, GitHubを記載
    - [x] /
      - [x] ポートフォリオにする
    - [x] /blog
      - [x] ここにブログを表示する
  - [x] 追加対応
    - [x] chotto.uta8a.net のレスポンシブ余白調整
    - [x] chotto.uta8a.net で画像はみ出し防止（`max-width: 100%`）
    - [x] uta8a.net/blog の英語圏向けデザイン調整（一覧・記事）
    - [x] chotto / uta8a.net/blog のa11y改善（landmark, skip link, semantic list/time, focus-visible）
    - [x] uta8a.net の skip link は Tab フォーカス時のみ表示

## 将来的な改善

- [ ] syncツールの改善
  - [ ] frontmatterバリデーションを厳密化（型・必須項目・日付形式）
  - [ ] 差分同期（変更がない記事はスキップ）
  - [ ] ログ整備（domain/slug単位の結果表示）
  - [ ] 画像パス解決の改善
- [ ] 開発体験の整備
  - [ ] `mise` タスク追加（`check`, `build`, `dev:all`）
  - [ ] CIで `sync` + `pnpm -r check` を実行
