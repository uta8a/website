---
type: "note"
title: "AIエージェントのためのVirtual Monorepoを作っている"
draft: true
description: "複数リポジトリをまたぐAIエージェントの作業を、安全に整理して知識として残すためにvmrを作っている話"
ogp: "ogp-big.webp"
tag:
  - "note"
  - "ai-agent"
  - "codex"
  - "virtual-monorepo"
  - "vmr"
changelog:
  - summary: "Initial draft"
    date: "2026-07-25T08:47:58.796+09:00[Asia/Tokyo]"
---

最近、AIエージェントにコードを書いてもらうときの作業場について考えています。

一つのリポジトリの中で完結する変更なら、リポジトリを開いてCodexに依頼すれば十分です。しかし実際には、CLI本体を変更しながら利用側の設定やドキュメントも更新する、といった複数リポジトリをまたぐ作業があります。

そこで、AIエージェントが複数リポジトリを安全に扱い、作業の経緯まで残せる環境としてVirtual Monorepoを作っています。その環境を管理するCLIが `vmr` (**v**irtual **m**ono**r**epo)です。

`vmr` は現在、[uta8a/vmr](https://github.com/uta8a/vmr) で公開しています。この記事では、その設計で重視していることと基本的な使い方を紹介します。

はじめに、この記事で使う用語を整理します。

`vmr` 固有の用語は次のとおりです。

- **Session**: 一つのタスクに対応する作業単位。必要なリポジトリのlinked worktree、作業記録、Evidence、Reportをまとめて管理します
- **Evidence**: 実行したテストやGitの状態など、作業結果を確認するための記録です
- **Report**: Sessionで行った変更、検証結果、判断、残ったリスクなどを人間が確認できるMarkdownにまとめたものです

また、**LLM Wiki**は、完了した作業から得た知識を次のAIエージェントへ渡すためのprivateなWikiを指します。`vmr` では、人間が承認したReportだけをLLM Wikiへ取り込みます。

# Virtual Monorepoとは

ここでいうVirtual Monorepoは、複数のGitリポジトリを一つの巨大なリポジトリへ統合するものではありません。それぞれを独立したGitリポジトリとして保ったまま、AIエージェントからは一つの作業空間として扱えるようにする構成です。

大きく分けると、次の3つの領域があります。

```txt
repos/       共有する通常のclone
workspace/   Session、作業記録、Reportなどを置くprivateな領域
wiki/        privateなLLM Wiki
```

`repos/` のcloneは作業元としてworkspace以下の各Session間で共有します。実際の変更はSessionごとに作るlinked worktreeで行うため、共有cloneを直接編集しません。複数リポジトリをまとめて見られる便利さと、それぞれのリポジトリが持つ履歴やremoteを維持することを両立したいと考えています。

# なぜAIエージェント向けに作るのか

AIエージェントは、状況を読み取ってコードや文章を変更するような、判断を伴う作業を得意としています。一方、Sessionの作成、worktreeの配置、状態遷移、Evidenceの保存といった操作は、同じ入力から同じ結果になることが重要です。

そこで `vmr` では、このような決定的な操作をCLIが担当します。AIエージェントは定型的な管理処理を毎回組み立て直す必要がなくなり、Sessionに用意された作業環境で本来のタスクに集中できます。

- 作業ごとにSessionを作る
- 必要なリポジトリだけをSessionへattachする
- Session専用のbranchとlinked worktreeで変更する
- テスト結果をEvidenceとして記録する
- 作業内容を人間が編集できるReportにまとめる
- 承認したReportだけをLLM Wikiへstageする

Session名には日付、ULID、slugを含む `YYYY-MM-DD--ULID--slug` 形式を採用しています。日付とULIDによってディレクトリを時系列に並べられ、slugによって人間も作業内容を見分けられます。Sessionの状態はmetadataを正として管理し、作業中、レビュー中、完了といったライフサイクルも明示します。

`vmr` は、人間が対話的に操作するためというより、CodexのようなAIエージェントから使うことを前提にしたCLIです。CodexはVirtual Monorepoのrootから起動し、必要に応じて `vmr` を使ってリポジトリ、Session、作業記録を管理します。

# 実際の作業の流れ

基本的な流れは次のようなものです。Virtual Monorepo側には、この流れをCodexから実行するためのSkillsを用意しています。以下では動きを説明するためにコマンドを示しますが、通常は人間が直接入力するのではなく、Codexへ作業を依頼するとSkillsに従って実行されます。人間が `vmr` コマンドを直接使うのは、主にデバッグするときです。

まずVirtual Monorepoを初期化し、管理対象のリポジトリをcloneします。

```console
vmr init
vmr repo clone vmr
vmr repo status
```

次に、作業内容に対応するSessionを作ります。

```console
vmr session create --slug implement-feature --title "Implement feature" --repo vmr
vmr session start <session>
```

このとき、Session内には `vmr/<session-ulid>/<repository-id>` というbranchのlinked worktreeが作られます。別のリポジトリも必要になったら、作業対象として追加でattachします。エージェントにはSession内にリンクされたworktreeだけを編集してもらいます。

テストは単に実行するだけでなく、コマンドと終了コードをEvidenceとして残せます。

```console
vmr evidence test run <session> --repo vmr --name unit-tests -- go test ./...
```

変更ができたらSessionをreviewへ進め、Reportを生成します。

```console
vmr session review <session>
vmr report generate <session>
vmr report validate <session>
vmr report approve <session>
```

Reportは機械的なログで終わらず、人間が直接編集できます。承認はReportのSHA-256 hashに対して行われるため、承認後に内容が変われば再びdraft扱いになります。人間の確認を形式だけにしないための仕組みです。

承認済みのReportはprivateなLLM Wikiへstageできます。

```console
vmr wiki stage virtual-monorepo <session>
vmr session close <session> --outcome succeeded
vmr session archive <session>
```

作業中の会話やテスト結果だけでなく、確認済みの知識を次の作業へ渡すところまでを一つの流れにしたいと思っています。

# 記録を残すときの安全性

AIエージェントのイベントやtranscriptには、意図せず機密情報が含まれる可能性があります。`vmr` ではHookの値、テスト出力、transcript、URL、エラーを永続化する前にredactする設計にしています。大きすぎる出力はそのまま保存せず、サイズとdigestのmetadataに置き換えます。

Codexから届く `PermissionRequest` は、ほかのHookイベントと同様にredactして記録しますが、`vmr` が承認結果を返すことはありません。また、既存cloneのremoteは初期化時に期待値と一致するか検証し、異なっていても書き換えません。Sessionのarchiveは、未保存の変更があるdirtyなworktreeを検出すると中止します。これらはそれぞれ、Hookを受け取る `internal/codex`、Git操作を扱う `internal/gitutil`、Sessionを管理する `internal/session` に実装しています。

# まだ実装していないもの

今後追加したいものとして、SessionやReportを横断して検索するためのSQLite indexと、1Passwordから必要なSecretを取得して一時的に注入するbrokerがあります。

まず完成させたいのは、各タスクをSessionとして表現し、そこで得た知識をReportにまとめ、人間が確認したうえでLLM Wikiへ永続化するまでの一連のループです。機能を増やす前に、このループを実際の開発で繰り返し使えるものにしたいと考えています。

# まとめ

Virtual Monorepoで作りたいのは、単に複数リポジトリを同じディレクトリへ置いた環境ではありません。AIエージェントが横断的に作業しやすく、それでいて人間が変更範囲、検証結果、残す知識を確認できる作業場です。

`vmr` は公開後も、自分の開発作業で運用しながら改善を続けています。AIエージェントの作業を一度きりの会話で終わらせず、確認できる記録と再利用できる知識へつなげる仕組みにしていきたいです。
