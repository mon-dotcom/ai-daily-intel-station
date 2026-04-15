import { deriveKeywords } from "../lib/content-utils.mjs";

export function buildBeginnerModules({ aiTopics, githubProjects, gameTopics }) {
  const combinedText = [...aiTopics, ...gameTopics].map((item) => item.title).join(" ");
  const keywords = deriveKeywords(combinedText, 6);
  const firstProject = githubProjects[0];
  const mostFriendlyProject = githubProjects.find((project) => project.beginnerFriendly === "高") || firstProject;

  return [
    {
      title: "今天最值得試的一個 AI 工具",
      kicker: "快速試用",
      body: mostFriendlyProject
        ? `先從「${mostFriendlyProject.name}」開始，因為它在昨天觀測榜單中兼具熱度與上手性，適合拿來做第一次內部 PoC 或工作流試點。`
        : "今天沒有足夠資料判斷最適合試用的工具，建議先沿用團隊已熟悉的平台。",
      footer: "原則：先選低摩擦、可快速看到結果的工具。"
    },
    {
      title: "一句話解釋今天常看到的 AI 名詞",
      kicker: "名詞速懂",
      body: keywords.includes("agent")
        ? "Agent 指的是能根據目標自動拆步驟、呼叫工具並持續完成任務的 AI 系統，不只是會聊天的模型。"
        : "多模態指的是 AI 不只懂文字，也能同時處理圖片、聲音、影片或畫面資訊。",
      footer: "看新聞時，先辨認它是在談模型能力，還是在談可落地的工作流程。"
    },
    {
      title: "給上班族的 AI 入門建議",
      kicker: "今日建議",
      body:
        "挑一件你昨天重複做了兩次以上的工作，例如整理會議重點、彙整連結或轉寫逐字稿，先讓 AI 幫你做第一版，再保留人工校正。這比追新模型更容易帶來實際收益。",
      footer: firstProject
        ? `如果你偏技術角色，今天可以先觀察榜單第 1 名「${firstProject.name}」是否適合你的工作情境。`
        : "先從小範圍、高頻率、可驗證的工作開始。"
    }
  ];
}

export function buildReminder() {
  return "追 AI 新知時，先問三件事：它能不能節省時間、能不能接進既有流程、能不能被團隊其他人複製。";
}
