'use client'

import { useSession } from 'next-auth/react'
import { QuizChat } from '@/components/quiz/QuizChat'
import { Skeleton } from '@/components/ui/Skeleton'

export default function SupplierQuizPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
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

  if (!session?.user) {
    return null
  }

  const supplierType = (session.user as any).supplierType || 'charter'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Article</h1>
        <p className="text-gray-600 mt-1">
          Answer a few questions and our AI will generate a professional article for you.
        </p>
      </div>

      <QuizChat
        supplierType={supplierType}
        quizType="article"
      />
    </div>
  )
}
