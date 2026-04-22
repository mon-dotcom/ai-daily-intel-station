# Mac 本機自動更新設定

這份設定適合目前的架構：

- `wewe-rss` 跑在這台 Mac 的 Docker
- `ai-daily-intel-station` 也在這台 Mac 上更新
- 更新完後由這台 Mac `git push`
- GitHub / Vercel 再自動部署網站

## 1. 先確認前置條件

在 Mac Terminal 先確認這些都正常：

```bash
docker ps
node --version
npm --version
git --version
```

另外確認 WeWe 服務可用：

```bash
curl -fsS http://localhost:4000/feeds/
```

## 2. 讓更新腳本可執行

```bash
chmod +x /Users/chiayin/Codex/ai-daily-intel-station/scripts/local-daily-update.sh
```

## 3. 先手動跑一次

```bash
/Users/chiayin/Codex/ai-daily-intel-station/scripts/local-daily-update.sh
```

成功後可以檢查：

- log 檔：`/Users/chiayin/Codex/ai-daily-intel-station/logs/local-daily-update.log`
- GitHub repo 是否有新 commit
- Vercel 是否開始自動部署

## 4. 建立 launchd plist

建立檔案：

`~/Library/LaunchAgents/com.nina.ai-daily-intel.local-update.plist`

內容如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.nina.ai-daily-intel.local-update</string>

  <key>ProgramArguments</key>
  <array>
    <string>/bin/zsh</string>
    <string>/Users/chiayin/Codex/ai-daily-intel-station/scripts/local-daily-update.sh</string>
  </array>

  <key>WorkingDirectory</key>
  <string>/Users/chiayin/Codex/ai-daily-intel-station</string>

  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>10</integer>
    <key>Minute</key>
    <integer>7</integer>
  </dict>

  <key>RunAtLoad</key>
  <false/>

  <key>StandardOutPath</key>
  <string>/Users/chiayin/Codex/ai-daily-intel-station/logs/launchd.stdout.log</string>

  <key>StandardErrorPath</key>
  <string>/Users/chiayin/Codex/ai-daily-intel-station/logs/launchd.stderr.log</string>
</dict>
</plist>
```

## 5. 載入排程

```bash
mkdir -p /Users/chiayin/Codex/ai-daily-intel-station/logs
launchctl unload ~/Library/LaunchAgents/com.nina.ai-daily-intel.local-update.plist 2>/dev/null || true
launchctl load ~/Library/LaunchAgents/com.nina.ai-daily-intel.local-update.plist
```

## 6. 驗證排程狀態

```bash
launchctl list | grep ai-daily-intel
```

如果要立刻手動觸發一次：

```bash
launchctl start com.nina.ai-daily-intel.local-update
```

## 7. 之後如果新增公眾號

打開腳本：

`/Users/chiayin/Codex/ai-daily-intel-station/scripts/local-daily-update.sh`

更新這行：

```bash
WECHAT_RSS_FEED_IDS="..."
```

格式是：

```text
公眾號名稱|feed_id,公眾號名稱|feed_id
```

更新後不用改排程，隔天會自動吃到新來源。

## 8. 重要提醒

- 每天 `10:07` 那時候，Mac 必須開機
- Docker Desktop 必須開著
- `wewe-rss` container 必須活著
- 在 WeWe 還沒恢復前，不要手動跑會覆蓋內容的指令

