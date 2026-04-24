import fs from "node:fs/promises";
import path from "node:path";
import { execFile as execFileCallback } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const logDir = path.join(rootDir, "logs");
const statusPath = path.join(logDir, "china-coverage-status.json");

const SECTION_CONFIG = {
  ai: {
    file: "content/ai-news.md",
    label: "全球 AI 關鍵動態"
  },
  game: {
    file: "content/game-ai.md",
    label: "遊戲產業 × AI 重要進展"
  }
};

async function readFileSafe(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

async function readGitFileSafe(filePath) {
  try {
    const { stdout } = await execFile("git", ["show", `HEAD:${filePath}`], {
      cwd: rootDir,
      maxBuffer: 5 * 1024 * 1024
    });
    return stdout || "";
  } catch {
    return "";
  }
}

function countCountry(text, country) {
  return [...text.matchAll(/^country: (.*)$/gm)].map((match) => match[1]).filter((value) => value === country).length;
}

async function main() {
  const status = {
    checkedAt: new Date().toISOString(),
    fallbackUsed: false,
    restoredSections: [],
    unresolvedSections: [],
    counts: {}
  };

  for (const [sectionKey, config] of Object.entries(SECTION_CONFIG)) {
    const absolutePath = path.join(rootDir, config.file);
    const [currentContent, previousContent] = await Promise.all([
      readFileSafe(absolutePath),
      readGitFileSafe(config.file)
    ]);

    const currentChinaCount = countCountry(currentContent, "中國");
    const previousChinaCount = countCountry(previousContent, "中國");

    status.counts[sectionKey] = {
      label: config.label,
      currentChinaCount,
      previousChinaCount
    };

    if (currentChinaCount === 0 && previousChinaCount > 0 && previousContent) {
      await fs.writeFile(absolutePath, previousContent, "utf8");
      status.fallbackUsed = true;
      status.restoredSections.push(config.label);
      status.counts[sectionKey].finalChinaCount = previousChinaCount;
      continue;
    }

    status.counts[sectionKey].finalChinaCount = currentChinaCount;

    if (currentChinaCount === 0) {
      status.unresolvedSections.push(config.label);
    }
  }

  await fs.mkdir(logDir, { recursive: true });
  await fs.writeFile(statusPath, `${JSON.stringify(status, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
