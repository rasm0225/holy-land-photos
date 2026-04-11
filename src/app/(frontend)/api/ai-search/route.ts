import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import Anthropic from '@anthropic-ai/sdk'
import { logSearch } from '@/lib/searchLog'

export const maxDuration = 60
export const runtime = 'nodejs'

const MODEL = 'claude-haiku-4-5-20251001'

const SYSTEM_PROMPT_STATIC = `You are a helpful search assistant for HolyLandPhotos.org, a scholarly photo archive of biblical and archaeological sites.

The site contains:
- 7,000+ high-resolution photographs by Dr. Carl Rasmussen
- 700+ sections covering biblical sites, archaeological locations, and artifacts across Israel, Jordan, Turkey, Greece, Egypt, Italy, and other Mediterranean/Near Eastern regions
- Photos are organized hierarchically by country → region → site → sub-site

Your job is to help users find information on this website. You can answer questions about:

1. **Photos and sites** — use the search tools to find matching sections and photos
2. **General site information** — use the reference content below (from the site's About page, How to Use, Permissions, tour announcements, news, etc.)

Guidelines:

1. **ALWAYS search before declining.** For any query that mentions a place, object, topic, keyword, person's name, plant, animal, artifact, or really anything concrete — you MUST call search_photos AND search_sections first. Do not assume a topic is "off-topic" or not in the archive. The archive contains 7,000+ photos with diverse keywords including plants, flora, artifacts, inscriptions, everyday objects, and much more beyond what you might expect. A query like "opium", "poppy", "lion", "coin", "inscription", or "boat" may well match content.
2. **Only say "I don't have that information" after actually searching and getting empty results.** Never refuse to search based on your own judgment about topical relevance.
3. **Single-word queries are valid searches.** Do not ask for clarification on single-word topical queries — search first, then present results. Only ask for clarification if the tools return results that are genuinely ambiguous (e.g., "Caesarea" returns multiple distinct cities).
4. For questions about Dr. Rasmussen, copyright/permissions, how to use the site, upcoming tours, or news — answer from the REFERENCE CONTENT section below.
5. Consider alternate spellings (e.g., Hierapolis/Ierapolis, Caesarea Maritima vs Caesarea Philippi, Haran/Harran, Herodion/Herodium). If the first search returns nothing, try a variant spelling before giving up.
6. When presenting results, format links as markdown:
   - Sections: [Section Title](/browse/SLUG)
   - Photos: [Photo Title](/photos/IMAGE_ID)
   - Pages: [Page Title](/pages/SLUG)
   - News: [News Title](/news/ID)
7. Add brief scholarly context when helpful (e.g., "associated with Paul's 3rd missionary journey"), but only from the reference content or tool results — do not invent facts.
8. Be concise — users want to find things, not read essays.
9. If the information is not in the reference content or search results (after actually searching), say so. Do not make up answers or draw from general web knowledge.

Tone guidelines:
- Write in a reserved, scholarly tone. This audience is scholars, clergy, educators, and students — not casual web users.
- Do not open responses with "Great!", "Perfect!", "Excellent!", "Sure!", or similar enthusiastic exclamations.
- Do not praise the user's question.
- Start responses directly with the information or answer. Lead with facts, not reactions.
- Avoid filler phrases like "I found some great results" or "Here are some wonderful options". Just present the results.

The public site base URL is https://holy-land-photos.vercel.app — but always use relative links (/browse/..., /photos/..., /pages/..., /news/...) so they work in the chat UI.`

const tools: Anthropic.Messages.Tool[] = [
  {
    name: 'search_sections',
    description:
      'Search for sections (sites, regions, countries, artifacts) by title or keywords. Returns matching sections with their slugs for linking.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search term — matches against section title and keywords',
        },
        limit: {
          type: 'number',
          description: 'Max results to return (default 10, max 25)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_photos',
    description:
      'Search for individual photos by title, keywords, or image ID. Returns matching photos with their image IDs for linking.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search term — matches against photo title, keywords, or image ID',
        },
        limit: {
          type: 'number',
          description: 'Max results to return (default 10, max 25)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_section_photos',
    description:
      'Get the list of photos in a specific section by slug. Use this after finding a relevant section to show the user what photos are available.',
    input_schema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'The section slug (e.g., "nain", "hierapolis-plutonium")',
        },
      },
      required: ['slug'],
    },
  },
]

