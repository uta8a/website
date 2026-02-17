---
type: "note"
title: "aws loginとCDK, Terraformの認証"
draft: false
description: "aws loginの認証方法がCDKやTerraformで使えるか試してみた"
ogp: "ogp-big.webp"
tag:
  - "note"
  - "AWS"
  - "CDK"
  - "Terraform"
changelog:
  - summary: "Initial draft"
    date: "2026-02-17T20:02:38.660+09:00[Asia/Tokyo]"
---

2025/11/19に、aws loginの認証方法に、ブラウザを開いてログインする方法が加わりました。
参考: [Simplified developer access to AWS with 'aws login' \| AWS Security Blog](https://aws.amazon.com/jp/blogs/security/simplified-developer-access-to-aws-with-aws-login/)

AWS CLI v2.32.0で入ったようです。

> feature:credentials: Adds the ``aws login`` command, which allows you to use your AWS Management Console credentials for CLI and SDK authentication.
> 
> [aws/aws-cli v2 CHANGELOG.rst#721](https://github.com/aws/aws-cli/blob/06b901bfbdfb0407f0a574c70eeaac43e2c334fb/CHANGELOG.rst#L721)

もしかしてCDKやTerraformもこの認証方法で動くのだろうか、と思って試してみました。
使用したバージョンは以下の通りです。

```console
$ terraform --version
Terraform v1.14.5
on linux_amd64
$ pnpm exec cdk --version
2.1106.0 (build 114788d)
```

# CDK

うまく認証されました。(`aws login` した後で手元から `cdk deploy` が通る)

調べると、AWS SDKに [feat(credential-provider-login): add login credential provider by smilkuri · Pull Request #7512 · aws/aws-sdk-js-v3](https://github.com/aws/aws-sdk-js-v3/pull/7512) で対応されたようです。sdkのリリースがこれ [Release v3.936.0 · aws/aws-sdk-js-v3](https://github.com/aws/aws-sdk-js-v3/releases/tag/v3.936.0)

AWS CDK CLIは[こちらのissueコメント](https://github.com/aws/aws-cdk-cli/issues/972#issuecomment-3650187631)を見ると v2.1034.0 からのようでした。
確かに [diff](https://github.com/aws/aws-cdk-cli/compare/aws-cdk@v2.1033.0...aws-cdk@v2.1034.0#diff-53b4276f49311e533661679506aa145dc94eff987cc9d7401d7c42b9058bc43a) を見るとAWS SDKが3.893.0から3.948.0に上がっています。

# Terraform

Terraformはうまく認証されませんでした。(`aws login` した後で手元から `terraform plan` が失敗する)

調べると [Terraform v1.15.0](https://github.com/hashicorp/terraform/blob/9d6cc85d0531018cf01868970d9dbf7a21ae99d0/CHANGELOG.md?plain=1#L10) から入りそうな雰囲気で、対象のissueは [S3 Backend: Support authentication via `aws login` · Issue #37976 · hashicorp/terraform](https://github.com/hashicorp/terraform/issues/37976)のようです。

# どうしたか

すぐにTerraformを使いたい、かつIAMユーザは使いたくなかったので、IAM Identity Centerを導入して `aws sso login` を使うことにしました。
こうするとCDKでもTerraformでもうまく行きました。
