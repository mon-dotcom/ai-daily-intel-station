import { escapeHtml } from "./content-utils.mjs";

function parseFrontmatter(raw) {
  if (!raw.startsWith("---\n")) {
    return { meta: {}, body: raw.trim() };
  }

  const endIndex = raw.indexOf("\n---\n", 4);
  if (endIndex === -1) {
    return { meta: {}, body: raw.trim() };
  }

  const frontmatter = raw.slice(4, endIndex);
  const body = raw.slice(endIndex + 5).trim();
  return {
    meta: parseKeyValueLines(frontmatter),
    body
  };
}

function parseKeyValueLines(text) {
  const result = {};
  const lines = text.split("\n");
  let activeKey = null;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) continue;

    const listMatch = line.match(/^\s*-\s+(.*)$/);
    if (listMatch && activeKey) {
      if (!Array.isArray(result[activeKey])) result[activeKey] = [];
      result[activeKey].push(listMatch[1].trim());
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;

    const [, key, value] = match;
    activeKey = key;
    result[key] = value ? value.trim() : [];
  }

  return result;
}

function parseInline(text = "") {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g, (_match, label, url) => {
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer noopener">${label}</a>`;
    });
}

function parseList(lines, ordered = false, className = "") {
  const items = lines.map((line) => {
    const cleaned = ordered ? line.replace(/^\d+\.\s+/, "") : line.replace(/^[-*]\s+/, "");
    return `<li>${parseInline(cleaned)}</li>`;
  });
  const tag = ordered ? "ol" : "ul";
  const classAttr = className ? ` class="${className}"` : "";
  return `<${tag}${classAttr}>${items.join("")}</${tag}>`;
}

