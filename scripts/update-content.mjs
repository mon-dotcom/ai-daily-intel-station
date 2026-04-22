import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SITE_CONFIG } from "../src/config/site.mjs";
import { FALLBACK_DATA } from "../src/data/fallback-data.mjs";
import { formatDateInTimeZone, formatPublishedAt, formatTargetDateLabel, getTaipeiTargetDate, toDateKey } from "../src/lib/date.mjs";
import { buildReminder, buildBeginnerModules } from "../src/services/extra-service.mjs";
import { getGameTopics } from "../src/services/gaming-ai-service.mjs";
import { getGithubProjects } from "../src/services/github-service.mjs";
import { getMonthlyAiTools } from "../src/services/monthly-tools-service.mjs";
import { getAiTopics } from "../src/services/news-service.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const MONTHLY_TOOLS_FALLBACK = [
  {
    name: "Codex Plugins",
    officialUrl: "https://openai.com",
    capability: "把外部工具與資料來源接進 agent 工作流，讓 AI 能直接操作真實系統",
    useCase: "開發工具串接、內部工具自動化、工作流整合",
    learningLevel: "中"
  },
  {
    name: "Codex Subagents",
    officialUrl: "https://openai.com",
    capability: "把大型任務拆給多個 agent 並行處理，縮短複雜工作的完成時間",
    useCase: "研究拆工、程式開發協作、內容分析任務",
    learningLevel: "中"
  },
  {
    name: "mngr",
    officialUrl: "https://imbue.com",
    capability: "在 CLI 中大規模啟動與管理平行 coding agents",
    useCase: "大型程式任務拆分、平行代理實驗、開發流程加速",
    learningLevel: "高"
  },
  {
    name: "Latchkey",
    officialUrl: "https://imbue.com",
    capability: "替本地 AI agents 管理憑證與權限，降低接入真實服務時的摩擦",
    useCase: "本地 agent 權限管理、工具存取控管、安全試驗",
    learningLevel: "高"
  },
  {
    name: "Keystone",
    officialUrl: "https://imbue.com",
    capability: "讓 repository 更容易被 agent 理解與執行，強化 repo 級工作流自動化",
    useCase: "Repo 自動化、任務執行、開發流程標準化",
    learningLevel: "中"
  }
];

function compactText(text = "") {
  return String(text).replace(/\s+/g, " ").trim();
}

function escapeMarkdownCell(text = "") {
  return compactText(text).replace(/\|/g, "\\|");
}

function escapeFrontmatterValue(text = "") {
  return String(text).replace(/\n/g, " ").trim();
}

function formatTopicTime(dateLike) {
  return formatPublishedAt(dateLike, SITE_CONFIG.locale, SITE_CONFIG.timezone);
}

function withFallback(primary = [], fallback = [], expectedLength = fallback.length) {
  const items = Array.isArray(primary) ? primary.filter(Boolean) : [];
  if (items.length) return items.slice(0, expectedLength);
  return fallback.slice(0, expectedLength);
}

function renderTopicCard(item, options = {}) {
  const {
    calloutTitle = "",
    calloutText = "",
    includeCallout = true
  } = options;

  return [
    "::: card",
    `title: ${escapeFrontmatterValue(item.title)}`,
    `audience: ${escapeFrontmatterValue(item.audienceTag || "")}`,
    `time: ${escapeFrontmatterValue(formatTopicTime(item.publishedAt))}`,
    `image: ${escapeFrontmatterValue(item.imageUrl || "")}`,
    `sourceName: ${escapeFrontmatterValue(item.sourceName || "綜合整理")}`,
    `sourceUrl: ${escapeFrontmatterValue(item.sourceUrl || "#")}`,
    `sourceType: ${escapeFrontmatterValue(item.sourceType || "mixed")}`,
    `country: ${escapeFrontmatterValue(item.country || "其他國家")}`,
    `categories: ${escapeFrontmatterValue((item.categories || []).join(" | "))}`,
    `updatedAt: ${escapeFrontmatterValue(item.updatedAt || item.publishedAt || "")}`,
    `fetchedAt: ${escapeFrontmatterValue(item.fetchedAt || "")}`,
    ...(includeCallout
      ? [
          `calloutTitle: ${escapeFrontmatterValue(calloutTitle)}`,
          `callout: ${escapeFrontmatterValue(calloutText)}`
        ]
      : []),
    "---",
    compactText(item.summary || ""),
    ":::"
  ].join("\n");
}

