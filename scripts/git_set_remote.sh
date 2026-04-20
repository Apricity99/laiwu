#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "当前目录还不是 Git 仓库，请先初始化仓库。"
  exit 1
fi

if [[ $# -lt 1 ]]; then
  echo "用法: ./scripts/git_set_remote.sh <远端仓库地址> [分支名]"
  exit 1
fi

REMOTE_URL="$1"
BRANCH_NAME="${2:-main}"

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi

git branch -M "$BRANCH_NAME"
git push -u origin "$BRANCH_NAME"

echo "已绑定远端 origin 并推送到 $BRANCH_NAME"
