---
type: "note"
title: "tfstateを環境変数で書くときはterragruntが使える"
draft: false
description: "S3バケット名のアカウントIDを隠したい時、terragruntを使う方法もある"
ogp: "ogp-big.webp"
tag:
  - "note"
  - "terraform"
  - "terragrunt"
changelog:
  - summary: "Initial draft"
    date: "2026-02-18T05:22:03.867+09:00[Asia/Tokyo]"
---

[S3バケット名のsuffixについて](https://chotto.uta8a.net/note/2026-02-15-naming-s3-bucket/) で述べたように、S3バケット名に `-<account-id>-<region>` を付与することが多い。しかし、公開リポジトリでTerraformのS3 backendの設定を書くときに少し困ったことが起きる

- AWSのアカウントIDはできればハードコードしたくない
  - 別に秘密の情報ではないので公開してもいいのだけど、何となく
- TerraformのS3 backendのS3バケット名は環境変数指定が使えず、隠したい場合は `-backend-config` で指定する
  - [Backend block configuration overview > Partial configuration](https://developer.hashicorp.com/terraform/language/backend#partial-configuration)

解決策は `-backend-config` なのだけれど、CIとかを考えるとできれば環境変数の方が扱いやすい。
そこで、terragruntを使うという方法がある。[State Backend \| Terragrunt](https://terragrunt.gruntwork.io/docs/features/state-backend/)にあるように、hclファイルからterraformのS3 backendブロックを生成するので、環境変数を使うことができる。
モチベーションの項目にも、backendでvariablesとかが使えないので、DRYにするのが難しい、ということが書いてある。

> Unfortunately, the backend configuration does not currently support expressions, variables, or functions.
> 
> [State Backend > Motivation](https://terragrunt.gruntwork.io/docs/features/state-backend/#motivation)

多分想定ユースケースはtfstateが大量にあるリポジトリなのだけど、S3のバケット名をTerraformに環境変数で渡したい時はterragruntを使えるという話。
ちなみにterragruntはmiseで以下のように入る。

```console
mise use terragrunt@latest --pin
```

設定は例えば以下のようになる

```hcl
remote_state {
  backend = "s3"

  config = {
    bucket         = get_env("TFSTATE_BUCKET")
    key            = "path/to/terraform.tfstate"
    region         = "ap-northeast-1"
    use_lockfile   = true
    encrypt        = true
  }
}
```
