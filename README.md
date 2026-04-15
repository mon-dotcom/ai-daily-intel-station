# AI 每日情報站

這個版本已改成：

- 內容層：`Markdown`
- 畫面層：自動生成的靜態 `HTML`

也就是說，你現在只需要維護 `content/*.md`，不需要手改 `index.html`。

## 核心概念

整個網站由多個 Markdown 檔案組成：

```text
content/
├─ site.md
├─ ai-news.md
├─ github-trending.md
├─ game-ai.md
└─ beginner-corner.md
```

生成流程：

1. 編輯 `content/*.md`
2. 執行 build
3. `scripts/generate.mjs` 讀取 Markdown
4. 轉成 HTML
5. 輸出到 `index.html`

## 專案結構

```text
ai-daily-intel-station/
├─ .github/
│  └─ workflows/
│     └─ daily-update.yml
├─ assets/
│  └─ garena-logo.png
├─ content/
│  ├─ site.md
│  ├─ ai-news.md
│  ├─ github-trending.md
│  ├─ game-ai.md
│  └─ beginner-corner.md
├─ scripts/
│  ├─ dev.mjs
│  └─ generate.mjs
├─ src/
│  ├─ config/
│  │  ├─ content.mjs
│  │  └─ site.mjs
│  ├─ lib/
│  │  ├─ content-utils.mjs
│  │  ├─ date.mjs
│  │  └─ markdown-content.mjs
│  └─ templates/
│     └─ page-template.mjs
├─ index.html
├─ package.json
├─ styles.css
└─ README.md
```

## 如何啟動網站

### 本機開發

```bash
cd ai-daily-intel-station
npm run dev
```

開啟：

```text
http://localhost:4321
```

特性：

- 會先自動生成一次 `index.html`
- 會監看 `content/`、`src/`、`styles.css`
- 你改完 Markdown 後，它會自動重建
- 瀏覽器重新整理後，就能看到最新內容

### 單次建置

```bash
npm run build
```

## 如何新增或更新內容

### 新增一篇內容

1. 在 `content/` 新增一個 `.md` 檔
2. 到 [`src/config/content.mjs`](./src/config/content.mjs) 把檔案加進去
3. 執行 `npm run build`

### 更新既有內容

直接改對應的 `.md` 檔即可，例如：

- `content/ai-news.md`
- `content/github-trending.md`
- `content/game-ai.md`

## Markdown 撰寫規則

每份內容檔分成兩部分：

1. frontmatter
2. 內容主體

### 1. Frontmatter 寫法

```md
---
label: 01 / 全球 AI 焦點
title: AI 圈昨天最紅的三大話題
summary: 區塊摘要說明
layout: topic-grid
---
```

常用欄位：

- `label`：區塊左上角小標
- `title`：區塊主標題
- `summary`：區塊摘要
- `layout`：渲染方式

支援的 `layout`：

- `markdown`
- `topic-grid`
- `module-grid`

## 基本內容結構對應

### 標題

Markdown：

```md
# 大標
## 中標
### 小標
```

HTML 對應：

- `#` → `<h1>` 或區塊內標題
- `##` → `<h2>`
- `###` → `<h3>`

### 段落

Markdown：

```md
這是一段內容。直接正常寫段落即可。
```

HTML 對應：

- `<p>`

### 條列

Markdown：

```md
- 項目一
- 項目二
```

或：

```md
1. 第一項
2. 第二項
```

HTML 對應：

- 無序列表 → `<ul>`
- 有序列表 → `<ol>`

### 引用區塊

Markdown：

```md
> 這是一段引用內容
```

HTML 對應：

- `<blockquote>`

## 進階內容規則

### 步驟說明

Markdown：

```md
::: steps
1. 第一步
2. 第二步
3. 第三步
:::
```

HTML 對應：

- `<ol class="steps-list">`

### 表格

Markdown：

```md
| 欄位一 | 欄位二 |
| --- | --- |
| 內容 A | 內容 B |
```

HTML 對應：

- `<div class="table-wrap"><table>...</table></div>`

### 圖片

Markdown：

```md
![圖片替代文字](https://example.com/image.jpg "這段會變成圖說")
```

HTML 對應：

- `<figure>`
- `<img>`
- `<figcaption>`

### 卡片內容

這是這個專案最重要的自訂語法，適合新聞卡片、工具卡片、摘要卡片。

Markdown：

```md
::: card
title: 卡片標題
audience: 適合誰看
time: 04/14 17:10
image: https://example.com/image.jpg
sourceName: 資料來源
sourceUrl: https://example.com
calloutTitle: 為什麼重要
callout: 這張卡片的補充重點
---
這裡開始才是卡片內文，可以繼續寫一般 Markdown。

- 可以條列
- 可以放連結
:::
```

HTML 對應：

- `layout: topic-grid` 時 → `<article class="topic-card">`
- `layout: module-grid` 時 → `<article class="module-card">`

## 各區塊推薦用法

### `layout: topic-grid`

適合：

- AI 話題卡片
- 遊戲圈 AI 話題
- 需要圖片、來源、補充觀點的內容

### `layout: markdown`

適合：

- 長文說明
- 表格整理
- 操作步驟
- 圖片說明
- 引用與筆記

### `layout: module-grid`

適合：

- 小技巧
- 名詞解釋
- 新手建議
- 短卡片內容

## `site.md` 用法

`content/site.md` 用來控制整頁 Hero 與頁尾資訊。

範例：

```md
---
siteName: AI 每日情報站
siteTagline: 每天早上 10:00，掌握昨天最重要的 AI 動態
heroEyebrow: TEAM KNOWLEDGE BOARD
heroPanelTitle: 今日觀測焦點
heroHighlights:
  - 第一條重點
  - 第二條重點
footerTitle: 今日 AI 小提醒
reminder: 這裡是頁尾提醒
---
```

## package.json 指令

已提供：

```json
{
  "scripts": {
    "build": "node ./scripts/generate.mjs",
    "build:page": "node ./scripts/generate.mjs",
    "dev": "node ./scripts/dev.mjs",
    "start": "node ./scripts/dev.mjs"
  }
}
```

說明：

- `npm run dev`：本機開發 + 監看 Markdown 變更
- `npm run build`：單次輸出 `index.html`
- `npm run build:page`：給排程或部署流程使用

## 自動更新

目前 GitHub Actions 仍保留：

- 每天台北時間早上 `10:00`
- 執行 `npm run build:page`
- 重新生成 `index.html`

前提是：

1. 你的 repo 已推上 GitHub
2. `.github/workflows/daily-update.yml` 已存在
3. 已設定 `GITHUB_TOKEN_CUSTOM`

## 團隊維護建議

- 編輯內容的人只改 `content/*.md`
- 維護版型的人只改 `styles.css` 與 `src/templates/page-template.mjs`
- 維護解析規則的人只改 `src/lib/markdown-content.mjs`

這樣內容、版型、生成邏輯三層就會清楚分離。
