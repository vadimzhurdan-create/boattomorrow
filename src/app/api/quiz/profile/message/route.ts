import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getQuizConfig } from '@/lib/quiz-configs'
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
    const { sessionId, stepIndex, answer } = body

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
      // Create new profile quiz session
      quizSession = await prisma.quizSession.create({
        data: {
          supplierId: session.user.supplierId,
          quizType: 'profile' as QuizType,
          answers: {},
          messages: [],
          currentStep: 0,
        },
      })
    }

    const config = getQuizConfig('profile')
    if (!config) {
      return NextResponse.json(
        { error: 'Profile quiz configuration not found' },
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

    quizSession = await prisma.quizSession.update({
      where: { id: quizSession.id },
      data: {
        answers: currentAnswers,
        currentStep: nextStep,
      },
    })

    return NextResponse.json({
      data: {
        sessionId: quizSession.id,
        currentStep: nextStep,
        totalSteps,
      },
    })
  } catch (error) {
    console.error('Profile quiz message error:', error)
    return NextResponse.json(
      { error: 'Failed to process profile quiz step' },
      { status: 500 }
    )
  }
}