function renderModuleCard(item) {
  return [
    "::: card",
    "style: module",
    `kicker: ${escapeFrontmatterValue(item.kicker || "今日觀察")}`,
    `title: ${escapeFrontmatterValue(item.title)}`,
    `footer: ${escapeFrontmatterValue(item.footer || "")}`,
    "---",
    compactText(item.body || ""),
    ":::"
  ].join("\n");
}

function renderAiNewsMarkdown(aiTopics) {
  const cards = aiTopics.map((item) =>
    renderTopicCard(item, {
      includeCallout: false,
      calloutTitle: "為什麼重要",
      calloutText: item.whyItMatters || "這則消息代表 AI 導入正在往可落地的工作流程前進。"
    })
  );
  return `---
label: 01 / 全球 AI 焦點
title: 全球 AI 關鍵動態
summary: 聚焦社群熱門討論、論壇、官方資訊與可接入的微信公眾號 AI 文章。
layout: topic-grid
---
${cards.join("\n\n")}
`;
}

function renderGithubMarkdown(projects) {
  const rows = projects
    .slice(0, SITE_CONFIG.maxGithubProjects)
    .map((project) => {
      const trendIcon = project.delta === "up" ? "▲" : project.delta === "down" ? "▼" : "■";
      return `| ${project.rank} | ${escapeMarkdownCell(project.name)} | [GitHub](${project.url}) | ${project.stars.toLocaleString("en-US")} | ${trendIcon} ${escapeMarkdownCell(project.deltaLabel)} | ${escapeMarkdownCell(project.projectType)} | ${escapeMarkdownCell(project.oneLiner)} | ${escapeMarkdownCell(project.useCase)} | ${escapeMarkdownCell(project.beginnerFriendly)} |`;
    })
    .join("\n");

  return `---
label: 03 / GitHub Heat Check
title: GitHub 昨天最值得關注的前十名 AI 開源項目
summary: 以表格整理可實際追蹤與評估的 AI 開源項目熱度。
layout: markdown
---
| Rank | 專案名稱 | 連結 | Star 數 | Trend | 專案類型 | 一句話特色 | 常見用途 | Beginner Fit |
| --- | --- | --- | ---: | --- | --- | --- | --- | --- |
${rows}
`;
}

function renderMonthlyToolsMarkdown(tools) {
  const rows = tools
    .map((tool) => `| ${escapeMarkdownCell(tool.name)} | [官方連結](${tool.officialUrl}) | ${escapeMarkdownCell(tool.capability)} | ${escapeMarkdownCell(tool.useCase)} | ${escapeMarkdownCell(tool.learningLevel)} |`)
    .join("\n");

  return `---
label: 04 / Monthly Tool Watch
title: 本月 AI 新工具介紹
summary: 聚焦近期聲量上升、具實用性的 AI 工具更新。
layout: markdown
---
| 工具名稱 | 官方連結 | 核心能力 | 適用場景 | 學習門檻 |
| --- | --- | --- | --- | --- |
${rows}
`;
}

function renderGameMarkdown(gameTopics) {
  const cards = gameTopics.map((item) =>
    renderTopicCard(item, {
      calloutTitle: "與遊戲產業的關聯",
      calloutText: item.relation || "值得觀察這則動態是否會影響遊戲團隊的 production pipeline。"
    })
  );
  return `---
label: 02 / 遊戲產業 × AI
title: 遊戲產業 × AI 重要進展
summary: 聚焦遊戲開發、內容產製、工具平台與可接入的微信公眾號遊戲 AI 文章。
layout: topic-grid
---
${cards.join("\n\n")}
`;
}

function renderBeginnerMarkdown(modules) {
  const cards = modules.map(renderModuleCard);
  return `---
label: 05 / 新手友善加餐
title: AI 入門與應用觀察
summary: 提供較易吸收的名詞解釋、工具觀察與實務建議。
layout: module-grid
---
${cards.join("\n\n")}
`;
}

function renderSiteMarkdown({ reminder, targetDateLabel, generatedLabel, dataStatus }) {
  return `---
siteName: AI 每日情報站
siteTagline: 每天早上 10:00，掌握昨天最重要的 AI 動態
heroEyebrow: TEAM KNOWLEDGE BOARD
heroPanelTitle: 今日觀測焦點
heroHighlights:
  - 本頁內容聚焦 ${targetDateLabel} 的 AI 與開源動態
  - GitHub 榜單與新工具清單會隨排程自動重整
  - 若部分來源失敗，系統會保留備援內容避免頁面中斷
generatedLabel: ${escapeFrontmatterValue(generatedLabel)}
updatedTimezone: 台北時間
dataStatusTitle: ${escapeFrontmatterValue(dataStatus.title)}
dataStatusMessage: ${escapeFrontmatterValue(dataStatus.message)}
footerTitle: 今日 AI 小提醒
reminder: ${escapeFrontmatterValue(reminder)}
---
`;
}

