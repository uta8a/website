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

[TODO: publicにした後に修正する | なお、`uta8a/vmr` リポジトリは現在privateです。将来的にpublicにする予定ですが、現時点ではリポジトリを閲覧したりインストールしたりすることはできません。この記事では、公開に向けて作っているものの考え方と使い方を紹介します。]

[TODO: 用語を先に説明する。Session, Reportのような固有の用語とLLM wikiのような一般だけど説明した方がいい用語の2通りに分けて説明]

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

[TODO: ここ微妙表現。単純に、決定的な操作はvmrが担当することでAIエージェントが動きやすくなるようにしたのが大きい。 | AIエージェントは速く作業できますが、自由に動ける範囲が広いほど「どのリポジトリを変更したのか」「何を根拠に完了としたのか」が見えにくくなります。]

[TODO: 作業の境界という単語が曖昧。上の指摘と同じで、決定的な操作をCLIで実現し、AIエージェントが作業しやすくしているのが重視するポイント。 | そのため `vmr` では、コードをまとめることよりも作業の境界を明確にすることを重視しています。]

- 作業ごとにSessionを作る
- 必要なリポジトリだけをSessionへattachする
- Session専用のbranchとlinked worktreeで変更する
- テスト結果をEvidenceとして記録する
- 作業内容を人間が編集できるReportにまとめる
- 承認したReportだけをLLM Wikiへstageする

Session名には日付とULIDが入り、どの作業だったかを後から追えるようにしています。Sessionの状態はmetadataを正として管理し、作業中、レビュー中、完了といったライフサイクルも明示します。[TODO: session名が時系列順に並び、かつ人間から見て分かりやすいのを目指して、日付-ULIDを採用している点を追記したい]

[TODO: Codexを起動しないのが重要なのではなく、vmrは完全にAgent(Codex)から使う前提で設計されている、の方が正しい。 | `vmr` 自体がCodexを起動するわけではない点も重要です。CodexはVirtual Monorepoのrootから直接起動し、`vmr` はリポジトリやSession、記録を管理する役割に絞っています。]

# 実際の作業の流れ

[TODO: 公開後に見直す | 公開後に想定している]基本的な流れは次のようなものです。[TODO: 作業は全てCodexからの指示で行うように、Virtual Monorepo側でSkillsを整備しているのを前提とします。実際にはvmrコマンドを人間が打つことはデバッグ時以外はないです、というのを書く]

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

[TODO: これどういう意味ですか？該当する実装部分を教えて | また、Hookから権限リクエストを自動承認しません。Gitのremoteを勝手に書き換えたり、dirtyなworktreeを自動で削除・archiveしたりもしません。便利さのために境界を曖昧にしないことを優先しています。]

# まだ実装していないもの

[TODO: SQLite indexとbrokerは欲しいけど他はいらないです。 | 現在の `vmr` は最初のリリースに向けて開発中です。Web UI、daemon、SQLite index、telemetry export、自動commit・push、PR作成などはありません。ReportをLLMが解釈して生成する機能や、1PasswordからSecretを取得・注入するbrokerも未実装です。]

[TODO: 各タスクをsessionとして表現し、その中で学んだことをreportからLLM wikiに永続化する一連のループをまず実装したい、みたいな表現に変える | 最初から多機能にするより、Sessionで作業範囲を区切り、Evidenceを残し、人間がReportを確認するという核を先に固めたいと考えています。]

# まとめ

Virtual Monorepoで作りたいのは、単に複数リポジトリを同じディレクトリへ置いた環境ではありません。AIエージェントが横断的に作業しやすく、それでいて人間が変更範囲、検証結果、残す知識を確認できる作業場です。

[TODO: publicにしたら見直す | `vmr` は現在privateで、まだ公開前です。実際に使える状態でpublicにできるよう、まずは自分の開発作業で運用しながら整えていきます。]
