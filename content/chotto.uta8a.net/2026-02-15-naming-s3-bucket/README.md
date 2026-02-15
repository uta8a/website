---
type: "note"
title: "S3バケット名のsuffixについて"
draft: false
description: "S3バケットの命名はグローバルで一意なので、他人と被らないようにaccount idとregionをsuffixにすることが多い。"
ogp: "ogp-big.webp"
tag:
  - "note"
  - "AWS"
  - "S3"
changelog:
  - summary: "Initial draft"
    date: "2026-02-15T19:55:06.671+09:00[Asia/Tokyo]"
---

S3バケットの命名について。
S3バケットはグローバルで一意である必要がある。

> Bucket names must be unique across all AWS accounts in all of the AWS Regions within a partition. A partition is a grouping of Regions. AWS currently has three partitions: aws (commercial Regions), aws-cn (China Regions), and aws-us-gov (AWS GovCloud (US) Regions).
> 
> [General purpose bucket naming rules - Amazon Simple Storage Service](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html)

"across all AWS accounts" がポイントで、他人の作った別アカウントのバケットとも被ってはいけない。
そこで他人と被ってないものをbucket名に入れたくなる。それはアカウントIDだろうということで、regionも跨ぐことを加味して `<account-id>-<region>` をsuffixにすることが多い。
例えば、CDKのbootstrap時に作られるS3バケットは `cdk-hnb659fds-assets-<account-id>-<region>` という命名規則になっている。
このsuffixは `<account-id>-<region>` にするのは規則ではなく、一般的な慣習となっている。

これは慣習だが、制約は他にもある(prefixは `xn--` から始まってはいけない、など)。一度目を通すと良さそう。
