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
          ${section.cards.map((card) => renderTopicCard(card)).join("")}
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
        ${section.contentHtml}
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
