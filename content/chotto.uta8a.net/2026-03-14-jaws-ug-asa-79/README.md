---
type: "note"
title: "JAWS-UG朝会 #79 に参加したよ"
draft: false
description: "まだ触ってないAWSのサービスが多くてモチベが上がりました"
ogp: "ogp-big.webp"
tag:
  - "note"
changelog:
  - summary: "Initial draft"
    date: "2026-03-14T06:27:28.456+09:00[Asia/Tokyo]"
---

[JAWS-UG朝会 #79](https://jawsug-asa.connpass.com/event/375345/) に参加してきました。軽く感想や、発表を聞いて自分でもやってみたくなったことをメモします。

# セッション① 個人的によく知らなかったAgentCore Memoryの機能を中心に深掘りしてみた

[発表資料](https://speakerdeck.com/yuu551/ge-ren-de-niyokuzhi-ranakatuta-agentcore-memorynoji-neng-wozhong-xin-nishen-jue-risitemita)

- AgentCore触ったことなかったのですが、AgentCoreの概要から話してくださってよかったです。どういう点で嬉しいのか、re:Inventのこれはどういう点が新しいのか、といったAgentCoreの良さが分かる発表でした。
- 感想として、SNSでメタデータ送って通知として、S3に貯めておいたblobっぽいのをLambdaで処理するみたいなパターンはよく見かけるので、AI時代でもアーキテクチャ変わらないんだという面白さを感じました。
- 個人的にはStrands Agentとかを触ってみたい気持ちになりました。AI Agent、作る方は全然想像がつかない...

# セッション② 猫でもわかるKiro CLI(AI駆動開発への道編)

[発表資料](https://speakerdeck.com/kentapapa/mao-demowakarukiro-cli-ai-qu-dong-kai-fa-henodao-bian)

- これすごい良かったです。
  - Kiroに対する発表者の情熱が分かるエピソードが良かったです
  - 他の資料を参照するときに、その資料が読みたくなるような紹介の仕方をされていて良かったです。読みたくなりました。
- 個人的に次やりたいこと
  - [Claude Code Meetup Japan #3](https://www.youtube.com/live/csJhIQFuYJw?si=aZXQtYwf66DRxzNR) の録画視聴
  - [ロボットのための工場に灯りは要らない](https://speakerdeck.com/watany/dark-factory-for-agent) を読む
  - [AI-DLC workflow](https://github.com/awslabs/aidlc-workflows) を触ってみる
  - [AI-DLCを完全理解するブログシリーズ](https://yoshidashingo.com/entry/aidlc01) を読む
  - CDKを書くときにKiro, Kiro CLIを使ってみる
  - AWSの資格の勉強にKiro, Kiro CLIを使ってみる
- 感想として、この時代変化が激しく「読んだ方がいい・やった方がいいこと」って無限に出てくるので疲れちゃいます。でもこうした発表で熱意ある紹介を受けるとモチベが上がるのでありがたいなと思いました。

# LT① OpenClaw を Lightsail で動かす理由

- 個人的に既に知っている内容が多かったので、復習として調べ直すきっかけになって良かったです。
- Lightsailってあんまり使われてない印象ですが、こういう用途だとキラーユースケースだよな〜と思いました。

# LT② Lambda Web AdapterでLambdaをWEBフレームワーク利用する

[発表資料](https://speakerdeck.com/sahou909/lambda-web-adapterdelambdawowebhuremuwakuli-yong-suru)

- Lambda Web Adapter知らなかったので、 `app.listen` みたいに通常のwebサーバを書きながらもLambdaに載せられるのいいな〜と思いました。
- Hono使っているとlambda/localの切り替えが楽なので、フレームワーク側の設計次第ではこれは不要になりそうです。ただ挙げられていた例(Spring Bootとか)見るとサクッとLambdaで動かしたいときの第一候補になりそうですね。

# LT③ AWS Transform for Mainframeをre:Capする

[発表資料](https://speakerdeck.com/sato4mi/aws-transform-for-mainframewore-capsuru)

- メインフレーム知らなかったので、COBOLをJavaに置き換えるんだ！？というところから面白かったです。
- 短い時間で嬉しさが伝わる発表をされていて、セッション2もそうですが聞いている側からするとおお〜おもろいってなるのでありがたいです。知らない世界だった。
- ドメインの分解をして、ビジネスロジックを部分的に移行していくというのはどこでも共通なので、メインフレームでもそうなんだというのが分かり面白かったです。
