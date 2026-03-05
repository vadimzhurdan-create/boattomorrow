import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAnthropic } from '@/lib/anthropic'

const TRANSLATE_MODEL = 'claude-sonnet-4-6'

/**
 * Detect whether text is in English. Uses a heuristic: sample the first 500 chars,
 * count common English stop words. If fewer than 3 found, it's probably not English.
 */
function isLikelyEnglish(text: string): boolean {
  // Strip HTML tags for analysis
  const plain = text.replace(/<[^>]+>/g, ' ').toLowerCase()
  const sample = plain.substring(0, 1500)
  const englishWords = ['the', 'and', 'for', 'you', 'with', 'that', 'this', 'from', 'are', 'was', 'have', 'will', 'your', 'can', 'not', 'but', 'they', 'which', 'their', 'about', 'more', 'when', 'what', 'been', 'would']
  let matches = 0
  for (const w of englishWords) {
    const regex = new RegExp(`\\b${w}\\b`, 'g')
    if (regex.test(sample)) matches++
  }
  return matches >= 4
}

/**
 * Translate content + title + excerpt to English using Claude Sonnet.
 * Preserves all HTML/Markdown formatting.
 */
async function translateToEnglish(fields: { title?: string; content?: string; excerpt?: string }): Promise<{ title?: string; content?: string; excerpt?: string }> {
  const anthropic = getAnthropic()

  const parts: string[] = []
  if (fields.title) parts.push(`<title>${fields.title}</title>`)
  if (fields.excerpt) parts.push(`<excerpt>${fields.excerpt}</excerpt>`)
  if (fields.content) parts.push(`<content>${fields.content}</content>`)

  const response = await anthropic.messages.create({
    model: TRANSLATE_MODEL,
    max_tokens: 8192,
    system: `You are a professional translator. Translate the provided text to English.

RULES:
- Preserve ALL HTML tags, markdown formatting, links, and structure exactly as-is
- Only translate the human-readable text content
- Keep proper nouns (place names, brand names) as-is
- Use British English for nautical terms (harbour, metre, centreboard)
- Keep the same tone and style as the original
- Return ONLY the translated text wrapped in the same XML tags — no commentary`,
    messages: [{
      role: 'user',
      content: `Translate the following to English. Return each section in its original XML tag:\n\n${parts.join('\n\n')}`,
    }],
  })

  const output = response.content[0].type === 'text' ? response.content[0].text : ''

  const result: { title?: string; content?: string; excerpt?: string } = {}

  const titleMatch = output.match(/<title>([\s\S]*?)<\/title>/)
  if (titleMatch) result.title = titleMatch[1].trim()

  const excerptMatch = output.match(/<excerpt>([\s\S]*?)<\/excerpt>/)
  if (excerptMatch) result.excerpt = excerptMatch[1].trim()

  const contentMatch = output.match(/<content>([\s\S]*?)<\/content>/)
  if (contentMatch) result.content = contentMatch[1].trim()

  return result
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            tagline: true,
            logoUrl: true,
          },
        },
      },
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Public can only see published articles
    const session = await getServerSession(authOptions)
    if (article.status !== 'published') {
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        )
      }
      // Only the owning supplier or superadmin can see unpublished
      if (
        session.user.role !== 'superadmin' &&
        session.user.supplierId !== article.supplierId
      ) {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json({ data: article })
  } catch (error) {
    console.error('Article fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params

    const article = await prisma.article.findUnique({
      where: { id },
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Only the owning supplier or superadmin can update
    if (
      session.user.role !== 'superadmin' &&
      session.user.supplierId !== article.supplierId
    ) {
      return NextResponse.json(
        { error: 'Not authorized to update this article' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      content,
      excerpt,
      metaTitle,
      metaDescription,
      tags,
      coverImageUrl,
      imageUrls,
      difficulty,
    } = body

    let finalTitle = title
    let finalContent = content
    let finalExcerpt = excerpt

    // Auto-translate non-English content to English
    const textToCheck = content || title || excerpt || ''
    if (textToCheck && !isLikelyEnglish(textToCheck)) {
      try {
        const translated = await translateToEnglish({
          title: title || undefined,
          content: content || undefined,
          excerpt: excerpt || undefined,
        })
        if (translated.title) finalTitle = translated.title
        if (translated.content) finalContent = translated.content
        if (translated.excerpt) finalExcerpt = translated.excerpt
        console.log(`Auto-translated article ${id} to English`)
      } catch (err) {
        console.error('Translation failed, saving original:', err)
        // Continue with original content if translation fails
      }
    }

    const updateData: Record<string, any> = {}
    if (finalTitle !== undefined) updateData.title = finalTitle
    if (finalContent !== undefined) {
      updateData.content = finalContent
      // Recalculate reading time on content change
      updateData.readingTime = Math.ceil(finalContent.split(/\s+/).length / 200)
    }
    if (finalExcerpt !== undefined) updateData.excerpt = finalExcerpt
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription
    if (tags !== undefined) updateData.tags = tags
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl
    if (imageUrls !== undefined) updateData.imageUrls = imageUrls
    if (difficulty !== undefined) updateData.difficulty = difficulty

    const updated = await prisma.article.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ data: updated, translated: textToCheck ? !isLikelyEnglish(textToCheck) : false })
  } catch (error) {
    console.error('Article update error:', error)
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params

    const article = await prisma.article.findUnique({
      where: { id },
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Only the owning supplier or superadmin can delete
    if (
      session.user.role !== 'superadmin' &&
      session.user.supplierId !== article.supplierId
    ) {
      return NextResponse.json(
        { error: 'Not authorized to delete this article' },
        { status: 403 }
      )
    }

    // Can only delete draft or rejected articles
    if (article.status !== 'draft' && article.status !== 'rejected') {
      return NextResponse.json(
        { error: 'Only draft or rejected articles can be deleted' },
        { status: 400 }
      )
    }

    await prisma.article.delete({
      where: { id },
    })

    return NextResponse.json({ data: { message: 'Article deleted successfully' } })
  } catch (error) {
    console.error('Article delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}
