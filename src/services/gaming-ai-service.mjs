import { SOURCE_CONFIG } from "../config/sources.mjs";
import { SITE_CONFIG } from "../config/site.mjs";
import { parseRssItems, fetchText } from "../lib/fetch-utils.mjs";
import { isDateKeyWithinRange, toDateKey } from "../lib/date.mjs";
import {
  summarizeTitleInZh,
  buildGameRelation,
  pickAudienceTag,
  inferCategories,
  inferCountryFromSource
} from "../lib/content-utils.mjs";
import { selectBalancedTopics } from "../lib/topic-selection.mjs";
import { getWechatSources } from "./wechat-rss-service.mjs";

const RECENT_DAYS = 60;

function safeDateKey(dateLike) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "";
  return toDateKey(date);
}

function matchesKeywords(text = "", keywords = []) {
  return keywords.some((keyword) => {
    if (!keyword) return false;
    if (/^[a-z0-9]+$/i.test(keyword) && keyword.length <= 3) {
      return new RegExp(`\\b${keyword}\\b`, "i").test(text);
    }
    return text.toLowerCase().includes(keyword.toLowerCase());
  });
}

function isGameAiRelevant(text = "") {
  return /(\bai\b|artificial intelligence|generative|agentic|llm|model|npc|metahuman|automation|sentis|machine learning|模型|智能|生成式|AIGC)/i.test(
    text
  );
}

function hasExplicitAiSignal(item = {}) {
  return /(\bai\b|artificial intelligence|generative|agentic|llm|model|npc|metahuman|automation|sentis|machine learning|模型|智能|生成式|AIGC|素材|图像|圖片|影片|语音|語音)/i.test(
    `${item.title || ""} ${item.description || ""}`
  );
}

export async function getGameTopics(dateKey) {
  const sourceList = [...SOURCE_CONFIG.gamingAiNews, ...(await getWechatSources("gamingAiNews"))];
  const settled = await Promise.all(
    sourceList.map(async (source) => {
      try {
        const xml = await fetchText(source.url, {
          headers: {
            "user-agent": "ai-daily-intel-station/1.0"
          }
        });

        const items = parseRssItems(xml).map((item) => ({
          ...item,
          sourceId: source.id,
          sourceName: source.name,
          sourceType: source.sourceType || "media",
          country: inferCountryFromSource(source)
        }));

        return { sourceId: source.id, ok: true, items };
      } catch (error) {
        return { sourceId: source.id, ok: false, items: [], error: error.message };
      }
    })
  );

  const degradedSources = settled.filter((entry) => !entry.ok).map((entry) => entry.sourceId);

  const items = settled
    .flatMap((entry) => entry.items)
    .filter((item) => item.title && item.publishedAt)
    .filter((item) => {
      const source = sourceList.find((entry) => entry.id === item.sourceId) || sourceList.find((entry) => entry.name === item.sourceName);
      return matchesKeywords(`${item.title} ${item.description}`, source?.keywords || []);
    })
    .filter((item) => isGameAiRelevant(`${item.title} ${item.description}`))
    .filter((item) => hasExplicitAiSignal(item))
    .map((item) => ({
      ...item,
      publishedDateKey: safeDateKey(item.publishedAt)
    }))
    .filter((item) => item.publishedDateKey)
    .filter((item) => isDateKeyWithinRange(item.publishedDateKey, dateKey, RECENT_DAYS))
    .map((item) => ({
      title: item.title,
      summary: summarizeTitleInZh(item.title, item.sourceName),
      relation: buildGameRelation(item.title),
      audienceTag: pickAudienceTag(item.title, "遊戲企劃、工具與內容團隊"),
      sourceName: item.sourceName,
      sourceUrl: item.link || "#",
      sourceType: item.sourceType || "media",
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
    targetCount: SITE_CONFIG.maxGameTopics,
    minCountryArticles: SITE_CONFIG.minCountryArticlesPerSection,
    minCategoryArticles: SITE_CONFIG.minCategoryArticles,
    categoryOrder: ["新遊戲情報收集與分析", "影片/圖片素材製作", "TikTok Mini Game", "專案管理"],
    maxPerSource: 10
  });

  return {
    items: selectedItems,
    degradedSources
  };
}
