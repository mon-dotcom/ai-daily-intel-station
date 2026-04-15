import fs from "node:fs/promises";
import path from "node:path";

import { SOURCE_CONFIG } from "../config/sources.mjs";
import { SITE_CONFIG } from "../config/site.mjs";
import { inferProjectType, inferUseCase, inferBeginnerFriendly } from "../lib/content-utils.mjs";
import { fetchJson } from "../lib/fetch-utils.mjs";

function buildGithubBaseQuery(targetDateKey) {
  const sevenDaysAgo = new Date(`${targetDateKey}T00:00:00Z`);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
  const fromDate = sevenDaysAgo.toISOString().slice(0, 10);
  return `pushed:>=${fromDate} archived:false`;
}

function normalizeRepo(repo, previousMap = new Map()) {
  const projectType = inferProjectType(repo);
  const previousStars = previousMap.get(repo.full_name);
  const deltaValue = typeof previousStars === "number" ? repo.stargazers_count - previousStars : 0;
  const delta = deltaValue > 0 ? "up" : deltaValue < 0 ? "down" : "flat";
  const deltaLabel = delta === "up" ? "上升" : delta === "down" ? "下降" : "持平";

  return {
    name: repo.full_name,
    url: repo.html_url,
    stars: repo.stargazers_count,
    delta,
    deltaLabel,
    deltaValue,
    projectType,
    oneLiner: repo.description || "這個專案目前缺少描述，建議直接進 GitHub 查看 README。",
    useCase: inferUseCase(projectType),
    beginnerFriendly: inferBeginnerFriendly(projectType),
    notes: delta === "up" ? "近一天觀測到熱度持續增加。" : "熱度變化不大，適合觀察是否為長期趨勢。"
  };
}

function buildInsights(projects) {
  const types = projects.reduce((acc, project) => {
    acc[project.projectType] = (acc[project.projectType] || 0) + 1;
    return acc;
  }, {});

  const topType = Object.entries(types).sort((a, b) => b[1] - a[1])[0]?.[0] || "AI Tooling";
  const risingProjects = projects.filter((project) => project.delta === "up").slice(0, 3).map((project) => project.name);
  const beginnerProjects = projects.filter((project) => project.beginnerFriendly === "高").slice(0, 3).map((project) => project.name);

  return [
    `昨天觀測到的開源主流方向以「${topType}」最集中，代表團隊對可落地工具的需求仍高於純展示型專案。`,
    risingProjects.length
      ? `近期升溫最快的專案包括 ${risingProjects.join("、")}，建議先判斷它們是長期工具還是短期話題。`
      : "昨天熱門專案的熱度變化相對平均，暫時沒有單一專案明顯爆量。",
    beginnerProjects.length
      ? `若要安排團隊試用，優先考慮 ${beginnerProjects.join("、")} 這類上手門檻較低的專案。`
      : "目前榜單偏技術導向，若要導入給非技術同仁，建議先補操作說明與試用流程。"
  ];
}

async function readPreviousSnapshot(snapshotPath) {
  try {
    const raw = await fs.readFile(snapshotPath, "utf8");
    return JSON.parse(raw);
  } catch {
    return { date: "", items: [] };
  }
}

async function writeSnapshot(snapshotPath, targetDateKey, projects) {
  const payload = {
    date: targetDateKey,
    items: projects.map((project) => ({
      name: project.name,
      stars: project.stars
    }))
  };

  await fs.writeFile(snapshotPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

export async function getGithubProjects(targetDateKey, rootDir) {
  const snapshotPath = path.join(rootDir, SITE_CONFIG.githubSnapshotPath);
  const previousSnapshot = await readPreviousSnapshot(snapshotPath);
  const previousMap = new Map(previousSnapshot.items.map((item) => [item.name, item.stars]));
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "ai-daily-intel-station/1.0"
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const baseQuery = buildGithubBaseQuery(targetDateKey);
  const resultSets = await Promise.all(
    SOURCE_CONFIG.github.topics.map(async (topic) => {
      const url = new URL(SOURCE_CONFIG.github.endpoint);
      url.searchParams.set("q", `topic:${topic} ${baseQuery}`);
      url.searchParams.set("sort", "stars");
      url.searchParams.set("order", "desc");
      url.searchParams.set("per_page", "10");
      return fetchJson(url.toString(), { headers });
    })
  );

  const uniqueRepos = new Map();
  for (const result of resultSets) {
    for (const repo of result.items || []) {
      uniqueRepos.set(repo.full_name, repo);
    }
  }

  const projects = [...uniqueRepos.values()]
    .filter((repo) => !repo.private && repo.stargazers_count > 500)
    .map((repo) => normalizeRepo(repo, previousMap))
    .sort((a, b) => (b.deltaValue * 20 + b.stars) - (a.deltaValue * 20 + a.stars))
    .slice(0, SITE_CONFIG.maxGithubProjects)
    .map((project, index) => ({
      rank: index + 1,
      ...project
    }));

  await writeSnapshot(snapshotPath, targetDateKey, projects);

  return {
    items: projects,
    insights: buildInsights(projects)
  };
}
