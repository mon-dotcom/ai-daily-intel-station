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
const diagnosticsPath = path.join(logDir, "wechat-fetch-diagnostics.json");

function normalizeOriginUrl(url = "") {
  return String(url).trim().replace(/\/+$/, "");
}

function parseNamedEntries(raw = "") {
  return String(raw)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [name, id] = entry.split("|");
      return {
        name: (name || "").trim(),
        id: (id || "").trim()
      };
    })
    .filter((entry) => entry.name && entry.id);
}

async function readJsonSafe(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

async function runCommand(command, args, options = {}) {
  try {
    const result = await execFile(command, args, {
      cwd: rootDir,
      maxBuffer: 10 * 1024 * 1024,
      ...options
    });
    return {
      ok: true,
      stdout: result.stdout || "",
      stderr: result.stderr || ""
    };
  } catch (error) {
    return {
      ok: false,
      stdout: error.stdout || "",
      stderr: error.stderr || "",
      message: error.message || String(error)
    };
  }
}

function countFeedItems(xml = "") {
  return (xml.match(/<item>/g) || []).length;
}

async function main() {
  const status = await readJsonSafe(statusPath);
  const origin = normalizeOriginUrl(process.env.WECHAT_RSS_ORIGIN_URL || "http://localhost:4000");
  const feeds = parseNamedEntries(process.env.WECHAT_RSS_FEED_IDS || "");

  const diagnostics = {
    checkedAt: new Date().toISOString(),
    trigger: {
      fallbackUsed: Boolean(status?.fallbackUsed),
      restoredSections: status?.restoredSections || [],
      unresolvedSections: status?.unresolvedSections || []
    },
    service: {},
    docker: {},
    feeds: [],
    flags: {
      weReadAccountUnavailable: false,
      serviceUnavailable: false,
      emptyFeeds: []
    },
    suspectedCauses: []
  };

  const serviceProbe = await runCommand("curl", ["-fsSL", `${origin}/feeds/`]);
  diagnostics.service = {
    origin,
    reachable: serviceProbe.ok,
    message: serviceProbe.ok ? "ok" : serviceProbe.message || serviceProbe.stderr || "unreachable"
  };

  const dockerInspect = await runCommand("docker", ["inspect", "wewe-rss", "--format", "{{.State.Status}} {{.State.Running}} {{.RestartCount}}"]);
  diagnostics.docker.inspect = dockerInspect.ok ? dockerInspect.stdout.trim() : dockerInspect.message || dockerInspect.stderr || "unavailable";

  const dockerLogs = await runCommand("docker", ["logs", "--tail", "200", "wewe-rss"]);
  diagnostics.docker.logsAvailable = dockerLogs.ok;

  const recentLogs = `${dockerLogs.stdout}\n${dockerLogs.stderr}`;
  if (/暂无可用读书账号/.test(recentLogs)) {
    diagnostics.flags.weReadAccountUnavailable = true;
    diagnostics.suspectedCauses.push("微信讀書帳號目前不可用或已失效");
  }

  if (!serviceProbe.ok) {
    diagnostics.flags.serviceUnavailable = true;
    diagnostics.suspectedCauses.push("WeWe 服務本身目前無法連線");
  }

  for (const feed of feeds) {
    const feedProbe = await runCommand("curl", ["-fsSL", `${origin}/feeds/${feed.id}.rss?limit=5`]);
    const itemCount = feedProbe.ok ? countFeedItems(feedProbe.stdout) : null;
    diagnostics.feeds.push({
      name: feed.name,
      id: feed.id,
      reachable: feedProbe.ok,
      itemCount,
      empty: feedProbe.ok ? itemCount === 0 : null,
      message: feedProbe.ok ? "ok" : feedProbe.message || feedProbe.stderr || "failed"
    });
  }

  const emptyFeeds = diagnostics.feeds.filter((feed) => feed.empty).map((feed) => feed.name);
  diagnostics.flags.emptyFeeds = emptyFeeds;
  if (emptyFeeds.length) {
    diagnostics.suspectedCauses.push(`以下微信來源 feed 為空：${emptyFeeds.join("、")}`);
  }

  if (!diagnostics.suspectedCauses.length) {
    diagnostics.suspectedCauses.push("未發現明確服務錯誤，較可能是來源本身沒有新文或未命中選文條件");
  }

  await fs.mkdir(logDir, { recursive: true });
  await fs.writeFile(diagnosticsPath, `${JSON.stringify(diagnostics, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(diagnostics, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
