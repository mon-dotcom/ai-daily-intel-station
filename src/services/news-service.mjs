import { SOURCE_CONFIG } from "../config/sources.mjs";
import { SITE_CONFIG } from "../config/site.mjs";
import { parseRssItems, fetchJson, fetchText } from "../lib/fetch-utils.mjs";
import { isDateKeyWithinRange, toDateKey } from "../lib/date.mjs";
import {
  summarizeTitleInZh,
  buildWhyItMatters,
  pickAudienceTag,
  extractAiToolName,
  inferCategories,
  inferCountryFromSource,
  isGameIndustryRelated,
  isWechatAiGeneralSource,
  isWechatGameFocusedSource
} from "../lib/content-utils.mjs";
import { selectBalancedTopics } from "../lib/topic-selection.mjs";
import { getWechatSources } from "./wechat-rss-service.mjs";

const RECENT_DAYS = 45;

function safeDateKey(dateLike) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "";
  return toDateKey(date);
}

function matchesKeywords(text = "", keywords = []) {
  if (!keywords.length) return true;
  return keywords.some((keyword) => {
    if (!keyword) return false;
    if (/^[a-z0-9]+$/i.test(keyword) && keyword.length <= 3) {
      return new RegExp(`\\b${keyword}\\b`, "i").test(text);
    }
    return text.toLowerCase().includes(keyword.toLowerCase());
  });
}

async function fetchFromRss(source) {
  const xml = await fetchText(source.url, {
    headers: {
      "user-agent": "ai-daily-intel-station/1.0"
    }
  });

  return parseRssItems(xml).map((item) => ({
    ...item,
    sourceId: source.id,
    sourceName: source.name,
    sourceUrl: item.link || source.url,
    sourceType: source.sourceType || "rss",
    country: inferCountryFromSource(source)
  }));
}

async function fetchFromHn(source) {
  const result = await fetchJson(source.url, {
    headers: {
      "user-agent": "ai-daily-intel-station/1.0"
    }
  });

  return (result.hits || []).map((item) => ({
    title: item.title,
    link: item.url || `https://news.ycombinator.com/item?id=${item.objectID}`,
    publishedAt: item.created_at,
    description: item.story_text || item.comment_text || "",
    imageUrl: "",
    sourceId: source.id,
    sourceName: source.name,
    sourceUrl: item.url || `https://news.ycombinator.com/item?id=${item.objectID}`,
    sourceType: source.sourceType || "community",
    country: inferCountryFromSource(source)
  }));
}

function shouldKeepAiItem(item, source) {
  const text = `${item.title || ""} ${item.description || ""}`;

  if (!source) return matchesKeywords(text, []);

  if (source.sourceType === "wechat") {
    if (isWechatGameFocusedSource(source.name)) {
      return false;
    }

    if (isWechatAiGeneralSource(source.name)) {
      return true;
    }
  }

  return matchesKeywords(text, source.keywords || []);
}

export async function getAiTopics(dateKey) {
  const sourceList = [...SOURCE_CONFIG.aiNews, ...(await getWechatSources("aiNews"))];
  const tasks = sourceList.map(async (source) => {
    try {
      const items = source.type === "rss" ? await fetchFromRss(source) : await fetchFromHn(source);
      return { sourceId: source.id, ok: true, items };
    } catch (error) {
      return { sourceId: source.id, ok: false, items: [], error: error.message };
    }
  });

  const settled = await Promise.all(tasks);
  const degradedSources = settled.filter((entry) => !entry.ok).map((entry) => entry.sourceId);

  const items = settled
    .flatMap((entry) => entry.items)
    .filter((item) => item.title && item.publishedAt)
    .filter((item) => {
      const source = sourceList.find((entry) => entry.id === item.sourceId) || sourceList.find((entry) => entry.name === item.sourceName);
      return shouldKeepAiItem(item, source);
    })
    .map((item) => ({
      ...item,
      publishedDateKey: safeDateKey(item.publishedAt)
    }))
    .filter((item) => item.publishedDateKey)
    .filter((item) => isDateKeyWithinRange(item.publishedDateKey, dateKey, RECENT_DAYS))
    .filter((item) => !isGameIndustryRelated(item))
    .map((item) => ({
      title: item.title,
      summary: summarizeTitleInZh(item.title, item.sourceName),
      whyItMatters: buildWhyItMatters(item.title),
      audienceTag: extractAiToolName(item.title),
      sourceName: item.sourceName,
      sourceUrl: item.link || item.sourceUrl,
      sourceType: item.sourceType || "official",
      country: item.country || "其他國家",
      categories: inferCategories(item),
      publishedDateKey: item.publishedDateKey,
      publishedAt: item.publishedAt,
      fetchedAt: new Date().toISOString(),
      imageUrl: item.imageUrl
    }))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const uniqueItems = items.filter((item, index, list) => list.findIndex((entry) => entry.title === item.title) === index);
  const selectedItems = selectBalancedTopics(uniqueItems, {
    targetCount: SITE_CONFIG.maxHeroTopics,
    minCountryArticles: SITE_CONFIG.minCountryArticlesPerSection,
    minCategoryArticles: SITE_CONFIG.minCategoryArticles,
    categoryOrder: ["新遊戲情報收集與分析", "影片/圖片素材製作", "TikTok Mini Game", "專案管理"],
    maxPerSource: 6
  });

  return {
    items: selectedItems,
    degradedSources
  };
}
