#!/usr/bin/env bash
set -euo pipefail

overwrite_all=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --all)
      overwrite_all=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [--all]"
      echo "  --all  既存ファイルの上書き確認を行わず、すべて上書きする"
      exit 0
      ;;
    *)
      echo "Error: 不明なオプションです: $1" >&2
      echo "Usage: $0 [--all]" >&2
      exit 1
      ;;
  esac
done

if ! command -v mmdc >/dev/null 2>&1; then
  echo "Error: mmdc (Mermaid CLI) が見つかりません。" >&2
  echo "npm/pnpm などで @mermaid-js/mermaid-cli をインストールしてください。" >&2
  exit 1
fi

shopt -s nullglob
inputs=(files.ignore/*.mermaid)
shopt -u nullglob

if [[ ${#inputs[@]} -eq 0 ]]; then
  echo "Error: files.ignore/*.mermaid が見つかりません。" >&2
  exit 1
fi

for input in "${inputs[@]}"; do
  base="$(basename "$input" .mermaid)"
  output="./${base}.png"

  if [[ -f "$output" ]]; then
    if [[ "$overwrite_all" != true ]]; then
      read -r -p "$output はすでに存在します。上書きしますか？ [y/N]: " answer
      case "$answer" in
        [yY]|[yY][eE][sS]) ;;
        *)
          echo "スキップ: $input"
          continue
          ;;
      esac
    fi
  fi

  mmdc -i "$input" -o "$output" --puppeteerConfigFile files.ignore/puppeteer.json
  echo "変換完了: $input -> $output"
done
