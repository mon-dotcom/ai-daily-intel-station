import fs from "node:fs";
import fsp from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 4321);

const watchTargets = [
  path.join(rootDir, "content"),
  path.join(rootDir, "src"),
  path.join(rootDir, "styles.css"),
  path.join(rootDir, "scripts", "generate.mjs")
];

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

let rebuildTimer = null;

function runBuild() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(rootDir, "scripts", "generate.mjs")], {
      cwd: rootDir,
      stdio: "inherit"
    });

    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Build failed with exit code ${code}`));
    });
  });
}

async function serveFile(filePath, response) {
  try {
    const data = await fsp.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": contentTypes[ext] || "application/octet-stream"
    });
    response.end(data);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

async function requestHandler(request, response) {
  const urlPath = request.url === "/" ? "/index.html" : request.url;
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(rootDir, safePath);
  await serveFile(filePath, response);
}

function scheduleBuild() {
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(async () => {
    try {
      await runBuild();
    } catch (error) {
      console.error(error.message);
    }
  }, 120);
}

function startWatchers() {
  for (const target of watchTargets) {
    fs.watch(target, { recursive: true }, () => {
      scheduleBuild();
    });
  }
}

await runBuild();
startWatchers();

http.createServer(requestHandler).listen(port, () => {
  console.log(`Markdown dev server running at http://localhost:${port}`);
});