function parseTable(lines, startIndex) {
  const rowLines = [];
  let index = startIndex;

  while (index < lines.length && lines[index].includes("|")) {
    rowLines.push(lines[index]);
    index += 1;
  }

  const splitRow = (line) =>
    line
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell.length);

  const header = splitRow(rowLines[0]);
  const rows = rowLines.slice(2).map(splitRow);

  const tableHtml = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>${header.map((cell) => `<th>${parseInline(cell)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows
            .map((row) => `<tr>${row.map((cell) => `<td>${parseInline(cell)}</td>`).join("")}</tr>`)
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  return { html: tableHtml, nextIndex: index };
}

function parseFigure(line) {
  const match = line.match(/^!\[(.*?)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)$/);
  if (!match) return "";
  const [, alt, src, caption] = match;
  return `
    <figure class="markdown-figure">
      <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">
      ${caption ? `<figcaption>${parseInline(caption)}</figcaption>` : ""}
    </figure>
  `;
}

export function renderMarkdown(markdown = "") {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trimEnd();
    const trimmed = line.trim();

    if (!trimmed) continue;

    if (trimmed === "::: steps") {
      const stepLines = [];
      index += 1;
      while (index < lines.length && lines[index].trim() !== ":::") {
        if (lines[index].trim()) stepLines.push(lines[index].trim());
        index += 1;
      }
      html.push(parseList(stepLines, true, "steps-list"));
      continue;
    }

    const figureHtml = parseFigure(trimmed);
    if (figureHtml) {
      html.push(figureHtml);
      continue;
    }

    if (/^#{1,3}\s/.test(trimmed)) {
      const level = trimmed.match(/^#+/)[0].length;
      const text = trimmed.replace(/^#{1,3}\s+/, "");
      html.push(`<h${level}>${parseInline(text)}</h${level}>`);
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quoteLines = [trimmed.replace(/^>\s?/, "")];
      while (index + 1 < lines.length && /^>\s?/.test(lines[index + 1].trim())) {
        index += 1;
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
      }
      html.push(`<blockquote>${quoteLines.map((item) => `<p>${parseInline(item)}</p>`).join("")}</blockquote>`);
      continue;
    }

    const orderedStart = /^\d+\.\s+/.test(trimmed);
    const unorderedStart = /^[-*]\s+/.test(trimmed);
    if (orderedStart || unorderedStart) {
      const listLines = [trimmed];
      while (index + 1 < lines.length) {
        const next = lines[index + 1].trim();
        if (!next) break;
        if (orderedStart && /^\d+\.\s+/.test(next)) {
          listLines.push(next);
          index += 1;
          continue;
        }
        if (unorderedStart && /^[-*]\s+/.test(next)) {
          listLines.push(next);
          index += 1;
          continue;
        }
        break;
      }
      html.push(parseList(listLines, orderedStart));
      continue;
    }

    if (trimmed.includes("|") && index + 1 < lines.length && /^[\s|:-]+$/.test(lines[index + 1].trim())) {
      const table = parseTable(lines, index);
      html.push(table.html);
      index = table.nextIndex - 1;
      continue;
    }

    const paragraphLines = [trimmed];
    while (index + 1 < lines.length) {
      const next = lines[index + 1].trim();
      if (
        !next ||
        /^#{1,3}\s/.test(next) ||
        /^>\s?/.test(next) ||
        /^\d+\.\s+/.test(next) ||
        /^[-*]\s+/.test(next) ||
        next === "::: steps" ||
        /^!\[/.test(next) ||
        (next.includes("|") && index + 2 < lines.length && /^[\s|:-]+$/.test(lines[index + 2].trim()))
      ) {
        break;
      }
      paragraphLines.push(next);
      index += 1;
    }
    html.push(`<p>${parseInline(paragraphLines.join(" "))}</p>`);
  }

  return html.join("\n");
}

function parseCardBlock(rawBlock, defaultStyle) {
  const cleaned = rawBlock.replace(/^::: card\s*\n/, "").replace(/\n:::\s*$/, "").trim();
  const divider = cleaned.indexOf("\n---\n");
  const rawMeta = divider === -1 ? cleaned : cleaned.slice(0, divider);
  const rawBody = divider === -1 ? "" : cleaned.slice(divider + 5).trim();
  const meta = parseKeyValueLines(rawMeta);

  return {
    style: meta.style || defaultStyle,
    title: meta.title || "",
    kicker: meta.kicker || "",
    audience: meta.audience || "",
    time: meta.time || "",
    sourceName: meta.sourceName || "",
    sourceUrl: meta.sourceUrl || "",
    image: meta.image || "",
    calloutTitle: meta.calloutTitle || "",
    callout: meta.callout || "",
    footer: meta.footer || "",
    bodyHtml: renderMarkdown(rawBody)
  };
}

function parseCardBlocks(body, style) {
  const matches = [...body.matchAll(/::: card\s*\n[\s\S]*?\n:::/g)];
  return matches.map((match) => parseCardBlock(match[0], style));
}

export function parseContentFile(raw, fileConfig = {}) {
  const { meta, body } = parseFrontmatter(raw);
  const layout = meta.layout || fileConfig.layout || "markdown";

  return {
    id: fileConfig.id || meta.id || "",
    label: meta.label || "",
    title: meta.title || "",
    summary: meta.summary || "",
    layout,
    contentHtml: layout === "markdown" ? renderMarkdown(body) : "",
    cards: layout === "topic-grid" || layout === "module-grid" ? parseCardBlocks(body, layout === "module-grid" ? "module" : "topic") : []
  };
}

export function parseSiteFile(raw) {
  const { meta } = parseFrontmatter(raw);
  return {
    siteName: meta.siteName,
    siteTagline: meta.siteTagline,
    heroEyebrow: meta.heroEyebrow,
    heroPanelTitle: meta.heroPanelTitle,
    heroHighlights: Array.isArray(meta.heroHighlights) ? meta.heroHighlights : [],
    footerTitle: meta.footerTitle,
    reminder: meta.reminder
  };
}
