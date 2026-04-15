export const SOURCE_CONFIG = {
  aiNews: [
    {
      id: "openai-blog",
      name: "OpenAI Blog",
      type: "rss",
      url: "https://openai.com/news/rss.xml",
      keywords: ["gpt", "model", "agent", "sora", "openai", "api"]
    },
    {
      id: "anthropic-news",
      name: "Anthropic News",
      type: "rss",
      url: "https://www.anthropic.com/news/rss.xml",
      keywords: ["claude", "anthropic", "agent", "api", "model"]
    },
    {
      id: "google-blog",
      name: "Google Blog",
      type: "rss",
      url: "https://blog.google/technology/ai/rss/",
      keywords: ["gemini", "google", "ai", "agent", "video", "workspace"]
    },
    {
      id: "huggingface-blog",
      name: "Hugging Face Blog",
      type: "rss",
      url: "https://huggingface.co/blog/feed.xml",
      keywords: ["open-source", "model", "inference", "agent", "transformer"]
    },
    {
      id: "hn-ai",
      name: "Hacker News AI",
      type: "hn",
      url: "https://hn.algolia.com/api/v1/search_by_date?tags=story",
      keywords: ["ai", "agent", "llm", "openai", "anthropic", "gemini", "model"]
    }
  ],
  gamingAiNews: [
    {
      id: "gamesbeat-ai",
      name: "GamesBeat",
      type: "rss",
      url: "https://venturebeat.com/games/feed/",
      keywords: ["ai", "artificial intelligence", "npc", "generative", "tool"]
    },
    {
      id: "unity-news",
      name: "Unity Blog",
      type: "rss",
      url: "https://blog.unity.com/feed",
      keywords: ["ai", "sentis", "inference", "tool", "workflow"]
    },
    {
      id: "unreal-news",
      name: "Unreal Engine",
      type: "rss",
      url: "https://www.unrealengine.com/en-US/feed",
      keywords: ["ai", "npc", "animation", "metahuman", "tool"]
    },
    {
      id: "gamasutra-ai",
      name: "Game Developer",
      type: "rss",
      url: "https://www.gamedeveloper.com/rss.xml",
      keywords: ["ai", "generative", "npc", "voice", "content"]
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
