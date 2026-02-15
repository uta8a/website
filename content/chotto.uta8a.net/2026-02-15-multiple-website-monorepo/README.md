---
type: "note"
title: "複数のウェブサイトを1つのリポジトリで管理する理由"
draft: false
description: "複数の独立したウェブサイトを1つのリポジトリで管理するようにした"
ogp: "ogp-big.webp"
tag:
  - "note"
  - "monorepo"
  - "design"
changelog:
  - summary: "Initial draft"
    date: "2026-02-15T20:10:20.144+09:00[Asia/Tokyo]"
---

複数の独立したウェブサイトを1つのリポジトリで管理するようにした。([uta8a/website](https://github.com/uta8a/website))
なぜそうしたのか、考えていたことをメモする。

まず、複数のウェブサイトを作るとどうしても以下のような問題が出てくる。

- Dependabotの対応が面倒
  - フロントエンド(npmエコシステム)は脆弱性のアラートが頻繁に来るので、面倒になって対応しなくなってしまう
- 管理が面倒
  - 今の僕のやり方だと、あちこちのリポジトリのCIに対して、Repository secretにCloudflareのAPIトークンを設定する必要がある
  - あまり更新しないサイトは存在を忘れてしまうので、その時にリポジトリ探しが大変

これらの問題をモノレポにすることで解決しようと考えた。

- Dependabot
  - 1リポジトリなので、マージ作業がだいぶ楽になる
  - まだできてないけど、pnpm Catalogsを使って依存を共有することもできるかも
- 管理
  - CIは1workflowで済む(全部Cloudflare Pagesの場合)
  - ウェブサイトといえばここを見れば良い、という状態になる

[uta8a/website](https://github.com/uta8a/website) はまだ始めたばかりなので、今後これらの考えが当たっていたかどうかまた振り返りたい。
あと、既存のウェブサイトもどんどんこちらに集約していきたい。