type ToolInput = Record<string, unknown>

async function runTool(name: string, input: ToolInput): Promise<string> {
  const payload = await getPayload({ config })

  if (name === 'search_sections') {
    const query = String(input.query || '').trim()
    const limit = Math.min(Number(input.limit) || 10, 25)
    if (!query) return JSON.stringify({ error: 'query required' })

    const { docs } = await payload.find({
      collection: 'sections',
      where: {
        or: [
          { title: { contains: query } },
          { keywords: { contains: query } },
          { internalKeywords: { contains: query } },
        ],
      },
      limit,
      depth: 0,
      select: { title: true, slug: true, sectionType: true, keywords: true },
    })

    return JSON.stringify(
      docs.map((d) => ({
        title: d.title,
        slug: d.slug,
        type: d.sectionType,
        keywords: d.keywords,
      })),
    )
  }

  if (name === 'search_photos') {
    const query = String(input.query || '').trim()
    const limit = Math.min(Number(input.limit) || 10, 25)
    if (!query) return JSON.stringify({ error: 'query required' })

    const { docs } = await payload.find({
      collection: 'photos',
      where: {
        or: [
          { title: { contains: query } },
          { keywords: { contains: query } },
          { imageId: { contains: query } },
        ],
      },
      limit,
      depth: 0,
      select: { title: true, imageId: true, keywords: true },
    })

    return JSON.stringify(
      docs.map((d) => ({
        title: d.title,
        imageId: d.imageId,
        keywords: d.keywords,
      })),
    )
  }

  if (name === 'get_section_photos') {
    const slug = String(input.slug || '').trim()
    if (!slug) return JSON.stringify({ error: 'slug required' })

    const { docs } = await payload.find({
      collection: 'sections',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
      select: { title: true, slug: true, photos: true },
    })

    if (!docs[0]) return JSON.stringify({ error: 'section not found' })

    const photos = ((docs[0].photos as unknown as Array<{ photo?: { title?: string; imageId?: string } | number }>) || [])
      .map((item) => {
        const p = typeof item.photo === 'object' ? item.photo : null
        return p ? { title: p.title, imageId: p.imageId } : null
      })
      .filter(Boolean)

    return JSON.stringify({
      section: docs[0].title,
      slug: docs[0].slug,
      photoCount: photos.length,
      photos,
    })
  }

  return JSON.stringify({ error: `unknown tool: ${name}` })
}

/**
 * Extract plain text from Lexical rich text JSON.
 * Walks the tree and concatenates all text nodes.
 */
function lexicalToText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as Record<string, unknown>
  if (n.type === 'text' && typeof n.text === 'string') return n.text
  if (n.type === 'link' || n.type === 'autolink') {
    const children = Array.isArray(n.children) ? n.children : []
    return children.map(lexicalToText).join('')
  }
  const children = Array.isArray(n.children) ? n.children : []
  const childText = children.map(lexicalToText).join('')
  // Add line breaks after block-level nodes
  if (
    n.type === 'paragraph' ||
    n.type === 'heading' ||
    n.type === 'listitem' ||
    n.type === 'quote'
  ) {
    return childText + '\n'
  }
  return childText
}

function extractTextFromDoc(doc: Record<string, unknown>): string {
  const body = doc.body as { root?: unknown } | null
  if (body && body.root) {
    const text = lexicalToText(body.root).trim()
    if (text) return text
  }
  const htmlBody = doc.htmlBody as string | null
  if (htmlBody) {
    return htmlBody
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }
  return ''
}

/**
 * Build the reference content block that gets prepended to the system prompt.
 * Includes all displayed pages and active news items so Claude can answer
 * general questions about the site (permissions, tours, how to use, etc.)
 * without making things up.
 */
