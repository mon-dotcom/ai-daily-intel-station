import fs from "node:fs/promises";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);

async function readFileSafe(path) {
  try {
    return await fs.readFile(path, "utf8");
  } catch {
    return "";
  }
}

async function readGitFileSafe(path) {
  try {
    const { stdout } = await execFile("git", ["show", `HEAD:${path}`], {
      cwd: process.cwd(),
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
  const aiPath = "content/ai-news.md";
  const gamePath = "content/game-ai.md";

  const [currentAi, currentGame, previousAi, previousGame] = await Promise.all([
    readFileSafe(aiPath),
    readFileSafe(gamePath),
    readGitFileSafe(aiPath),
    readGitFileSafe(gamePath)
  ]);

  const current = {
    ai: countCountry(currentAi, "中國"),
    game: countCountry(currentGame, "中國")
  };

  const previous = {
    ai: countCountry(previousAi, "中國"),
    game: countCountry(previousGame, "中國")
  };

  console.log(
    JSON.stringify(
      {
        currentChinaCount: current,
        previousChinaCount: previous
      },
      null,
      2
    )
  );

  const hasWechatConfig = Boolean(
    process.env.WECHAT_RSS_ORIGIN_URL || process.env.WECHAT_RSS_FEEDS || process.env.WECHAT_RSS_FEED_IDS
  );

  if (!hasWechatConfig) {
    throw new Error("WeChat RSS configuration is missing. China article coverage cannot be verified.");
  }

  if (current.ai === 0 || current.game === 0) {
    const reasons = [];
    if (current.ai === 0) reasons.push("全球 AI 關鍵動態沒有任何中國文章");
    if (current.game === 0) reasons.push("遊戲產業 × AI 重要進展沒有任何中國文章");

    throw new Error(
      `${reasons.join("；")}。這通常代表 WeWe RSS / 微信來源抓取失敗，或 GitHub Actions 無法連到 WECHAT_RSS_ORIGIN_URL。`
    );
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
