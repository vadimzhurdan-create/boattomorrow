import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAnthropic } from '@/lib/anthropic'
import { getQuizConfig } from '@/lib/quiz-configs'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    const quizSession = await prisma.quizSession.findUnique({
      where: { id: sessionId },
    })

    if (!quizSession) {
      return NextResponse.json(
        { error: 'Quiz session not found' },
        { status: 404 }
      )
    }

    if (quizSession.supplierId !== session.user.supplierId) {
      return NextResponse.json(
        { error: 'Not authorized to access this quiz session' },
        { status: 403 }
      )
    }

    if (quizSession.status === 'completed') {
      return NextResponse.json(
        { error: 'Quiz session is already completed' },
        { status: 400 }
      )
    }

    const config = getQuizConfig('profile')
    if (!config) {
      return NextResponse.json(
        { error: 'Profile quiz configuration not found' },
        { status: 400 }
      )
    }

    const answers = quizSession.answers as Record<string, string>
    const imageUrls = quizSession.imageUrls || []
    const generatePrompt = config.generatePrompt(answers, imageUrls)

    // Call Anthropic Claude API
    const anthropic = getAnthropic()
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: config.systemPrompt,
      messages: [{ role: 'user', content: generatePrompt }],
    })

    // Parse the text response
    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'Failed to generate profile content from AI' },
        { status: 500 }
      )
    }

    let generatedData: { tagline: string; description: string }
    try {
      let jsonText = textContent.text.trim()
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim()
      }
      generatedData = JSON.parse(jsonText)
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON' },
        { status: 500 }
      )
    }

    // Update supplier with generated profile
    const updatedSupplier = await prisma.supplier.update({
      where: { id: session.user.supplierId },
      data: {
        tagline: generatedData.tagline,
        description: generatedData.description,
        profileStatus: 'published',
        profileQuizSessionId: quizSession.id,
      },
    })

    // Update quiz session
    await prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        generatedDraft: textContent.text,
        completedAt: new Date(),
      },
    })

    const { passwordHash: _, ...supplierData } = updatedSupplier

    return NextResponse.json({ data: supplierData })
  } catch (error) {
    console.error('Profile generate error:', error)
    return NextResponse.json(
      { error: 'Failed to generate profile' },
      { status: 500 }
    )
  }
}
