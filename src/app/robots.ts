import type { MetadataRoute } from 'next'

// AI training crawlers and SEO scrapers we don't want indexing the
// archive. Search-engine bots (Googlebot, bingbot, DuckDuckBot, etc.)
// are deliberately NOT in this list — we want the site discoverable
// in search.
const DISALLOWED_USER_AGENTS = [
  // AI training / LLM crawlers
  'GPTBot',                 // OpenAI
  'ChatGPT-User',           // OpenAI live browsing
  'OAI-SearchBot',          // OpenAI search
  'anthropic-ai',           // Anthropic
  'ClaudeBot',              // Anthropic
  'Claude-Web',             // Anthropic
  'Google-Extended',        // Google's AI training opt-out token
  'GoogleOther',            // Google's AI/research crawler (NOT Googlebot)
  'Bytespider',             // ByteDance / TikTok
  'CCBot',                  // Common Crawl (used by many LLM trainers)
  'PerplexityBot',          // Perplexity AI
  'Perplexity-User',        // Perplexity live browsing
  'cohere-ai',              // Cohere
  'Diffbot',                // Diffbot (LLM data)
  'Applebot-Extended',      // Apple's AI training opt-out token
  'FacebookBot',            // Meta (older)
  'Meta-ExternalAgent',     // Meta's Llama training crawler — heaviest hitter today
  'Meta-ExternalFetcher',   // Meta link-preview / agent
  'Amazonbot',              // Amazon's AI/Alexa crawler
  'YouBot',                 // You.com
  'AI2Bot',                 // Allen Institute for AI
  'omgili',                 // Webz.io scraper sold to AI buyers
  'Timpibot',               // Timpi search
  'ImagesiftBot',           // Hive AI image search

  // SEO / commercial scrapers (heavy, no value to us)
  'DataForSeoBot',
  'SemrushBot',
  'AhrefsBot',
  'MJ12bot',                // Majestic
  'DotBot',                 // Moz
  'rogerbot',               // Moz
  'BLEXBot',                // WebMeUp
  'PetalBot',               // Huawei
  'SleepBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default: search engines welcome, just keep them out of admin/api.
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/gone'],
      },
      // Each disallowed bot gets its own block telling it not to crawl
      // anything. Polite bots (Meta, Google, Anthropic, OpenAI, etc.)
      // honour this within ~24-48h.
      ...DISALLOWED_USER_AGENTS.map((userAgent) => ({
        userAgent,
        disallow: '/',
      })),
    ],
    sitemap: 'https://holylandphotos.org/sitemap.xml',
    host: 'https://holylandphotos.org',
  }
}
