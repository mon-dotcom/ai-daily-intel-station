import { escapeHtml } from "../lib/content-utils.mjs";
import { SITE_CONFIG } from "../config/site.mjs";

const FILTER_CATEGORY_ORDER = [
  "新遊戲情報收集與分析",
  "影片/圖片素材製作",
  "TikTok Mini Game",
  "專案管理"
];

const FILTER_COUNTRY_ORDER = ["中國", "其他國家"];

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

function normalizeDisplayText(text = "") {
  return String(text)
    .replace(/<[^>]+>/g, " ")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\u00a0/g, " ")
    .replace(/([A-Za-z])\s*'\s*s\b/g, "$1's")
    .replace(/\s*\[[A-Z]\]\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripGenericSummary(text = "") {
  return text
    .replace(/如果你昨天沒有時間追完整篇內容，至少要留意它涉及的產品方向、實際應用場景，以及它是否代表 AI 工具開始進一步進入真實工作流程。?/g, "")
    .replace(/\s+/g, " ")
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
  const plainText = stripGenericSummary(normalizeDisplayText(stripHtml(html)));
  const compact = truncateZhCopy(plainText, 200);
  const sentences = compact.match(/[^。！？!?]+[。！？!?]?/g) || [compact];
  const chunks = [];

  if (sentences[0]) chunks.push(sentences[0].trim());
  if (sentences[1]) chunks.push(sentences[1].trim());
  if (sentences.length > 2) chunks.push(sentences.slice(2).join("").trim());

  return chunks.filter(Boolean).map((chunk) => `<p>${escapeHtml(chunk)}</p>`).join("");
}

function shouldUseRemoteImage(url = "") {
  if (!url) return false;

  try {
    const host = new URL(url).hostname;
    if (["preview.redd.it", "external-preview.redd.it"].includes(host)) return false;
    return true;
  } catch {
    return false;
  }
}

function buildGeneratedThumb(sectionId, title = "", categories = []) {
  const palette =
    sectionId === "game-ai"
      ? {
          start: "#efe4dc",
          end: "#f7f3ef",
          accent: "#b84644",
          chip: "GAME × AI"
        }
      : {
          start: "#f2e6e4",
          end: "#fbf7f6",
          accent: "#b84644",
          chip: "AI NEWS"
        };

  const label = normalizeDisplayText(title).slice(0, 42) || "AI Daily Brief";
  const sublabel = (categories || []).slice(0, 2).join(" · ") || "Daily Intelligence";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.start}"/>
          <stop offset="100%" stop-color="${palette.end}"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#bg)"/>
      <rect x="60" y="56" width="170" height="44" rx="22" fill="rgba(184,70,68,0.08)" stroke="rgba(184,70,68,0.18)"/>
      <text x="145" y="84" text-anchor="middle" font-size="20" font-family="Noto Sans TC, Arial, sans-serif" fill="${palette.accent}" font-weight="700">${escapeHtml(
        palette.chip
      )}</text>
      <text x="60" y="232" font-size="58" font-family="Noto Sans TC, Arial, sans-serif" fill="#26282b" font-weight="800">${escapeHtml(
        label
      )}</text>
      <text x="60" y="302" font-size="28" font-family="Noto Sans TC, Arial, sans-serif" fill="#6a6e75">${escapeHtml(
        sublabel
      )}</text>
      <circle cx="1030" cy="140" r="88" fill="rgba(184,70,68,0.08)"/>
      <circle cx="1110" cy="220" r="34" fill="rgba(184,70,68,0.12)"/>
      <path d="M60 518 H1140" stroke="rgba(38,40,43,0.10)" stroke-width="2"/>
      <text x="60" y="578" font-size="24" font-family="Noto Sans TC, Arial, sans-serif" fill="${palette.accent}" font-weight="700">AI 每日情報站</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function filterGithubSectionHtml(html = "") {
  const tableMatch = html.match(/<table>[\s\S]*?<\/table>/);
  return tableMatch ? `<div class="table-wrap">${tableMatch[0]}</div>` : "";
}

function renderHeroUpdateCard(data) {
  if (!data.generatedLabel) return "";

  return `
    <aside class="hero-update-card" aria-label="資料更新時間">
      <strong>資料更新時間：${escapeHtml(data.generatedLabel)}（${escapeHtml(data.updatedTimezone || "台北時間")}）</strong>
    </aside>
  `;
}

function renderFilterBar(section) {
  if (!["ai-news", "game-ai"].includes(section.id)) return "";
  const categoryFilter =
    section.id === "game-ai"
      ? `
      <div class="filter-group">
        <span class="filter-label">領域</span>
        <div class="filter-options">
          <button type="button" class="filter-chip is-active" data-filter-group="categories" data-filter-value="all">全部</button>
          ${FILTER_CATEGORY_ORDER
            .map(
              (category) =>
                `<button type="button" class="filter-chip" data-filter-group="categories" data-filter-value="${escapeHtml(category)}">${escapeHtml(category)}</button>`
            )
            .join("")}
        </div>
      </div>
    `
      : "";

  return `
    <div class="section-filterbar" data-filter-section="${escapeHtml(section.id)}">
      ${categoryFilter}
      <div class="filter-group">
        <span class="filter-label">國家</span>
        <div class="filter-options">
          <button type="button" class="filter-chip is-active" data-filter-group="country" data-filter-value="all">全部</button>
          ${FILTER_COUNTRY_ORDER
            .map(
              (country) =>
                `<button type="button" class="filter-chip" data-filter-group="country" data-filter-value="${escapeHtml(country)}">${escapeHtml(country)}</button>`
            )
            .join("")}
        </div>
      </div>
      <div class="section-carousel-controls" data-carousel-controls="${escapeHtml(section.id)}">
        <span class="filter-label">全部文章</span>
        <div class="carousel-actions">
          <button type="button" class="carousel-button" data-carousel-prev="${escapeHtml(section.id)}" aria-label="查看上一組文章">‹</button>
          <span class="carousel-status" data-carousel-status="${escapeHtml(section.id)}">1 / 1</span>
          <button type="button" class="carousel-button" data-carousel-next="${escapeHtml(section.id)}" aria-label="查看下一組文章">›</button>
        </div>
      </div>
    </div>
  `;
}

function renderCardTags(card) {
  const tags = [];

  if (card.country) tags.push(card.country);
  for (const category of card.categories || []) {
    tags.push(category);
  }

  if (!tags.length) return "";

  return `
    <div class="topic-tags">
      ${tags.map((tag) => `<span class="meta-chip">${escapeHtml(tag)}</span>`).join("")}
    </div>
  `;
}

function renderTopicCard(card, sectionId) {
  const imageUrl = String(card.image || "").trim();
  const displayTitle = normalizeDisplayText(card.title);
  const fallbackThumb = buildGeneratedThumb(sectionId, displayTitle, card.categories || []);
  const safeImageUrl = shouldUseRemoteImage(imageUrl) ? imageUrl : "";
  const thumbnail = safeImageUrl
    ? `<div class="topic-thumb">
        <img
          src="${escapeHtml(safeImageUrl)}"
          alt="${escapeHtml(displayTitle)}"
          loading="lazy"
          decoding="async"
          referrerpolicy="no-referrer"
          onerror="this.onerror=null; this.src='${escapeHtml(fallbackThumb)}';"
        >
      </div>`
    : `<div class="topic-thumb"><img src="${escapeHtml(fallbackThumb)}" alt="${escapeHtml(displayTitle)}" loading="lazy" decoding="async"></div>`;
  const bodyHtml = renderCompactCardBody(card.bodyHtml);
  const categoryAttr = escapeHtml((card.categories || []).join("|"));

  return `
    <article class="topic-card" data-card data-country="${escapeHtml(card.country || "")}" data-categories="${categoryAttr}">
      ${thumbnail}
      <div class="topic-content">
        <div class="topic-meta-row">
          ${card.audience ? `<span class="pill">${escapeHtml(card.audience)}</span>` : "<span></span>"}
          ${card.time ? `<span class="topic-time">${escapeHtml(card.time)}</span>` : ""}
        </div>
        <h3>${escapeHtml(displayTitle)}</h3>
        <div class="markdown-body markdown-body--card">${bodyHtml}</div>
        ${renderCardTags(card)}
        ${
          card.callout && sectionId !== "ai-news"
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
        ${renderFilterBar(section)}
        <div class="topic-grid" data-filter-target="${escapeHtml(section.id)}" data-page-size="${SITE_CONFIG.topicCarouselPageSize}">
          ${section.cards.map((card) => renderTopicCard(card, section.id)).join("")}
        </div>
        <div class="filter-empty" data-filter-empty="${escapeHtml(section.id)}" hidden>目前沒有符合條件的文章，請調整篩選條件。</div>
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
  <script src="site.js" defer></script>
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
      ${renderHeroUpdateCard(data)}
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
