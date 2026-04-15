import { SOURCE_CONFIG } from "../config/sources.mjs";
import { parseRssItems, fetchJson, fetchText } from "../lib/fetch-utils.mjs";
import { isSameTaipeiDate } from "../lib/date.mjs";
import { summarizeTitleInZh, buildWhyItMatters, pickAudienceTag } from "../lib/content-utils.mjs";

function matchesKeywords(text = "", keywords = []) {
  if (!keywords.length) return true;
  const lower = text.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword.toLowerCase()));
}

function scoreItem(item) {
  const title = item.title || "";
  let score = 0;
  if (/(agent|workflow|assistant)/i.test(title)) score += 5;
  if (/(video|voice|audio|image|multimodal)/i.test(title)) score += 4;
  if (/(open-source|model|inference|api|deploy)/i.test(title)) score += 3;
  if (item.sourceName && /(OpenAI|Anthropic|Google|Hugging Face)/i.test(item.sourceName)) score += 2;
  if (item.imageUrl) score += 1;
  return score;
}

async function fetchFromRss(source) {
  const xml = await fetchText(source.url, {
    headers: {
      "user-agent": "ai-daily-intel-station/1.0"
    }
  });

  return parseRssItems(xml).map((item) => ({
    ...item,
    sourceName: source.name,
    sourceUrl: item.link || source.url
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
    sourceName: source.name,
    sourceUrl: item.url || `https://news.ycombinator.com/item?id=${item.objectID}`
  }));
}

export async function getAiTopics(dateKey) {
  const tasks = SOURCE_CONFIG.aiNews.map(async (source) => {
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
    .filter((item) => item.title && isSameTaipeiDate(item.publishedAt, dateKey))
    .filter((item) => {
      const source = SOURCE_CONFIG.aiNews.find((entry) => entry.name === item.sourceName);
      return matchesKeywords(`${item.title} ${item.description}`, source?.keywords || []);
    })
    .map((item) => ({
      title: item.title,
      summary: summarizeTitleInZh(item.title, item.sourceName),
      whyItMatters: buildWhyItMatters(item.title),
      audienceTag: pickAudienceTag(item.title),
      sourceName: item.sourceName,
      sourceUrl: item.link || item.sourceUrl,
      publishedAt: item.publishedAt,
      imageUrl: item.imageUrl
    }))
    .sort((a, b) => scoreItem(b) - scoreItem(a));

  return {
    items: items.slice(0, 3),
    degradedSources
  };
}
