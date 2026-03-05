import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getQuizConfig, getArticleQuizType } from '@/lib/quiz-configs'
import { QuizType } from '@prisma/client'

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
    const { sessionId, quizType, stepIndex, answer, imageUrls } = body

    if (stepIndex === undefined || answer === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: stepIndex, answer' },
        { status: 400 }
      )
    }

    let quizSession

    if (sessionId) {
      // Continue existing session
      quizSession = await prisma.quizSession.findUnique({
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
    } else {
      // Create new session
      if (!quizType) {
        return NextResponse.json(
          { error: 'quizType is required when starting a new session' },
          { status: 400 }
        )
      }

      const resolvedQuizType = quizType === 'article'
        ? getArticleQuizType(session.user.supplierType)
        : quizType

      quizSession = await prisma.quizSession.create({
        data: {
          supplierId: session.user.supplierId,
          quizType: resolvedQuizType as QuizType,
          answers: {},
          messages: [],
          currentStep: 0,
        },
      })
    }

    // Get quiz config to validate
    const config = getQuizConfig(quizSession.quizType)
    if (!config) {
      return NextResponse.json(
        { error: 'Invalid quiz configuration' },
        { status: 400 }
      )
    }

    const totalSteps = config.steps.length
    const step = config.steps[stepIndex]

    if (!step) {
      return NextResponse.json(
        { error: 'Invalid step index' },
        { status: 400 }
      )
    }

    // Save answer
    const currentAnswers = (quizSession.answers as Record<string, any>) || {}
    currentAnswers[step.id] = answer

    const nextStep = stepIndex + 1

    // Build update data
    const updateData: any = {
      answers: currentAnswers,
      currentStep: nextStep,
    }

    // If imageUrls provided (upload step), persist them to session
    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      const existingUrls = quizSession.imageUrls || []
      updateData.imageUrls = [...existingUrls, ...imageUrls]
    }

    quizSession = await prisma.quizSession.update({
      where: { id: quizSession.id },
      data: updateData,
    })

    return NextResponse.json({
      data: {
        sessionId: quizSession.id,
        currentStep: nextStep,
        totalSteps,
      },
    })
  } catch (error) {
    console.error('Quiz message error:', error)
    return NextResponse.json(
      { error: 'Failed to process quiz step' },
      { status: 500 }
    )
  }
}
