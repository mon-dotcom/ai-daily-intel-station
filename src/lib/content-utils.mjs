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

export function extractAiToolName(title = "") {
  const text = String(title)
    .replace(/<[^>]+>/g, " ")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const patterns = [
    /\bGPT-?\d(?:\.\d+)?\b/i,
    /\bChatGPT\b/i,
    /\bOpenAI API\b/i,
    /\bSora\b/i,
    /\bClaude(?:\s+\w+)?\b/i,
    /\bAnthropic\b/i,
    /\bGemini(?:\s+\w+)?\b/i,
    /\bVeo\b/i,
    /\bNotebookLM\b/i,
    /\bQwen(?:\d+(?:\.\d+)*)?(?:-[A-Za-z0-9]+)?\b/i,
    /\bLlama(?:\s*\d+(?:\.\d+)*)?\b/i,
    /\bMistral(?:\s+\w+)?\b/i,
    /\bGrok\b/i,
    /\bCopilot\b/i,
    /\bMidjourney\b/i,
    /\bRunway\b/i,
    /\bPika\b/i,
    /\bCursor\b/i,
    /\bPerplexity\b/i,
    /\bHugging Face\b/i,
    /\bUnity Sentis\b/i,
    /\bDLSS\s*\d*\b/i,
    /\bMiniMax\b/i,
    /\bDoubao\b/i,
    /\b豆包\b/,
    /\b通义千问\b/,
    /\b元宝\b/,
    /\b即梦\b/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[0]) {
      return match[0].trim();
    }
  }

  return "";
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
  const cleanTitle = String(title)
    .replace(/<[^>]+>/g, " ")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s*\[[A-Z]\]\s*$/i, "")
    .trim();
  const lower = cleanTitle.toLowerCase();
  const lead = cleanTitle || "這則更新";

  if (/(agent|workflow|automation|ops|pipeline|coordination)/i.test(lower)) {
    return `重點在於「${lead}」，反映 AI 正在從單點工具走向可落地的流程自動化。`;
  }

  if (/(video|image|audio|voice|visual|multimodal|素材|圖片|图像|影片|视频)/i.test(lower)) {
    return `焦點圍繞「${lead}」，可直接觀察 AI 在影音與素材產線上的新能力。`;
  }

  if (/(model|llm|benchmark|inference|deploy|open-source|open source|research)/i.test(lower)) {
    return `焦點圍繞「${lead}」，適合用來判斷模型能力、開源方向與實作落地的變化。`;
  }

  if (/(game|npc|unity|unreal|live ops|liveops|mini game|小游戏|小遊戲)/i.test(lower)) {
    return `聚焦「${lead}」，值得留意它對遊戲開發、內容製作或營運流程的影響。`;
  }

  return `聚焦「${lead}」，可用來快速掌握近期 AI 工具、產品或產業動向。`;
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

export function inferCountryFromSource(source = {}) {
  if (source.country) return source.country;
  if (source.sourceType === "wechat") return "中國";
  return "其他國家";
}

export function inferCategories(item = {}) {
  const text = `${item.title || ""} ${item.summary || ""} ${item.description || ""} ${item.sourceName || ""}`.toLowerCase();
  const categories = new Set();

  if (/(video|image|art|animation|visual|creative|asset|素材|圖片|影片|图像|视频|美術|美术|插畫|插画|立繪|立绘)/i.test(text)) {
    categories.add("影片/圖片素材製作");
  }

  if (/(tiktok|douyin|mini game|minigame|short video|viral|social game|短影音|抖音|小游戏|小遊戲)/i.test(text)) {
    categories.add("TikTok Mini Game");
  }

  if (/(workflow|automation|ops|project|manager|planning|pipeline|coordination|management|agent|專案|项目|流程|管理|企劃|企划|協作|协作)/i.test(text)) {
    categories.add("專案管理");
  }

  if (/(launch|trend|market|insight|analytics|analysis|research|tracking|intel|observe|觀察|观察|情報|情报|分析|趨勢|趋势|監測|监测|收集|资讯|資訊)/i.test(text)) {
    categories.add("新遊戲情報收集與分析");
  }

  if (/(gamelook|dataeye|游戏葡萄|榜单|榜單|盛会|盛會|大会|大會|趋势|趨勢|观察|觀察)/i.test(text)) {
    categories.add("新遊戲情報收集與分析");
  }

  if (!categories.size) {
    categories.add("專案管理");
  }

  return [...categories];
}

export function isGameIndustryRelated(input = {}) {
  const text =
    typeof input === "string"
      ? input
      : `${input.title || ""} ${input.summary || ""} ${input.description || ""} ${input.sourceName || ""} ${(input.categories || []).join(" ")}`;

  return /(game|gaming|gamer|games|unity|unreal|roblox|steam|playstation|xbox|nintendo|metahuman|npc|live ops|liveops|indie game|mobile game|mini game|gamedev|gamelook|dataeye|游戏|遊戲|小游戏|小遊戲|手游|手遊|电竞|電競|葡萄|發行|发行)/i.test(
    text
  );
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
