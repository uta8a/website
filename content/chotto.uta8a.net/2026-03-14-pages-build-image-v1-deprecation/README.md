---
type: "note"
title: "Cloudflare Pages Build Image v1 Deprecation Notice に対応した"
draft: false
description: "なんかメールが来たのでついでに棚卸し"
ogp: "ogp-big.webp"
tag:
  - "note"
  - "cloudflare"
changelog:
  - summary: "Initial draft"
    date: "2026-03-14T22:37:06.721+09:00[Asia/Tokyo]"
---

Action Required: Cloudflare Pages Build Image v1 Deprecation Notice - September 15, 2026 というタイトルのメールが来ていたので対応しました。
内容としては

- Cloudflare Pagesの一部がBuild Image v1を使用している
- Build Image v1は2026/09/15に廃止予定
- v3に移行してほしい
- 放置してると勝手にv3に移行するよ(ランタイムが新しくなるので、ビルドが失敗する可能性が出てくるからチェックしてね)

というものでした。
僕はそこそこCloudflare Pagesを利用していたので、どこでv1を使っているのかリストが欲しくなりました。メールには手順が記載されていましたが、Pagesのプロジェクトを開いて設定を確認する、というものでした。これではひとつずつProjectを開いていく必要があって面倒です。

# Build image v1 を使っているプロジェクトをリストアップする

AIに聞いてスクリプトを出しました

```bash
export API_TOKEN="your_api_token"
export ACCOUNT_ID="your_account_id"

curl -sS -H "Authorization: Bearer ${API_TOKEN}" "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects" > out.json
cat out.json | jq -r '
.result[]
| select(
    (.deployment_configs.preview.build_image_major_version == 1) or
    (.deployment_configs.production.build_image_major_version == 1)
    )
| [
    .name,
    (.deployment_configs.preview.build_image_major_version // null),
    (.deployment_configs.production.build_image_major_version // null)
    ]
| @tsv
'
```

(今見たらpagenationしてなさそうなので、使うときはその辺り調べて使ってください)

出力結果

```
blog    1       1
2023-lottery-uta8a-net  1       1
infinite-uta8a-net      1       1
onepage-v2      1       1
event-uta8a-net 1       1
knowledge-uta8a-net     1       1
```

それぞれ見ると3年前に作ったページで、もう更新していないものがほとんどでした。ついでに削除しましょう。

# 削除する

## 手動

最初手動で削除しようとしました。

- PagesのプロジェクトのCustom domainsを削除
- Pagesのプロジェクトを削除

これでいけます。custom domainを削除しないとプロジェクトは削除できないです。また、custom domainを削除するとDNSレコードも削除されます。

## 先にTerraformでDNS recordを削除する

- TerraformでDNS recordを削除
- PagesのプロジェクトのCustom domainsを削除
- Pagesのプロジェクトを削除

これで行けます。ポイントは2つめで、DNS recordを削除してもcustom domainは削除されません。(逆向きのcustom domain→DNS recordは削除される)

# その他

- 一度Build imageを使うと、Build imageを完全削除はできない
  - blogプロジェクトは昔Build imageを使っていたのですが、今はAuto deployをOFFにしたりしています。でもv1なので通知が来ます。これは挙動がおかしくて、本来Build imageを削除できると嬉しいですね。
  - [一応Communityに質問してみました](https://community.cloudflare.com/t/my-pages-project-still-references-build-image-v1-even-though-i-no-longer-use-it/905777)
  - あとから見てて、どうやらCloudflare PagesはBuild imageが必ず付与される仕組みっぽい？
    - そうだとすると、3年に1度くらいはBuild imageを使ってなくてもバージョンアップのお知らせを受け取ることになりそうですね。
    - 3年に一度ならええかという気持ちと、GitHub Pagesでいいかもしれないという気持ちで揺れる...
