import { SITE_CONFIG } from "../config/site.mjs";

function hasCategory(item, category) {
  return Array.isArray(item.categories) && item.categories.includes(category);
}

function groupBySource(items = []) {
  const groups = new Map();
  for (const item of items) {
    const key = item.sourceName || item.sourceId || "unknown-source";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return groups;
}

function getSourceKey(item) {
  return item.sourceName || item.sourceId || "unknown-source";
}

function sortNewestFirst(items = []) {
  return [...items].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

function takeDiversified(pool, selectedSet, count, predicate = () => true, maxPerSource = Infinity, sourceUsage = new Map()) {
  if (count <= 0) return [];

  const groups = groupBySource(
    pool.filter((item) => !selectedSet.has(item) && predicate(item) && (sourceUsage.get(getSourceKey(item)) || 0) < maxPerSource)
  );
  for (const [key, items] of groups) {
    groups.set(key, sortNewestFirst(items));
  }

  const orderedSources = [...groups.entries()]
    .sort((a, b) => {
      const aDate = new Date(a[1][0]?.publishedAt || 0).getTime();
      const bDate = new Date(b[1][0]?.publishedAt || 0).getTime();
      return bDate - aDate;
    })
    .map(([key]) => key);

  const picked = [];

  while (picked.length < count) {
    let addedThisRound = false;

    for (const sourceKey of orderedSources) {
      const queue = groups.get(sourceKey) || [];
      while (queue.length && selectedSet.has(queue[0])) {
        queue.shift();
      }

      if (!queue.length) continue;

      const item = queue.shift();
      picked.push(item);
      addedThisRound = true;

      if (picked.length >= count) break;
    }

    if (!addedThisRound) break;
  }

  return sortNewestFirst(picked);
}

export function selectBalancedTopics(items = [], options = {}) {
  const targetCount = options.targetCount || 50;
  const minCountryArticles = options.minCountryArticles || SITE_CONFIG.minCountryArticlesPerSection || 20;
  const minCategoryArticles = options.minCategoryArticles || SITE_CONFIG.minCategoryArticles || 3;
  const categoryOrder = options.categoryOrder || [];
  const maxPerSource = options.maxPerSource || Infinity;

  const orderedItems = sortNewestFirst(items);
  const selected = [];
  const selectedSet = new Set();
  const sourceUsage = new Map();

  const addItems = (picked) => {
    for (const item of picked) {
      if (!selectedSet.has(item)) {
        selectedSet.add(item);
        const sourceKey = getSourceKey(item);
        sourceUsage.set(sourceKey, (sourceUsage.get(sourceKey) || 0) + 1);
        selected.push(item);
      }
    }
  };

  addItems(takeDiversified(orderedItems, selectedSet, minCountryArticles, (item) => item.country === "中國", maxPerSource, sourceUsage));
  addItems(takeDiversified(orderedItems, selectedSet, minCountryArticles, (item) => item.country === "其他國家", maxPerSource, sourceUsage));

  for (const category of categoryOrder) {
    const currentCount = selected.filter((item) => hasCategory(item, category)).length;
    const missing = Math.max(0, minCategoryArticles - currentCount);
    addItems(takeDiversified(orderedItems, selectedSet, missing, (item) => hasCategory(item, category), maxPerSource, sourceUsage));
  }

  addItems(takeDiversified(orderedItems, selectedSet, targetCount - selected.length, () => true, maxPerSource, sourceUsage));

  if (selected.length < targetCount) {
    addItems(takeDiversified(orderedItems, selectedSet, targetCount - selected.length, () => true, Infinity, sourceUsage));
  }

  return sortNewestFirst(selected).slice(0, targetCount);
}
