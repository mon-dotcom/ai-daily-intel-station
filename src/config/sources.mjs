export const SOURCE_CONFIG = {
  aiNews: [
    {
      id: "openai-blog",
      name: "OpenAI Blog",
      type: "rss",
      sourceType: "official",
      country: "其他國家",
      url: "https://openai.com/news/rss.xml",
      keywords: ["gpt", "model", "agent", "sora", "openai", "api"]
    },
    {
      id: "anthropic-news",
      name: "Anthropic News",
      type: "rss",
      sourceType: "official",
      country: "其他國家",
      url: "https://www.anthropic.com/news/rss.xml",
      keywords: ["claude", "anthropic", "agent", "api", "model"]
    },
    {
      id: "google-blog",
      name: "Google Blog",
      type: "rss",
      sourceType: "official",
      country: "其他國家",
      url: "https://blog.google/technology/ai/rss/",
      keywords: ["gemini", "google", "ai", "agent", "video", "workspace"]
    },
    {
      id: "huggingface-blog",
      name: "Hugging Face Blog",
      type: "rss",
      sourceType: "official",
      country: "其他國家",
      url: "https://huggingface.co/blog/feed.xml",
      keywords: ["open-source", "model", "inference", "agent", "transformer"]
    },
    {
      id: "hn-ai",
      name: "Hacker News AI",
      type: "hn",
      sourceType: "community",
      country: "其他國家",
      url: "https://hn.algolia.com/api/v1/search_by_date?tags=story",
      keywords: ["ai", "agent", "llm", "openai", "anthropic", "gemini", "model"]
    }
  ],
  gamingAiNews: [
    {
      id: "gamesbeat-ai",
      name: "GamesBeat",
      type: "rss",
      sourceType: "media",
      country: "其他國家",
      url: "https://venturebeat.com/games/feed/",
      keywords: ["ai", "artificial intelligence", "npc", "generative", "tool"]
    },
    {
      id: "unity-news",
      name: "Unity Blog",
      type: "rss",
      sourceType: "official",
      country: "其他國家",
      url: "https://blog.unity.com/feed",
      keywords: ["ai", "sentis", "inference", "tool", "workflow"]
    },
    {
      id: "unreal-news",
      name: "Unreal Engine",
      type: "rss",
      sourceType: "official",
      country: "其他國家",
      url: "https://www.unrealengine.com/en-US/feed",
      keywords: ["ai", "npc", "animation", "metahuman", "tool"]
    },
    {
      id: "gamasutra-ai",
      name: "Game Developer",
      type: "rss",
      sourceType: "media",
      country: "其他國家",
      url: "https://www.gamedeveloper.com/rss.xml",
      keywords: ["ai", "generative", "npc", "voice", "content"]
    },
    {
      id: "gameworldobserver",
      name: "Game World Observer",
      type: "rss",
      sourceType: "media",
      country: "其他國家",
      url: "https://gameworldobserver.com/feed",
      keywords: ["ai", "generative", "agentic", "content", "npc", "automation", "llm"]
    },
    {
      id: "pocketgamerbiz",
      name: "PocketGamer.biz",
      type: "rss",
      sourceType: "media",
      country: "其他國家",
      url: "https://www.pocketgamer.biz/rss/",
      keywords: ["ai", "generative", "agentic", "content", "mini game", "automation", "llm"]
    },
    {
      id: "reddit-gamedev",
      name: "Reddit r/gamedev",
      type: "rss",
      sourceType: "community",
      country: "其他國家",
      url: "https://www.reddit.com/r/gamedev/.rss",
      keywords: ["ai", "generative", "agentic", "npc", "automation", "llm", "metahuman"]
    },
    {
      id: "reddit-indiegames",
      name: "Reddit r/indiegames",
      type: "rss",
      sourceType: "community",
      country: "其他國家",
      url: "https://www.reddit.com/r/indiegames/.rss",
      keywords: ["ai", "generative", "agentic", "mini game", "automation", "llm"]
    }
  ],
  github: {
    id: "github-search",
    name: "GitHub Search API",
    type: "github",
    endpoint: "https://api.github.com/search/repositories",
    topics: ["ai", "llm", "agent", "voice", "video", "multimodal"],
    fallbackTypes: {
      agent: "Agent / Workflow",
      coding: "Coding / DevTool",
      video: "Video / Media",
      voice: "Voice / Audio",
      model: "Open-source Model",
      data: "Data / MLOps",
      game: "Game AI / Tooling"
    }
  }
};
