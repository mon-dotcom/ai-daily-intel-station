import fs from "node:fs/promises";
import path from "node:path";

import { fetchJson } from "../lib/fetch-utils.mjs";

const EXCLUDED_TOOLS = new Set([
  "chatgpt",
  "midjourney",
  "notion ai",
  "claude",
  "perplexity",
  "gemini",
  "copilot"
]);

const FALLBACK_TOOLS = [
  {
    name: "Codex Plugins",
    officialUrl: "https://openai.com",
    capability: "把外部工具與資料來源接進 Codex 工作流，讓 agent 能直接操作真實系統",
    useCase: "開發工具串接、內部工具自動化、工作流整合",
    learningLevel: "中"
  },
  {
    name: "Codex Subagents",
    officialUrl: "https://openai.com",
    capability: "讓複雜任務可拆成多個並行 agent 協作處理，提高大型任務處理效率",
    useCase: "多工研究、程式開發拆工、內容與分析協作",
    learningLevel: "中"
  },
  {
    name: "mngr",
    officialUrl: "https://imbue.com",
    capability: "在 CLI 中大規模啟動與管理平行 coding agents，強化 agent orchestration",
    useCase: "大型程式任務拆分、平行代理實驗、開發流程加速",
    learningLevel: "高"
  },
  {
    name: "Latchkey",
    officialUrl: "https://imbue.com",
    capability: "提供給本地 AI agents 使用的憑證層，降低代理操作真實服務時的權限摩擦",
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

function toDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function daysAgo(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return toDateOnly(date);
}

function normalizeName(name = "") {
  return name.replace(/^.*\//, "").trim().toLowerCase();
}

function inferLearningLevel(repo) {
  const text = `${repo.name} ${repo.description || ""}`.toLowerCase();
  if (/(cli|sdk|framework|infra|serving|orchestr)/.test(text)) return "高";
  if (/(workflow|agent|automation|plugin|toolkit)/.test(text)) return "中";
  return "低";
}

function inferUseCase(repo) {
  const text = `${repo.name} ${repo.description || ""}`.toLowerCase();
  if (/(code|developer|devtool|cli)/.test(text)) return "AI coding、代理協作、開發流程";
  if (/(video|image|audio|voice|media)/.test(text)) return "影片生成、語音處理、多媒體內容";
  if (/(workflow|agent|automation|plugin|toolkit)/.test(text)) return "自動化工作流、agent 任務執行、工具串接";
  if (/(search|knowledge|rag|docs)/.test(text)) return "知識整理、搜尋增強、內部知識應用";
  return "團隊試作、流程優化、AI 應用驗證";
}

function inferCapability(repo) {
  const description = (repo.description || "").trim();
  if (description) return description;
  return "近期聲量上升的 AI 工具，適合追蹤其工作流價值與實作成熟度。";
}

async function readHistory(historyPath) {
  try {
    const raw = await fs.readFile(historyPath, "utf8");
    return JSON.parse(raw);
  } catch {
    return { items: [] };
  }
}

async function writeHistory(historyPath, tools, targetDateKey) {
  const payload = {
    items: tools.map((tool) => ({
      name: tool.name,
      lastFeatured: targetDateKey
    }))
  };

  await fs.writeFile(historyPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

async function fetchHnSignals() {
  try {
    const url = "https://hn.algolia.com/api/v1/search_by_date?tags=story&query=AI%20tool";
    const data = await fetchJson(url, {
      headers: { "user-agent": "ai-daily-intel-station/1.0" }
    });
    return data.hits || [];
  } catch {
    return [];
  }
}

function scoreRepo(repo, hnSignals = []) {
  let score = 0;
  score += repo.stargazers_count || 0;
  score += (repo.forks_count || 0) * 8;
  score += (repo.open_issues_count || 0) * 3;

  const normalized = normalizeName(repo.full_name || repo.name);
  const hnBoost = hnSignals.some((item) => {
    const title = `${item.title || ""} ${item.url || ""}`.toLowerCase();
    return title.includes(normalized);
  });

  if (hnBoost) score += 250;
  if (repo.homepage) score += 60;
  if ((repo.description || "").length > 30) score += 25;

  return score;
}

export async function getMonthlyAiTools(targetDateKey, rootDir, limit = 7) {
  const historyPath = path.join(rootDir, "src/data/monthly-tools-history.json");
  const history = await readHistory(historyPath);
  const featuredRecently = new Set(
    history.items
      .filter((item) => item.lastFeatured >= daysAgo(targetDateKey, 21))
      .map((item) => normalizeName(item.name))
  );

  const createdSince = daysAgo(targetDateKey, 45);
  const pushedSince = daysAgo(targetDateKey, 30);
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "ai-daily-intel-station/1.0"
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const queryTerms = ["agent", "automation", "ai-tool", "developer-tool", "multimodal"];
  const hnSignals = await fetchHnSignals();

  const resultSets = await Promise.all(
    queryTerms.map(async (topic) => {
      const url = new URL("https://api.github.com/search/repositories");
      url.searchParams.set(
        "q",
        `topic:${topic} created:>=${createdSince} pushed:>=${pushedSince} archived:false`
      );
      url.searchParams.set("sort", "stars");
      url.searchParams.set("order", "desc");
      url.searchParams.set("per_page", "10");
      return fetchJson(url.toString(), { headers });
    })
  ).catch(() => []);

  const uniqueRepos = new Map();
  for (const result of resultSets) {
    for (const repo of result.items || []) {
      uniqueRepos.set(repo.full_name, repo);
    }
  }

  const tools = [...uniqueRepos.values()]
    .filter((repo) => !repo.private)
    .filter((repo) => !EXCLUDED_TOOLS.has(normalizeName(repo.full_name || repo.name)))
    .filter((repo) => !featuredRecently.has(normalizeName(repo.full_name || repo.name)))
    .sort((a, b) => scoreRepo(b, hnSignals) - scoreRepo(a, hnSignals))
    .slice(0, limit)
    .map((repo) => ({
      name: repo.full_name.replace(/^.*\//, ""),
      officialUrl: repo.homepage || repo.html_url,
      capability: inferCapability(repo),
      useCase: inferUseCase(repo),
      learningLevel: inferLearningLevel(repo)
    }));

  const finalTools = tools.length >= 5 ? tools : FALLBACK_TOOLS.slice(0, limit);
  await writeHistory(historyPath, finalTools, targetDateKey);

  return finalTools;
}
