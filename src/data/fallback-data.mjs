export const FALLBACK_DATA = {
  generatedAt: "2026-04-15T10:00:00+08:00",
  targetDateLabel: "2026 年 4 月 14 日",
  dataStatus: {
    mode: "fallback",
    message: "部分來源暫時不可用，以下內容為示範資料與備援整理。",
    degradedSources: ["即時新聞來源", "GitHub API"]
  },
  aiTopics: [
    {
      title: "AI Agent 從聊天走向工作流程自動化，企業工具鏈整合再升溫",
      summary:
        "昨天最受關注的焦點，是 AI Agent 不再只停留在對話介面，而是開始更深地接入文件、任務、知識庫與內部系統。許多團隊討論的核心，不是模型多強，而是 Agent 是否能真正完成跨工具任務、減少人工切換與重複操作。",
      whyItMatters:
        "對工作團隊來說，這代表 AI 採用門檻正在從『試玩』走向『流程落地』，評估重點會轉向權限、安全、可追蹤性與 ROI。",
      audienceTag: "產品、營運、內部工具團隊",
      sourceName: "綜合官方部落格與社群觀測",
      sourceUrl: "https://openai.com/news/",
      publishedAt: "2026-04-14T09:10:00Z",
      imageUrl:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "多模態模型持續擴張，影片、語音與即時互動成為新主戰場",
      summary:
        "相較於單純文字生成，昨天的熱門討論明顯集中在影片、語音與畫面理解能力。市場正在比較哪一類模型更適合做客服、內容製作、教學互動與創作流程，焦點也轉向延遲、成本與整體體驗，而不只是 benchmark。",
      whyItMatters:
        "這表示未來團隊導入 AI，不應只看文字能力，而要同時盤點影片、語音與視覺流程是否有高頻需求，才能找到真正能落地的工具。",
      audienceTag: "行銷、內容、影音與客服團隊",
      sourceName: "綜合模型與工具更新觀測",
      sourceUrl: "https://blog.google/technology/ai/",
      publishedAt: "2026-04-14T13:30:00Z",
      imageUrl:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "開源 AI 專案熱度回到實用導向，Coding、Agent 與本地部署最受注意",
      summary:
        "GitHub 與社群討論顯示，昨天最容易引發關注的並不是概念型專案，而是能直接幫團隊提升效率的工具，例如 coding agent、工作流編排、模型推理優化與本地部署套件。大家更在意是否能快速試用，而不是只有 demo 漂亮。",
      whyItMatters:
        "對內部分享頁來說，這類專案更值得追蹤，因為它們與團隊試點、導入評估與知識累積的距離最短。",
      audienceTag: "工程、資料與 IT 團隊",
      sourceName: "GitHub 與開源社群整理",
      sourceUrl: "https://github.com/trending",
      publishedAt: "2026-04-14T16:40:00Z",
      imageUrl:
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80"
    }
  ],
  githubProjects: [
    {
      rank: 1,
      name: "openmanus",
      url: "https://github.com/mannaandpoem/OpenManus",
      stars: 42000,
      delta: "up",
      deltaLabel: "上升",
      projectType: "Agent / Workflow",
      oneLiner: "把多步驟任務拆解與執行的開源 Agent 框架。",
      useCase: "自動研究、資料整理、工具串接。",
      beginnerFriendly: "中高",
      notes: "熱度高但要看實際工具整合能力。"
    },
    {
      rank: 2,
      name: "aider",
      url: "https://github.com/Aider-AI/aider",
      stars: 29000,
      delta: "up",
      deltaLabel: "上升",
      projectType: "Coding / DevTool",
      oneLiner: "在終端協作寫程式的 AI pair programmer。",
      useCase: "程式修改、重構、除錯。",
      beginnerFriendly: "高",
      notes: "適合開發團隊快速試用。"
    },
    {
      rank: 3,
      name: "comfyui",
      url: "https://github.com/comfyanonymous/ComfyUI",
      stars: 51000,
      delta: "flat",
      deltaLabel: "持平",
      projectType: "Video / Media",
      oneLiner: "節點式 AI 影像與影片工作流平台。",
      useCase: "圖像生成、風格轉換、影片實驗。",
      beginnerFriendly: "中",
      notes: "成熟度高，適合有內容製作需求的團隊。"
    },
    {
      rank: 4,
      name: "ollama",
      url: "https://github.com/ollama/ollama",
      stars: 98000,
      delta: "up",
      deltaLabel: "上升",
      projectType: "Open-source Model",
      oneLiner: "用極低門檻在本機執行大型語言模型。",
      useCase: "內網測試、原型驗證、本地推理。",
      beginnerFriendly: "高",
      notes: "企業 PoC 常見起點。"
    },
    {
      rank: 5,
      name: "langgenius/dify",
      url: "https://github.com/langgenius/dify",
      stars: 76000,
      delta: "up",
      deltaLabel: "上升",
      projectType: "Agent / Workflow",
      oneLiner: "偏產品化的 LLM 應用開發與編排平台。",
      useCase: "知識庫、工作流、自建 AI 應用。",
      beginnerFriendly: "高",
      notes: "很適合內部 PoC 與 demo。"
    },
    {
      rank: 6,
      name: "open-webui",
      url: "https://github.com/open-webui/open-webui",
      stars: 64000,
      delta: "flat",
      deltaLabel: "持平",
      projectType: "Open-source Model",
      oneLiner: "為本地或遠端模型提供完整網頁介面。",
      useCase: "內部聊天入口、模型管理。",
      beginnerFriendly: "高",
      notes: "容易交付給非技術使用者。"
    },
    {
      rank: 7,
      name: "LivePortrait",
      url: "https://github.com/KwaiVGI/LivePortrait",
      stars: 18000,
      delta: "down",
      deltaLabel: "下降",
      projectType: "Video / Media",
      oneLiner: "將靜態肖像轉為可驅動的動畫內容。",
      useCase: "角色動畫、短影音素材。",
      beginnerFriendly: "中",
      notes: "短期爆紅題材，但實際商務場景有限。"
    },
    {
      rank: 8,
      name: "faster-whisper",
      url: "https://github.com/SYSTRAN/faster-whisper",
      stars: 14500,
      delta: "up",
      deltaLabel: "上升",
      projectType: "Voice / Audio",
      oneLiner: "高效率 Whisper 推理實作，速度與資源表現佳。",
      useCase: "逐字稿、會議整理、語音搜尋。",
      beginnerFriendly: "中高",
      notes: "很適合內部知識整理流程。"
    },
    {
      rank: 9,
      name: "vllm",
      url: "https://github.com/vllm-project/vllm",
      stars: 39000,
      delta: "up",
      deltaLabel: "上升",
      projectType: "Data / MLOps",
      oneLiner: "針對高吞吐 LLM 服務設計的推理引擎。",
      useCase: "高並發 API、模型服務化。",
      beginnerFriendly: "低",
      notes: "更適合平台或 infra 團隊。"
    },
    {
      rank: 10,
      name: "anythingllm",
      url: "https://github.com/Mintplex-Labs/anything-llm",
      stars: 43000,
      delta: "flat",
      deltaLabel: "持平",
      projectType: "Agent / Workflow",
      oneLiner: "把文件、知識庫與多種模型串成可用的 AI 工作區。",
      useCase: "企業知識問答、團隊助理。",
      beginnerFriendly: "高",
      notes: "適合試作內部搜尋助理。"
    }
  ],
  githubInsights: [
    "Agent、Coding 與本地部署工具仍是最容易形成實際導入討論的主流方向。",
    "影像與影片專案容易快速爆紅，但要注意是否只是社群展示效果，未必適合團隊長期投入。",
    "若要讓團隊短期內有感，優先試用 `aider`、`dify`、`ollama` 這類上手成本較低的專案。"
  ],
  gameTopics: [
    {
      title: "遊戲開發工具持續導入生成式 AI，重點從炫技轉向製作流程效率",
      summary:
        "昨天遊戲圈討論最集中的方向，是 AI 工具是否真的能縮短開發流程，包括概念圖產出、素材變體、腳本草稿與測試資料生成。市場不再只看模型效果，而是更在意工具能否嵌入既有工作流，避免額外管理成本。",
      relation:
        "這直接影響美術、企劃與技術美術協作流程，若工具不能真正融入 production pipeline，熱度很快就會消退。",
      audienceTag: "遊戲企劃、美術、技術美術",
      sourceName: "GamesBeat",
      sourceUrl: "https://venturebeat.com/games/",
      publishedAt: "2026-04-14T07:50:00Z",
      imageUrl:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "NPC 對話與角色互動 AI 仍受關注，但落地挑戰集中在穩定性與成本",
      summary:
        "生成式 NPC 與即時對話角色依然有聲量，但昨天更多從業者討論的其實是長期營運問題，例如回應品質是否穩定、敏感內容如何控管、多人並發時成本是否失控，以及能否與任務設計真正互相配合。",
      relation:
        "對遊戲團隊來說，AI NPC 的價值已不只是 demo，而是能否成為 LiveOps 與內容更新的一部分。",
      audienceTag: "系統設計、LiveOps、敘事團隊",
      sourceName: "Game Developer",
      sourceUrl: "https://www.gamedeveloper.com/",
      publishedAt: "2026-04-14T12:15:00Z",
      imageUrl:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "引擎與平台供應商開始把 AI 當成標配能力，而不是外掛功能",
      summary:
        "從引擎官方訊息到工具供應商動態，昨天能看出一個明顯趨勢：AI 正在從獨立外掛變成平台核心能力的一部分。大家更常關注內建推理、資產搜尋、流程輔助與內容分析，而不是單點功能展示。",
      relation:
        "這會改變遊戲團隊採購與導入策略，未來評估引擎或平台時，AI 能力很可能成為標準比較項目。",
      audienceTag: "技術決策者、工具平台團隊",
      sourceName: "Unity / Unreal 觀測",
      sourceUrl: "https://blog.unity.com/",
      publishedAt: "2026-04-14T18:05:00Z",
      imageUrl:
        "https://images.unsplash.com/photo-1556438064-2d7646166914?auto=format&fit=crop&w=900&q=80"
    }
  ],
  beginnerModules: [
    {
      title: "今天最值得試的 AI 工具",
      kicker: "本日試用",
      body:
        "先從 `aider` 或 `Dify` 這類可以快速看見成果的工具開始。前者適合工程師體驗 AI 協作寫程式，後者適合非工程背景快速做出內部 AI 小工具。",
      footer: "適合第一次想把 AI 放進實際工作流程的人。"
    },
    {
      title: "一句話看懂 AI 名詞",
      kicker: "名詞速讀",
      body:
        "Agent 不是單純會聊天的模型，而是能根據目標分解步驟、呼叫工具、回收結果並繼續完成任務的一整套執行流程。",
      footer: "看新聞時只要記住：重點不是它會說話，而是它能不能做事。"
    },
    {
      title: "上班族今天就能用的 AI 小技巧",
      kicker: "立即上手",
      body:
        "把你每天固定會寫的會議摘要、需求整理或周報，先拆成固定模板，再交給 AI 代填初稿，最後由你做 20% 的修正，通常比從零開始更有效率。",
      footer: "先找高頻、格式固定、可人工複核的工作最容易成功。"
    }
  ],
  reminder: "不要只追最紅的新模型。真正值得追的是：能不能幫你的團隊省時間、提品質、或打開新的工作方式。"
};
