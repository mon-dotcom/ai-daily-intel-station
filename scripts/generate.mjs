import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SITE_CONFIG } from "../src/config/site.mjs";
import { CONTENT_FILES } from "../src/config/content.mjs";
import { formatDateInTimeZone, formatTargetDateLabel, getTaipeiTargetDate } from "../src/lib/date.mjs";
import { parseContentFile, parseSiteFile } from "../src/lib/markdown-content.mjs";
import { renderPage } from "../src/templates/page-template.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

async function readText(relativePath) {
  return fs.readFile(path.join(rootDir, relativePath), "utf8");
}

async function loadSections() {
  const sections = [];

  for (const file of CONTENT_FILES) {
    const raw = await readText(file.path);
    sections.push(parseContentFile(raw, file));
  }

  return sections;
}

async function loadPageData() {
  const siteRaw = await readText("content/site.md");
  const site = parseSiteFile(siteRaw);
  const targetDate = getTaipeiTargetDate();
  const generatedAt = new Date();

  return {
    siteName: site.siteName || SITE_CONFIG.siteName,
    siteTagline: site.siteTagline || SITE_CONFIG.siteTagline,
    heroEyebrow: site.heroEyebrow || "TEAM KNOWLEDGE BOARD",
    heroPanelTitle: site.heroPanelTitle || "今日觀測焦點",
    heroHighlights: site.heroHighlights || [],
    footerTitle: site.footerTitle || "今日 AI 小提醒",
    reminder: site.reminder || SITE_CONFIG.fallbackReminder,
    generatedLabel: formatDateInTimeZone(
      generatedAt,
      SITE_CONFIG.locale,
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      },
      SITE_CONFIG.timezone
    ),
    targetDateLabel: formatTargetDateLabel(targetDate, SITE_CONFIG.locale, SITE_CONFIG.timezone),
    status: {
      title: "內容來源",
      message: "本頁由多個 Markdown 檔案重新生成。內容更新後，重新整理即可看到最新結果。",
      detail: "若要改站內內容，只需編輯 content/ 底下對應的 .md 檔。"
    },
    sections: await loadSections()
  };
}

async function main() {
  const pageData = await loadPageData();
  const html = renderPage(pageData);
  await fs.writeFile(path.join(rootDir, SITE_CONFIG.outputPath), html, "utf8");
  console.log(`Generated ${SITE_CONFIG.outputPath} from Markdown content`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
