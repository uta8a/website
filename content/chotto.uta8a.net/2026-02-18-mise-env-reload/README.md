---
type: "note"
title: "miseの環境変数をリロードする方法"
draft: false
description: "miseのEnvironmentsをmise envを用いてリロードする"
ogp: "ogp-big.webp"
tag:
  - "note"
  - "mise"
changelog:
  - summary: "Initial draft"
    date: "2026-02-18T05:50:33.711+09:00[Asia/Tokyo]"
---

[miseのEnvironments](https://mise.jdx.dev/environments/) は mise.toml の `[env]` ブロックに環境変数を定義できる便利な機能。
ただ、ターミナルでEnterキーを押すと毎回リロードされるわけでもなさそうだった。

```console
$ echo $HOGE
a
# envをいじる
$ echo $HOGE
a # 反映されてない
```

個人的には環境変数を通信で取ってきている場合を踏まえると毎回リロードされない方がいいと思う。とはいえ、リロードみたいなことがしたくなる。
ちょっと考えると `mise env` で環境変数一覧のexportが出るので、

```console
$(mise env)
```

を実行するだけで良さそう。この方法では自分で定義した環境変数以外にも、mise側で設定しているPATH等もexportしなおされるので、そこは注意。