async function buildReferenceContent(): Promise<string> {
  const payload = await getPayload({ config })

  const [pagesResult, newsResult] = await Promise.all([
    payload.find({
      collection: 'pages',
      where: { display: { equals: true } },
      limit: 0,
      depth: 0,
      sort: 'sortOrder',
    }),
    payload.find({
      collection: 'news',
      where: { active: { equals: true } },
      limit: 20,
      depth: 0,
      sort: '-createdAt',
    }),
  ])

  const parts: string[] = []

  parts.push(
    `# REFERENCE CONTENT FROM THE WEBSITE\n\nThe following content is drawn directly from the site's pages and current news items. Use it to answer general questions about Dr. Rasmussen, how the site works, permissions/copyright, upcoming tours, and announcements. Do not invent information beyond what is written here.\n`,
  )

  if (pagesResult.docs.length > 0) {
    parts.push('\n## PAGES\n')
    for (const page of pagesResult.docs) {
      const d = page as unknown as Record<string, unknown>
      const text = extractTextFromDoc(d)
      if (!text) continue
      parts.push(`\n### ${page.title} (link: /pages/${page.slug})\n`)
      parts.push(text.slice(0, 8000)) // cap per page to keep things reasonable
      parts.push('\n')
    }
  }

  if (newsResult.docs.length > 0) {
    parts.push('\n## CURRENT NEWS ITEMS (active)\n')
    for (const news of newsResult.docs) {
      const d = news as unknown as Record<string, unknown>
      const text = extractTextFromDoc(d)
      parts.push(`\n### ${news.title} (link: /news/${news.id})\n`)
      if (text) parts.push(text.slice(0, 4000))
      parts.push('\n')
    }
  }

  return parts.join('')
}

// Module-level cache so we only build the reference content once per function instance.
// Anthropic's prompt cache handles server-side caching; this avoids rebuilding the
// string on every request within a warm function.
let cachedReferenceContent: string | null = null
let cachedReferenceContentAt = 0
const REFERENCE_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

async function getReferenceContent(): Promise<string> {
  const now = Date.now()
  if (cachedReferenceContent && now - cachedReferenceContentAt < REFERENCE_CACHE_TTL_MS) {
    return cachedReferenceContent
  }
  cachedReferenceContent = await buildReferenceContent()
  cachedReferenceContentAt = now
  return cachedReferenceContent
}

type Msg = { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  const reqStart = Date.now()
  try {
    const { messages } = (await req.json()) as { messages: Msg[] }
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    // Log the latest user query (ignore conversation history)
    const latestUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || ''

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    // Build the system prompt with static instructions + reference content
    const referenceContent = await getReferenceContent()

    // Structure the system prompt as two blocks:
    // - Block 1: static instructions + reference content, marked cacheable
    //   (this is the large, stable content that benefits most from prompt caching)
    // - The cache hit lookup includes everything up to and including the
    //   cache_control block, so one marker at the end covers everything.
    const systemBlocks: Anthropic.Messages.TextBlockParam[] = [
      {
        type: 'text',
        text: SYSTEM_PROMPT_STATIC + '\n\n' + referenceContent,
        cache_control: { type: 'ephemeral' },
      },
    ]

    // Convert chat history to Anthropic message format
    const apiMessages: Anthropic.Messages.MessageParam[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    // Tool use loop — allow Claude to make multiple tool calls before final answer
    let iterations = 0
    const maxIterations = 5

    while (iterations < maxIterations) {
      iterations++

      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        system: systemBlocks,
        tools,
        messages: apiMessages,
      })

      // Check if Claude wants to use tools
      if (response.stop_reason === 'tool_use') {
        // Add assistant message with tool use blocks
        apiMessages.push({ role: 'assistant', content: response.content })

        // Execute each tool and collect results
        const toolResults: Anthropic.Messages.ToolResultBlockParam[] = []
        for (const block of response.content) {
          if (block.type === 'tool_use') {
            const result = await runTool(block.name, block.input as ToolInput)
            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: result,
            })
          }
        }

        apiMessages.push({ role: 'user', content: toolResults })
        continue
      }

      // Final response — extract text
      const text = response.content
        .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')

      // Log the search asynchronously
      if (latestUserMessage) {
        void logSearch({
          query: latestUserMessage,
          searchType: 'ai',
          durationMs: Date.now() - reqStart,
        })
      }

      return NextResponse.json({
        reply: text,
        usage: response.usage,
      })
    }

    return NextResponse.json(
      { error: 'max iterations reached' },
      { status: 500 },
    )
  } catch (err) {
    console.error('AI search error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'unknown error' },
      { status: 500 },
    )
  }
}
