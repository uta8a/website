---
type: "generated"
title: "証明可能性・演繹可能性・表現可能性の接続"
draft: false
description: "p.69 と p.147 のメモをつなぐ整理"
ogp: "ogp-big.webp"
tag:
  - "note"
  - "logic"
changelog:
  - summary: "note.md を基に本文とインフォグラフィック導線を作成"
    date: "2026-02-23T06:22:33.443+09:00[Asia/Tokyo]"
---

## 概要

`note.md` の要点は次の 3 点です。

1. [p.147](#p-147): 数値別に表現可能（\(\vdash_z\)、\(\bar{q}_1\) など）
2. [p.69](#p-69): 証明可能性と演繹可能性の一致（\(\Gamma \vdash_S A\)、空集合なら \(\vdash_S A\)）
3. 以上より、証明可能性・演繹可能性・表現可能性は相互に接続して理解できる

## 参照ポイント

<h3 id="p-147">p.147</h3>

- 数値別に表現可能
- \(\vdash_z\): Z のもとで演繹可能（[p.69](#p-69)）
- \(\bar{q}_1\): Z における項 \(0, 0', 0''\) を \(0, \bar{1}, \bar{2}\) と表現（[p.132](#p-132)）

<h3 id="p-69">p.69</h3>

- \(\Gamma \vdash_S A\) は、\(\Gamma\) が空集合のとき \(\vdash_S A\) と表記
- これは証明可能を意味する

<h3 id="p-132">p.132</h3>

- p.147 で触れている \(\bar{q}_1\) の数値表現の参照先としてアンカーを配置

## インフォグラフィック

以下の `math-1.html` は、このページ（`README.md` が Astro により `index.html` 化されたページ）内で読み込まれ、図として機能します。

<div style="position: absolute; left: 50%; right: 50%; margin-left: -50vw; margin-right: -50vw; width: 100vw; padding: 0 2vw; box-sizing: border-box;">
  <iframe
    src="./math-1.html"
    title="証明可能性・演繹可能性・表現可能性のインフォグラフィック"
    loading="lazy"
    style="width: 100%; min-height: 820px; border: 0; border-radius: 16px;"
  ></iframe>
</div>
