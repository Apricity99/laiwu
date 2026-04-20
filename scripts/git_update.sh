#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "当前目录还不是 Git 仓库，请先初始化仓库。"
  exit 1
fi

COMMIT_MSG="${1:-chore: update system files}"

TRACKED_PATHS=(
  ".gitignore"
  "README_GIT.md"
  "scripts"
  "原型系统"
  "原型系统_vue版"
  "原型系统_algo_python"
  "原型系统_backend_java"
  "原型系统联调说明.md"
  "技术路线.md"
)

git add "${TRACKED_PATHS[@]}"

if [[ -z "$(git status --short)" ]]; then
  echo "没有可提交的系统变更。"
  exit 0
fi

git commit -m "$COMMIT_MSG"

if git remote get-url origin >/dev/null 2>&1; then
  CURRENT_BRANCH="$(git branch --show-current)"
  git push origin "$CURRENT_BRANCH"
  echo "已提交并推送到 origin/$CURRENT_BRANCH"
else
  echo "已完成本地提交，但尚未配置 origin。"
  echo "请执行: ./scripts/git_set_remote.sh <远端仓库地址>"
fi
