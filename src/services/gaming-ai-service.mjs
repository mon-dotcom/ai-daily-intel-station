import { SOURCE_CONFIG } from "../config/sources.mjs";
import { parseRssItems, fetchText } from "../lib/fetch-utils.mjs";
import { isSameTaipeiDate } from "../lib/date.mjs";
import { summarizeTitleInZh, buildGameRelation, pickAudienceTag } from "../lib/content-utils.mjs";

function matchesKeywords(text = "", keywords = []) {
  const lower = text.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword.toLowerCase()));
}

function scoreItem(item) {
  const title = item.title || "";
  let score = 0;
  if (/(npc|dialogue|character)/i.test(title)) score += 4;
  if (/(tool|workflow|pipeline|engine)/i.test(title)) score += 4;
  if (/(art|audio|video|animation)/i.test(title)) score += 3;
  if (item.imageUrl) score += 1;
  return score;
}

export async function getGameTopics(dateKey) {
  const settled = await Promise.all(
    SOURCE_CONFIG.gamingAiNews.map(async (source) => {
      try {
        const xml = await fetchText(source.url, {
          headers: {
            "user-agent": "ai-daily-intel-station/1.0"
          }
        });

        const items = parseRssItems(xml).map((item) => ({
          ...item,
          sourceName: source.name
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
    .filter((item) => item.title && isSameTaipeiDate(item.publishedAt, dateKey))
    .filter((item) => {
      const source = SOURCE_CONFIG.gamingAiNews.find((entry) => entry.name === item.sourceName);
      return matchesKeywords(`${item.title} ${item.description}`, source?.keywords || []);
    })
    .map((item) => ({
      title: item.title,
      summary: summarizeTitleInZh(item.title, item.sourceName),
      relation: buildGameRelation(item.title),
      audienceTag: pickAudienceTag(item.title, "遊戲企劃、工具與內容團隊"),
      sourceName: item.sourceName,
      sourceUrl: item.link || "#",
      publishedAt: item.publishedAt,
      imageUrl: item.imageUrl
    }))
    .sort((a, b) => scoreItem(b) - scoreItem(a));

  return {
    items: items.slice(0, 3),
    degradedSources
  };
}
