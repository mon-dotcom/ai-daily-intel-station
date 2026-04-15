import { escapeHtml } from "../lib/content-utils.mjs";

function renderHeroLogo() {
  return `
    <div class="hero-logo">
      <img src="assets/garena-logo.png" alt="Garena logo">
    </div>
  `;
}

function renderHeroCopyright() {
  return `<div class="hero-copyright">copyright: Nina Mo</div>`;
}

function renderFooterCopyright() {
  return `<div class="footer-copyright">copyright: Nina Mo</div>`;
}

function sanitizeText(text = "") {
  const bannedPhrases = [
    "優先整理對工作者有幫助、能快速判斷影響面的消息，而不是只搬運標題。"
  ];

  let sanitized = text.trim();
  for (const phrase of bannedPhrases) {
    sanitized = sanitized.replaceAll(phrase, "").trim();
  }
  return sanitized;
}

function stripHtml(html = "") {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function truncateZhCopy(text = "", limit = 200) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= limit) return normalized;

  const sentenceMatches = normalized.match(/[^。！？!?]+[。！？!?]?/g) || [normalized];
  const picked = [];
  let count = 0;

  for (const sentence of sentenceMatches) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    if (count + trimmed.length > limit) break;
    picked.push(trimmed);
    count += trimmed.length;
    if (picked.length >= 3) break;
  }

  if (picked.length) return picked.join("");

  const sliced = normalized.slice(0, limit);
  const breakIndex = Math.max(sliced.lastIndexOf("。"), sliced.lastIndexOf("，"), sliced.lastIndexOf("、"));
  return `${(breakIndex > 40 ? sliced.slice(0, breakIndex + 1) : sliced).trim()}…`;
}

function renderCompactCardBody(html = "") {
  const plainText = stripHtml(html);
  const compact = truncateZhCopy(plainText, 200);
  const sentences = compact.match(/[^。！？!?]+[。！？!?]?/g) || [compact];
  const chunks = [];

  if (sentences[0]) chunks.push(sentences[0].trim());
  if (sentences[1]) chunks.push(sentences[1].trim());
  if (sentences.length > 2) chunks.push(sentences.slice(2).join("").trim());

  return chunks.filter(Boolean).map((chunk) => `<p>${escapeHtml(chunk)}</p>`).join("");
}

function filterGithubSectionHtml(html = "") {
  const tableMatch = html.match(/<table>[\s\S]*?<\/table>/);
  return tableMatch ? `<div class="table-wrap">${tableMatch[0]}</div>` : "";
}

function renderTopicCard(card) {
  const thumbnail = card.image
    ? `<div class="topic-thumb"><img src="${escapeHtml(card.image)}" alt="${escapeHtml(card.title)}"></div>`
    : `<div class="topic-thumb topic-thumb--placeholder"><span>AI</span></div>`;

  return `
    <article class="topic-card">
      ${thumbnail}
      <div class="topic-content">
        <div class="topic-meta-row">
          ${card.audience ? `<span class="pill">${escapeHtml(card.audience)}</span>` : "<span></span>"}
          ${card.time ? `<span class="topic-time">${escapeHtml(card.time)}</span>` : ""}
        </div>
        <h3>${escapeHtml(card.title)}</h3>
        <div class="markdown-body markdown-body--card">${card.bodyHtml}</div>
        ${
          card.callout
            ? `<div class="topic-callout">
                <strong>${escapeHtml(card.calloutTitle || "補充重點")}</strong>
                <span>${escapeHtml(card.callout)}</span>
              </div>`
            : ""
        }
        ${
          card.sourceName || card.sourceUrl
            ? `<div class="topic-source">
                <span>${card.sourceName ? `來源：${escapeHtml(card.sourceName)}` : ""}</span>
                ${
                  card.sourceUrl
                    ? `<a class="text-link" href="${escapeHtml(card.sourceUrl)}" target="_blank" rel="noreferrer noopener">查看原文</a>`
                    : ""
                }
              </div>`
            : ""
        }
      </div>
    </article>
  `;
}

function renderModuleCard(card) {
  return `
    <article class="module-card">
      ${card.kicker ? `<span class="module-kicker">${escapeHtml(card.kicker)}</span>` : ""}
      <h3>${escapeHtml(card.title)}</h3>
      <div class="markdown-body markdown-body--card">${card.bodyHtml}</div>
      ${card.footer ? `<footer>${escapeHtml(card.footer)}</footer>` : ""}
    </article>
  `;
}

function renderSection(section) {
  const summary = sanitizeText(section.summary || "");
  const sectionCards =
    section.id === "ai-news"
      ? section.cards.map((card) => ({
          ...card,
          bodyHtml: renderCompactCardBody(card.bodyHtml)
        }))
      : section.cards;
  const heading = `
    <div class="section-heading">
      <div>
        ${section.label ? `<span class="section-kicker">${escapeHtml(section.label)}</span>` : ""}
        <h2>${escapeHtml(section.title)}</h2>
      </div>
      ${summary ? `<p>${escapeHtml(summary)}</p>` : ""}
    </div>
  `;

  if (section.layout === "topic-grid") {
    return `
      <section class="section section--${escapeHtml(section.id)}" id="${escapeHtml(section.id)}">
        ${heading}
        <div class="topic-grid">
          ${sectionCards.map((card) => renderTopicCard(card)).join("")}
        </div>
      </section>
    `;
  }

  if (section.layout === "module-grid") {
    return `
      <section class="section section--${escapeHtml(section.id)}" id="${escapeHtml(section.id)}">
        ${heading}
        <div class="module-grid">
          ${section.cards.map((card) => renderModuleCard(card)).join("")}
        </div>
      </section>
    `;
  }

  return `
    <section class="section section--markdown section--${escapeHtml(section.id)}" id="${escapeHtml(section.id)}">
      ${heading}
      <div class="markdown-body">
        ${section.id === "github-trending" ? filterGithubSectionHtml(section.contentHtml) : section.contentHtml}
      </div>
    </section>
  `;
}

export function renderPage(data) {
  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="AI 每日情報站：用 Markdown 維護內容，自動轉成靜態 HTML。">
  <title>${escapeHtml(data.siteName)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="site-shell">
    <header class="hero">
      ${renderHeroLogo()}
      ${renderHeroCopyright()}
      <div class="hero-copy">
          <h1>${escapeHtml(data.siteName)}</h1>
          <p>${escapeHtml(data.siteTagline)}</p>
      </div>
    </header>

    <main class="content">
      ${data.sections.map((section) => renderSection(section)).join("")}
    </main>

    <footer class="footer">
      ${renderFooterCopyright()}
      <div class="footer-card">
        <span class="section-kicker">${escapeHtml(data.footerTitle)}</span>
        <p>${escapeHtml(data.reminder)}</p>
      </div>
      <div class="footer-meta">
        <span>內容來源：Markdown 檔案</span>
        <span>輸出方式：Node.js 重新生成靜態 HTML</span>
      </div>
    </footer>
  </div>
</body>
</html>`;
}
