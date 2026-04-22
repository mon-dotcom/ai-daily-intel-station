import { fetchJson } from "../lib/fetch-utils.mjs";

const DEFAULT_LIMIT = 60;

const SECTION_KEYWORDS = {
  aiNews: ["ai", "agent", "llm", "gpt", "模型", "智能", "大模型", "生成式", "工作流"],
  gamingAiNews: ["ai", "game", "npc", "遊戲", "游戏", "工具", "生成式", "素材", "工作流"]
};

function splitEnvList(raw = "") {
  return String(raw)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeOriginUrl(url = "") {
  return String(url).trim().replace(/\/+$/, "");
}

function parseNamedEntries(raw = "", fallbackName = "微信公眾號") {
  return splitEnvList(raw).map((entry, index) => {
    const [left, right] = entry.includes("|") ? entry.split("|") : ["", entry];
    const hasName = entry.includes("|");
    return {
      name: (hasName ? left : "").trim() || `${fallbackName} ${index + 1}`,
      value: (hasName ? right : left || right).trim()
    };
  });
}

function buildWechatSource({ id, name, url, section }) {
  return {
    id,
    name,
    type: "rss",
    sourceType: "wechat",
    country: "中國",
    url,
    keywords: SECTION_KEYWORDS[section] || SECTION_KEYWORDS.aiNews
  };
}

function appendFeedParams(url) {
  const feedUrl = new URL(url);
  const limit = Number.parseInt(process.env.WECHAT_RSS_LIMIT || "", 10);

  if (!feedUrl.searchParams.has("limit")) {
    feedUrl.searchParams.set("limit", String(Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_LIMIT));
  }

  return feedUrl.toString();
}

function getExplicitWechatFeeds(section) {
  return parseNamedEntries(process.env.WECHAT_RSS_FEEDS || "").map((entry, index) =>
    buildWechatSource({
      id: `wechat-explicit-${section}-${index + 1}`,
      name: entry.name,
      url: appendFeedParams(entry.value),
      section
    })
  );
}

function getFeedIdWechatFeeds(section) {
  const origin = normalizeOriginUrl(process.env.WECHAT_RSS_ORIGIN_URL || "");
  if (!origin) return [];

  return parseNamedEntries(process.env.WECHAT_RSS_FEED_IDS || "", "微信公眾號").map((entry, index) =>
    buildWechatSource({
      id: `wechat-feedid-${section}-${index + 1}`,
      name: entry.name,
      url: appendFeedParams(`${origin}/feeds/${entry.value}.rss`),
      section
    })
  );
}

function matchesFeedName(name = "", includeTerms = [], excludeTerms = []) {
  const normalized = String(name).toLowerCase();
  if (!normalized) return false;

  if (includeTerms.length && !includeTerms.some((term) => normalized.includes(term))) {
    return false;
  }

  if (excludeTerms.some((term) => normalized.includes(term))) {
    return false;
  }

  return true;
}

async function discoverWechatFeeds(section) {
  const origin = normalizeOriginUrl(process.env.WECHAT_RSS_ORIGIN_URL || "");
  if (!origin) return [];

  const includeTerms = splitEnvList(process.env.WECHAT_RSS_DISCOVERY_INCLUDE || "").map((term) => term.toLowerCase());
  const excludeTerms = splitEnvList(process.env.WECHAT_RSS_DISCOVERY_EXCLUDE || "").map((term) => term.toLowerCase());
  const feedList = await fetchJson(`${origin}/feeds/`, {
    headers: {
      "user-agent": "ai-daily-intel-station/1.0"
    }
  });

  return (Array.isArray(feedList) ? feedList : [])
    .filter((feed) => feed?.id)
    .filter((feed) => matchesFeedName(feed.name || feed.mpName || "", includeTerms, excludeTerms))
    .map((feed, index) =>
      buildWechatSource({
        id: `wechat-discovered-${section}-${index + 1}`,
        name: feed.name || feed.mpName || `微信公眾號 ${index + 1}`,
        url: appendFeedParams(`${origin}/feeds/${feed.id}.rss`),
        section
      })
    );
}

export async function getWechatSources(section) {
  const explicitFeeds = getExplicitWechatFeeds(section);
  if (explicitFeeds.length) return explicitFeeds;

  const feedIdFeeds = getFeedIdWechatFeeds(section);
  if (feedIdFeeds.length) return feedIdFeeds;

  return discoverWechatFeeds(section);
}
