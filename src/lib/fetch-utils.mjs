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

function extractAuthorValue(block) {
  const patterns = [
    /<dc:creator[^>]*><!\[CDATA\[(.*?)\]\]><\/dc:creator>/is,
    /<dc:creator[^>]*>(.*?)<\/dc:creator>/is,
    /<author[^>]*><name[^>]*>(.*?)<\/name><\/author>/is,
    /<author[^>]*><!\[CDATA\[(.*?)\]\]><\/author>/is,
    /<author[^>]*>(.*?)<\/author>/is
  ];

  for (const pattern of patterns) {
    const match = block.match(pattern);
    if (match?.[1]) {
      return decodeHtml(stripHtml(match[1].trim()));
    }
  }

  return "";
}

function extractAtomLink(block) {
  const linkMatch = block.match(/<link\b[^>]*href="([^"]+)"[^>]*\/?>/i);
  return linkMatch?.[1] || "";
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
  const entryBlocks = itemBlocks.length ? [] : [...xmlText.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)].map((match) => match[0]);
  const blocks = itemBlocks.length ? itemBlocks : entryBlocks;

  return blocks.map((block) => ({
    title: extractTagValue(block, "title"),
    link: extractTagValue(block, "link") || extractAtomLink(block),
    publishedAt: extractTagValue(block, "pubDate") || extractTagValue(block, "dc:date") || extractTagValue(block, "published") || extractTagValue(block, "updated"),
    description: extractTagValue(block, "description") || extractTagValue(block, "summary") || extractTagValue(block, "content:encoded") || extractTagValue(block, "content"),
    imageUrl: extractImageUrl(block),
    author: extractAuthorValue(block)
  }));
}
