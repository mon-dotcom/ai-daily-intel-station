#!/bin/zsh
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/Users/chiayin/Codex/ai-daily-intel-station}"
LOG_DIR="${LOG_DIR:-$ROOT_DIR/logs}"
DATE_STAMP="$(date '+%Y-%m-%d %H:%M:%S')"
NODE_BIN_DIR="${NODE_BIN_DIR:-/Users/chiayin/.nvm/versions/node/v24.14.1/bin}"

WECHAT_RSS_ORIGIN_URL="${WECHAT_RSS_ORIGIN_URL:-http://localhost:4000}"
WECHAT_RSS_FEED_IDS="${WECHAT_RSS_FEED_IDS:-量子位|MP_WXS_3236757533,游戏葡萄|MP_WXS_2399768513,GameLook|MP_WXS_2397402280,DataEye游戏观察|MP_WXS_3083148204,罗斯基|MP_WXS_3209762660,SensorTower|MP_WXS_3988143275,竞核|MP_WXS_3902648252,开源志|MP_WXS_3865870672}"
WECHAT_RSS_LIMIT="${WECHAT_RSS_LIMIT:-60}"

export PATH="$NODE_BIN_DIR:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

mkdir -p "$LOG_DIR"

exec >>"$LOG_DIR/local-daily-update.log" 2>&1

echo "[$DATE_STAMP] Starting local daily update"

cd "$ROOT_DIR"

if ! curl -fsS "$WECHAT_RSS_ORIGIN_URL/feeds/" >/dev/null; then
  echo "[$DATE_STAMP] WeWe RSS is unavailable at $WECHAT_RSS_ORIGIN_URL"
  exit 1
fi

git pull --ff-only origin main

export WECHAT_RSS_ORIGIN_URL
export WECHAT_RSS_FEED_IDS
export WECHAT_RSS_LIMIT

npm run update:content
npm run preserve:china
npm run diagnose:wechat
npm run build
npm run validate:china

if ! git diff --quiet -- content/*.md index.html src/data/github-snapshot.json src/data/monthly-tools-history.json; then
  git add content/*.md index.html src/data/github-snapshot.json src/data/monthly-tools-history.json
  git commit -m "chore: update daily AI intel"
  git push origin main
  echo "[$DATE_STAMP] Changes pushed to GitHub"
else
  echo "[$DATE_STAMP] No content changes detected"
fi

echo "[$DATE_STAMP] Local daily update completed"
