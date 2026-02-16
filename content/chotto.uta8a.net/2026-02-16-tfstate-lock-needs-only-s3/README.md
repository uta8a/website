---
type: "note"
title: "Terraform state lockはS3だけでOK"
draft: false
description: "Terraform state lockはS3のConditional Writesで十分になっていた話"
ogp: "ogp-big.webp"
tag:
  - "note"
  - "terraform"
  - "s3"
changelog:
  - summary: "Initial draft"
    date: "2026-02-16T06:27:49.805+09:00[Asia/Tokyo]"
---

Terraform state lockは昔DynamoDBが必要でしたが、現在はS3のConditional Writesで十分になりました。
CodexにTerraformのコードを書いてもらった時にDynamoDB付きのコードが出てきたので、この話を思い出してメモしておこうと思いました。

# 経緯1 昔はDynamoDBが必要だった

Terraform backend S3の場合、`backend "s3"` ブロック内の `dynamodb_table = "tfstate-lock"` のような引数でDynamoDBを指定する必要がありました。
以下のようなコードを書いていました。

```hcl
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "path/to/my/terraform.tfstate"
    region         = "ap-northeast-1"
    dynamodb_table = "tfstate-lock"
    encrypt        = true
  }
}
```

そもそもterraformのstate lockってなんでしょうか？
[State: Locking - v1.14.x docs](https://developer.hashicorp.com/terraform/language/v1.14.x/state/locking) を読むと、State lockingはTerraformのstateに書き込み処理をするような操作全てで起こり、State lockingが失敗するとTerraformは処理を継続しないと書かれています。Terraformのstateは同時に2つ以上のwrite操作で触ると壊れてしまうので、複数人で開発する場合やCI/CDでTerraformのwrite操作を行っている場合はstate lockが必要になります。

State lockingしない時に何が起こるかは [TerraformのState Lockについて触ってみた（AWS, Terraform v1.11） - NRIネットコムBlog](https://tech.nri-net.com/entry/about_terraforms_state_lock) が分かりやすかったです。具体的にはリソースが2個できちゃったり、stateファイルに片方しか記録されなかったりします。

DynamoDBは、write操作の開始時にあらかじめテーブルにロック用のアイテムを作成しておいて、終了時に削除することでstate lockの制御を実装していました。他のwrite操作が来ると既にアイテムがあるのでエラーになる、という仕組みです。
この辺りは [terraform のロック制御に DynamoDB が必要な理由](https://zenn.dev/ishii1648/articles/02044d9ee78942#dynamodb%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%9F%E3%83%AD%E3%83%83%E3%82%AF%E5%88%B6%E5%BE%A1%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6) を読むと良いです。

# 経緯2 S3がConditional Writesをサポートした

2024/8/20に、S3でのConditional Writesのサポートが発表されました。これは以下のような内容です。(抜粋)

> Amazon S3 adds support for conditional writes that can check for the existence of an object before creating it.
> ...
> To use conditional writes, you can add the HTTP if-none-match conditional header along with PutObject and CompleteMultipartUpload API requests.
> 
> [Amazon S3 now supports conditional writes - AWS](https://aws.amazon.com/about-aws/whats-new/2024/08/amazon-s3-conditional-writes/)

"can check for the existence of an object before creating it" なので、S3にオブジェクトを作成する前に存在確認ができます。使い方は"HTTP if-none-match conditional header along with PutObject and CompleteMultipartUpload API requests"ですが、これはsdkが引数として提供していたりします。なので、if-none-match headerを直接意識するケースは少ないと思います。

# 経緯3 Terraform state lockはS3だけでOKになった

ここでTerraform state lockの必要性を思い出すと、write操作が開始する時にstate lockをどこかに置いて、write操作が終了したらstate lockを削除する。そして他のwrite操作が来たらエラーが返る仕組みがあれば良いです。S3のConditional Writesはオブジェクト作成前に存在確認ができるので、これが使えます。

このPRで、Terraform state lockはS3のConditional Writesを使えるようになりました。 [Introduce S3-native state locking by bschaatsbergen · Pull Request #35661 · hashicorp/terraform](https://github.com/hashicorp/terraform/pull/35661)
リリースはv1.10.0 (2024/11/27)に含まれています。[Changelog v1.10.0](https://github.com/hashicorp/terraform/blob/v1.10/CHANGELOG.md)

# 現在(2026/02/16)どうなっているか

先ほどの PR#35661 では、将来のminor versionでDynamoDBを使ったstate lockがdeprecatedになることも記載されていました。
2026/02/16現在、[Backend Type: s3](https://developer.hashicorp.com/terraform/language/backend/s3#state-locking) によると `Enabling DynamoDB State Locking (Deprecated)` と書いてありました。リリース v1.11.0 (2025/2/27)の[Changelog v1.11.0](https://github.com/hashicorp/terraform/blob/v1.11/CHANGELOG.md) を見ると、S3のConditional WritesがGAになったタイミングでDynamoDBを使ったロック制御がdeprecatedになったようですね。

今は以下のようなコードで書けます。

```hcl
terraform {
  backend "s3" {
    bucket  = "my-terraform-state"
    key     = "path/to/my/terraform.tfstate"
    region  = "ap-northeast-1"
    use_lockfile = true # dynamodb_table は不要になった
    encrypt = true
  }
}
```

# まとめ

Conditonal Writesを使うので、Terraform backend S3はDynamoDBなしでstate lockができる。
