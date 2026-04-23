import { SITE_CONFIG } from "../src/config/site.mjs";
import { formatDateInTimeZone, getTaipeiTargetDate } from "../src/lib/date.mjs";

const PRODUCTION_URL = process.env.PRODUCTION_SITE_URL || "https://skill-deploy-gynq2anyfj.vercel.app";

function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getExpectedTaipeiDateLabel() {
  const targetDate = getTaipeiTargetDate();
  return formatDateInTimeZone(
    targetDate,
    SITE_CONFIG.locale,
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    },
    SITE_CONFIG.timezone
  ).replace(/\s/g, "");
}

function normalizeDateString(value = "") {
  return String(value).replace(/\s/g, "");
}

async function main() {
  const response = await fetch(PRODUCTION_URL, {
    headers: {
      "user-agent": "ai-daily-intel-monitor/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Production site responded with HTTP ${response.status}`);
  }

  const html = await response.text();
  const expectedDate = getExpectedTaipeiDateLabel();
  const updatePattern = new RegExp(`資料更新時間：(${escapeRegExp(expectedDate)}[^（<]*)`);
  const match = html.match(updatePattern);

  if (!match) {
    throw new Error(`Production page does not show today's update label (${expectedDate})`);
  }

  const lastModified = response.headers.get("last-modified") || "";

  console.log(
    JSON.stringify(
      {
        ok: true,
        productionUrl: PRODUCTION_URL,
        expectedDate,
        updateLabel: normalizeDateString(match[1]),
        lastModified
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
