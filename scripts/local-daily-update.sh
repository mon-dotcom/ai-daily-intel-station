#!/bin/zsh
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/Users/chiayin/Codex/ai-daily-intel-station}"
LOG_DIR="${LOG_DIR:-$ROOT_DIR/logs}"
NODE_BIN_DIR="${NODE_BIN_DIR:-/Users/chiayin/.nvm/versions/node/v24.14.1/bin}"

WECHAT_RSS_ORIGIN_URL="${WECHAT_RSS_ORIGIN_URL:-http://localhost:4000}"
WECHAT_RSS_FEED_IDS="${WECHAT_RSS_FEED_IDS:-量子位|MP_WXS_3236757533,游戏葡萄|MP_WXS_2399768513,GameLook|MP_WXS_2397402280,DataEye游戏观察|MP_WXS_3083148204,罗斯基|MP_WXS_3209762660,SensorTower|MP_WXS_3988143275,竞核|MP_WXS_3902648252,开源志|MP_WXS_3865870672}"
WECHAT_RSS_LIMIT="${WECHAT_RSS_LIMIT:-60}"

export PATH="$NODE_BIN_DIR:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

mkdir -p "$LOG_DIR"

exec >>"$LOG_DIR/local-daily-update.log" 2>&1

timestamp_now() {
  date '+%Y-%m-%d %H:%M:%S'
}

echo "[$(timestamp_now)] Starting local daily update"

cd "$ROOT_DIR"

WEWE_RETRY_COUNT="${WEWE_RETRY_COUNT:-6}"
WEWE_RETRY_SLEEP_SECONDS="${WEWE_RETRY_SLEEP_SECONDS:-5}"
WEWE_HEALTHCHECK_PATH="${WEWE_HEALTHCHECK_PATH:-/feeds/}"

build_healthcheck_urls() {
  local origin="$1"
  local primary="${origin}${WEWE_HEALTHCHECK_PATH}"

  if [[ "$origin" == "http://localhost:"* ]]; then
    local fallback_origin="http://127.0.0.1${origin#http://localhost}"
    local fallback="${fallback_origin}${WEWE_HEALTHCHECK_PATH}"
    echo "$primary"
    echo "$fallback"
    return
  fi

  echo "$primary"
}

check_wewe_ready() {
  local origin="$1"
  local url

  while IFS= read -r url; do
    if curl -fsS --max-time 5 "$url" >/dev/null; then
      return 0
    fi
  done < <(build_healthcheck_urls "$origin")

  return 1
}

wewe_ready=false
for attempt in $(seq 1 "$WEWE_RETRY_COUNT"); do
  if check_wewe_ready "$WECHAT_RSS_ORIGIN_URL"; then
    wewe_ready=true
    break
  fi

  echo "[$(timestamp_now)] WeWe RSS check failed (attempt $attempt/$WEWE_RETRY_COUNT): $WECHAT_RSS_ORIGIN_URL"

  if [ "$attempt" -lt "$WEWE_RETRY_COUNT" ]; then
    sleep "$WEWE_RETRY_SLEEP_SECONDS"
  fi
done

if [ "$wewe_ready" != true ]; then
  echo "[$(timestamp_now)] WeWe RSS is unavailable at $WECHAT_RSS_ORIGIN_URL after $WEWE_RETRY_COUNT attempts"
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
  echo "[$(timestamp_now)] Changes pushed to GitHub"
else
  echo "[$(timestamp_now)] No content changes detected"
fi

echo "[$(timestamp_now)] Local daily update completed"
