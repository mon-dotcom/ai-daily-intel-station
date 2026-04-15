export async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Failed to fetch JSON: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function fetchText(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Failed to fetch text: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

function extractTagValue(block, tagName) {
  const patterns = [
    new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[(.*?)\\]\\]><\\/${tagName}>`, "is"),
    new RegExp(`<${tagName}[^>]*>(.*?)<\\/${tagName}>`, "is")
  ];

  for (const pattern of patterns) {
    const match = block.match(pattern);
    if (match?.[1]) {
      return decodeHtml(stripHtml(match[1].trim()));
    }
  }

  return "";
}

function stripHtml(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHtml(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractImageUrl(block) {
  const patterns = [
    /<media:content[^>]*url="([^"]+)"/i,
    /<media:thumbnail[^>]*url="([^"]+)"/i,
    /<enclosure[^>]*url="([^"]+)"/i,
    /<img[^>]*src="([^"]+)"/i
  ];

  for (const pattern of patterns) {
    const match = block.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return "";
}

export function parseRssItems(xmlText) {
  const itemBlocks = [...xmlText.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map((match) => match[0]);

  return itemBlocks.map((block) => ({
    title: extractTagValue(block, "title"),
    link: extractTagValue(block, "link"),
    publishedAt: extractTagValue(block, "pubDate") || extractTagValue(block, "dc:date"),
    description: extractTagValue(block, "description") || extractTagValue(block, "content:encoded"),
    imageUrl: extractImageUrl(block)
  }));
}
