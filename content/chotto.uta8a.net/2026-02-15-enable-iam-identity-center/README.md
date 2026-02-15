---
type: "note"
title: "AWS Organizationのすべての機能が有効化されていることを確認する"
draft: false
description: "IAM Identity Centerを有効化するために、AWS Organizationのすべての機能が有効化されていることを確認したときのメモ。"
ogp: "ogp-big.webp"
tag:
  - "note"
  - "AWS"
changelog:
  - summary: "Initial draft"
    date: "2026-02-15T19:17:48.565+09:00[Asia/Tokyo]"
---

IAM Identity Centerを個人のプライベートで持っているアカウントで有効化した。
[有効化の前に確認する項目](https://docs.aws.amazon.com/singlesignon/latest/userguide/identity-center-prerequisites.html?icmpid=docs_sso_console)のうち、「AWS Organizationを使用していて、IAM Identity Centerを追加する場合は、Organizationsのすべての機能が有効になっていることを確認する」で詰まったのでメモ。

すべての機能を有効にする、と聞くと、AWS Organizationの全部の機能をポチポチ有効化するイメージを持ったが、そうではなかった。

AWS Organizationのページに行き、「設定」を左のメニューから選択すると、「組織の詳細」の中に「機能セット」という項目がある。ここに「組織では、すべての機能が有効化されています。...」と表示されていたらOK。僕は最初から有効化されていたけど、もしされてない場合は以下の記事を参考にすると良いと思う。

- [AWS Organizations すべての機能有効化までの道のり](https://zenn.dev/mixi/articles/b5ec0589736609)
  - 機能セットには一括請求機能とすべての機能の2種類があることの説明
  - 有効化作業の手順

紛らわしい名前だけど、「すべての機能」という名前が機能セットの選択肢の1つについている、と捉えると良い。

# まとめ

すべての機能の有効化とは、AWS Organizationの機能セットの「すべての機能」が有効化されていることを指す。