async function writeFile(relativePath, content) {
  await fs.writeFile(path.join(rootDir, relativePath), content, "utf8");
}

async function resolveAiTopics(dateKey) {
  try {
    const result = await getAiTopics(dateKey);
    return {
      items: withFallback(result.items, FALLBACK_DATA.aiTopics, SITE_CONFIG.maxHeroTopics),
      degradedSources: result.degradedSources || [],
      usedFallback: !(result.items || []).length
    };
  } catch {
    return {
      items: FALLBACK_DATA.aiTopics.slice(0, SITE_CONFIG.maxHeroTopics),
      degradedSources: ["ai-news"],
      usedFallback: true
    };
  }
}

async function resolveGameTopics(dateKey) {
  try {
    const result = await getGameTopics(dateKey);
    return {
      items: withFallback(result.items, FALLBACK_DATA.gameTopics, SITE_CONFIG.maxGameTopics),
      degradedSources: result.degradedSources || [],
      usedFallback: !(result.items || []).length
    };
  } catch {
    return {
      items: FALLBACK_DATA.gameTopics.slice(0, SITE_CONFIG.maxGameTopics),
      degradedSources: ["game-ai"],
      usedFallback: true
    };
  }
}

async function resolveGithubProjects(dateKey) {
  try {
    const result = await getGithubProjects(dateKey, rootDir);
    return withFallback(result.items, FALLBACK_DATA.githubProjects, SITE_CONFIG.maxGithubProjects);
  } catch {
    return FALLBACK_DATA.githubProjects.slice(0, SITE_CONFIG.maxGithubProjects);
  }
}

async function resolveMonthlyTools(dateKey) {
  try {
    const tools = await getMonthlyAiTools(dateKey, rootDir);
    return tools.length >= 5 ? tools : MONTHLY_TOOLS_FALLBACK;
  } catch {
    return MONTHLY_TOOLS_FALLBACK;
  }
}

async function main() {
  const targetDate = getTaipeiTargetDate();
  const generatedAt = new Date();
  const dateKey = toDateKey(targetDate, SITE_CONFIG.timezone);
  const targetDateLabel = formatTargetDateLabel(targetDate, SITE_CONFIG.locale, SITE_CONFIG.timezone);
  const generatedLabel = formatDateInTimeZone(
    generatedAt,
    SITE_CONFIG.locale,
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    },
    SITE_CONFIG.timezone
  );

  const [aiNewsResult, githubProjects, gameNewsResult, monthlyTools] = await Promise.all([
    resolveAiTopics(dateKey),
    resolveGithubProjects(dateKey),
    resolveGameTopics(dateKey),
    resolveMonthlyTools(dateKey)
  ]);

  const gameTitleSet = new Set((gameNewsResult.items || []).map((item) => compactText(item.title).toLowerCase()));
  const aiTopics = (aiNewsResult.items || []).filter((item) => !gameTitleSet.has(compactText(item.title).toLowerCase()));
  const gameTopics = gameNewsResult.items;

  const beginnerModules = buildBeginnerModules({ aiTopics, githubProjects, gameTopics });
  const reminder = buildReminder();
  const degradedSources = [...aiNewsResult.degradedSources, ...gameNewsResult.degradedSources];
  const dataStatus = degradedSources.length
    ? {
        title: "資料狀態",
        message: `部分即時來源抓取失敗，已優先保留最近可用文章。受影響來源：${degradedSources.join("、")}`
      }
    : {
        title: "資料狀態",
        message: "資料抓取、內容重建與靜態頁輸出皆已完成。"
      };

  await Promise.all([
    writeFile("content/site.md", renderSiteMarkdown({ reminder, targetDateLabel, generatedLabel, dataStatus })),
    writeFile("content/ai-news.md", renderAiNewsMarkdown(aiTopics)),
    writeFile("content/github-trending.md", renderGithubMarkdown(githubProjects)),
    writeFile("content/monthly-ai-tools.md", renderMonthlyToolsMarkdown(monthlyTools)),
    writeFile("content/game-ai.md", renderGameMarkdown(gameTopics)),
    writeFile("content/beginner-corner.md", renderBeginnerMarkdown(beginnerModules))
  ]);

  console.log(`Updated Markdown content for ${dateKey}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
