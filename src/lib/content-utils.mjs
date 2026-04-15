const GENERIC_STOP_WORDS = [
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "into",
  "about",
  "openai",
  "anthropic",
  "google",
  "meta",
  "microsoft",
  "hugging",
  "face",
  "blog"
];

export function pickAudienceTag(title = "", fallback = "想快速掌握 AI 重點的人") {
  const lower = title.toLowerCase();

  if (/(agent|workflow|automation|ops)/i.test(lower)) return "產品、營運與流程優化團隊";
  if (/(code|coding|dev|programming|repo)/i.test(lower)) return "工程與開發團隊";
  if (/(video|image|audio|voice|media)/i.test(lower)) return "內容、行銷與多媒體團隊";
  if (/(game|npc|unity|unreal)/i.test(lower)) return "遊戲開發與互動體驗團隊";
  if (/(model|inference|deploy|serving)/i.test(lower)) return "平台、資料與基礎設施團隊";

  return fallback;
}

export function inferProjectType(repo = {}) {
  const text = `${repo.name || ""} ${repo.description || ""} ${(repo.topics || []).join(" ")}`.toLowerCase();

  if (/(agent|workflow|assistant|manus|crew)/.test(text)) return "Agent / Workflow";
  if (/(code|coding|developer|devtool|editor|cli|pair)/.test(text)) return "Coding / DevTool";
  if (/(video|image|diffusion|media|portrait)/.test(text)) return "Video / Media";
  if (/(voice|speech|audio|transcript|whisper)/.test(text)) return "Voice / Audio";
  if (/(serve|inference|vector|rag|deploy|vllm|infra)/.test(text)) return "Data / MLOps";
  if (/(model|llm|ollama|transformer|checkpoint)/.test(text)) return "Open-source Model";
  if (/(game|npc|player|liveops|unity|unreal)/.test(text)) return "Game AI / Tooling";

  return "AI Tooling";
}

export function inferUseCase(projectType) {
  const mapping = {
    "Agent / Workflow": "流程自動化、知識整理、工具串接",
    "Coding / DevTool": "寫程式、重構、除錯、團隊開發",
    "Video / Media": "內容製作、視覺生成、影片實驗",
    "Voice / Audio": "逐字稿、語音處理、客服音訊",
    "Data / MLOps": "模型部署、推理服務、平台治理",
    "Open-source Model": "本地測試、內網 PoC、模型驗證",
    "Game AI / Tooling": "NPC、內容生成、遊戲工作流"
  };

  return mapping[projectType] || "AI 試驗、工作效率提升";
}

export function inferBeginnerFriendly(projectType) {
  if (["Coding / DevTool", "Open-source Model", "Agent / Workflow"].includes(projectType)) return "高";
  if (["Video / Media", "Voice / Audio"].includes(projectType)) return "中";
  return "低";
}

export function summarizeTitleInZh(title = "", sourceName = "") {
  const cleanTitle = title.trim();
  const lead = cleanTitle || "這則更新";
  return `這則消息由 ${sourceName} 發布，焦點圍繞「${lead}」。如果你昨天沒有時間追完整篇內容，至少要留意它涉及的產品方向、實際應用場景，以及它是否代表 AI 工具開始進一步進入真實工作流程。`;
}

export function buildWhyItMatters(title = "") {
  const lower = title.toLowerCase();

  if (/(agent|workflow|automation)/.test(lower)) {
    return "它反映企業導入 AI 的重點正在轉向可執行流程，而不是單點聊天能力。";
  }
  if (/(video|voice|audio|image|multimodal)/.test(lower)) {
    return "它顯示多模態能力正在變成工作者可直接感受到的生產力工具。";
  }
  if (/(open-source|model|repo|github|deploy)/.test(lower)) {
    return "它對團隊試作與成本控制特別重要，因為開源工具通常更容易快速驗證。";
  }

  return "它值得關注，因為這類消息通常會影響團隊接下來要追的工具方向與導入節奏。";
}

export function buildGameRelation(title = "") {
  const lower = title.toLowerCase();

  if (/(npc|dialogue|character)/.test(lower)) {
    return "這和遊戲角色互動設計直接相關，會影響沉浸感、營運成本與內容擴展能力。";
  }
  if (/(video|image|art|animation|audio)/.test(lower)) {
    return "這與遊戲內容產製流程關聯高，可能影響美術、動畫與影音素材的產線效率。";
  }
  if (/(engine|unity|unreal|platform|tool)/.test(lower)) {
    return "這會影響遊戲團隊選型與工具鏈整合，尤其是引擎與平台層的 AI 標配化。";
  }

  return "它與遊戲產業的關聯，在於 AI 是否能真正進入開發與營運流程，而不只是展示功能。";
}

export function deriveKeywords(text = "", limit = 5) {
  const counts = new Map();
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !GENERIC_STOP_WORDS.includes(word));

  for (const word of words) {
    counts.set(word, (counts.get(word) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

export function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
