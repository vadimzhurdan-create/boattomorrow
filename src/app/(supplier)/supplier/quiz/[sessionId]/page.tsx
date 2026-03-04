'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { QuizChat } from '@/components/quiz/QuizChat'
import { Skeleton } from '@/components/ui/Skeleton'

interface QuizSessionData {
  id: string
  quizType: string
  currentStep: number
  answers: Record<string, string>
  imageUrls: string[]
  status: string
}

export default function ContinueQuizPage() {
  const { data: session, status: sessionStatus } = useSession()
  const params = useParams()
  const sessionId = params.sessionId as string
  const [quizSession, setQuizSession] = useState<QuizSessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(`/api/quiz/session/${sessionId}`)
        if (!res.ok) {
          setError('Quiz session not found')
          return
        }
        const data = await res.json()
        setQuizSession(data.data)
      } catch {
        setError('Failed to load quiz session')
      } finally {
        setIsLoading(false)
      }
    }

    if (sessionId) {
      loadSession()
    }
  }, [sessionId])

  if (sessionStatus === 'loading' || isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-72 mb-8" />
        <Skeleton className="h-2 w-full mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="h-16 w-2/3 ml-auto" />
          <Skeleton className="h-16 w-3/4" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!session?.user || !quizSession) {
    return null
  }

  const supplierType = (session.user as any).supplierType || 'charter'
  const isArticle = quizSession.quizType.startsWith('article_')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isArticle ? 'Continue Article Quiz' : 'Continue Profile Quiz'}
        </h1>
        <p className="text-gray-600 mt-1">
          Resume where you left off.
        </p>
      </div>

      <QuizChat
        supplierType={supplierType}
        quizType={isArticle ? 'article' : 'profile'}
        sessionId={quizSession.id}
        initialStep={quizSession.currentStep}
        initialAnswers={quizSession.answers}
      />
    </div>
  )
}
