import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60
export const runtime = 'nodejs'

const MODEL = 'claude-haiku-4-5-20251001'

const SYSTEM_PROMPT = `You are a helpful search assistant for HolyLandPhotos.org, a scholarly photo archive of biblical and archaeological sites.

The site contains:
- 7,000+ high-resolution photographs by Dr. Carl Rasmussen
- 700+ sections covering biblical sites, archaeological locations, and artifacts across Israel, Jordan, Turkey, Greece, Egypt, Italy, and other Mediterranean/Near Eastern regions
- Photos are organized hierarchically by country → region → site → sub-site

Your job is to help users find photos and sites they're looking for. When a user asks about a place:

1. Use the search tools to find matching sections and photos
2. Consider alternate spellings (e.g., Hierapolis/Ierapolis, Caesarea Maritima vs Caesarea Philippi, Haran/Harran, Herodion/Herodium)
3. If a name is ambiguous (e.g., "Caesarea" could be multiple places), ask a follow-up question
4. When presenting results, format links as markdown:
   - Sections: [Section Title](/browse/SLUG)
   - Photos: [Photo Title](/photos/IMAGE_ID)
5. Add brief scholarly context when helpful (e.g., "associated with Paul's 3rd missionary journey")
6. Be concise — users want to find things, not read essays
7. If you find nothing relevant, suggest related searches or ask for clarification

The public site base URL is https://holy-land-photos.vercel.app — but always use relative links (/browse/..., /photos/...) so they work in the chat UI.`

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

type Msg = { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: Msg[] }
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
        system: SYSTEM_PROMPT,
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
