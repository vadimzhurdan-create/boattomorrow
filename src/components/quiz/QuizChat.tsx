'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import toast from 'react-hot-toast'

interface QuizStep {
  id: string
  question: string
  type: 'choice' | 'text' | 'upload'
  options?: string[]
  placeholder?: string
  required?: boolean
}

interface Message {
  role: 'assistant' | 'user'
  content: string
  type?: 'question' | 'answer'
  imageUrls?: string[]
}

interface QuizChatProps {
  supplierType: string
  quizType: 'article' | 'profile'
  sessionId?: string
  initialStep?: number
  initialAnswers?: Record<string, string>
}

export function QuizChat({
  supplierType,
  quizType,
  sessionId: initialSessionId,
  initialStep = 0,
  initialAnswers = {},
}: QuizChatProps) {
  const router = useRouter()
  const [steps, setSteps] = useState<QuizStep[]>([])
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [sessionId, setSessionId] = useState(initialSessionId || '')
  const [messages, setMessages] = useState<Message[]>([])
  const [textAnswer, setTextAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [generatedArticleId, setGeneratedArticleId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const stepsLoadedRef = useRef(false)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load quiz config on mount
  const loadSteps = useCallback(async () => {
    if (stepsLoadedRef.current) return
    stepsLoadedRef.current = true

    // Import quiz configs dynamically
    const configModule = await import('@/lib/quiz-configs')
    const quizKey = quizType === 'article'
      ? configModule.getArticleQuizType(supplierType)
      : quizType
    const config = configModule.getQuizConfig(quizKey)

    if (!config) {
      toast.error('Quiz configuration not found')
      return
    }

    setSteps(config.steps)

    // If resuming, rebuild messages from initial answers
    if (initialStep > 0 && Object.keys(initialAnswers).length > 0) {
      const rebuiltMessages: Message[] = []
      for (let i = 0; i < initialStep && i < config.steps.length; i++) {
        const step = config.steps[i]
        rebuiltMessages.push({
          role: 'assistant',
          content: step.question,
          type: 'question',
        })
        if (initialAnswers[step.id]) {
          rebuiltMessages.push({
            role: 'user',
            content: initialAnswers[step.id],
            type: 'answer',
          })
        }
      }
      // Add the current step question if not complete
      if (initialStep < config.steps.length) {
        rebuiltMessages.push({
          role: 'assistant',
          content: config.steps[initialStep].question,
          type: 'question',
        })
      } else {
        setIsComplete(true)
      }
      setMessages(rebuiltMessages)
    } else {
      // Start fresh - show first question
      if (config.steps.length > 0) {
        setMessages([
          {
            role: 'assistant',
            content: config.steps[0].question,
            type: 'question',
          },
        ])
      }
    }
  }, [supplierType, quizType, initialStep, initialAnswers])

  useEffect(() => {
    loadSteps()
  }, [loadSteps])

  const currentStepConfig = steps[currentStep]
  const totalSteps = steps.length
  const progressPercent = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0

  async function submitAnswer(answer: string) {
    if (isSubmitting) return
    setIsSubmitting(true)

    // Add user's answer to messages
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: answer, type: 'answer' },
    ])

    try {
      const res = await fetch('/api/quiz/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId || undefined,
          quizType: !sessionId ? (quizType === 'article' ? 'article' : 'profile') : undefined,
          stepIndex: currentStep,
          answer,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to save answer')
        // Remove the user message on error
        setMessages((prev) => prev.slice(0, -1))
        return
      }

      if (!sessionId) {
        setSessionId(data.data.sessionId)
      }

      const nextStep = data.data.currentStep
      setCurrentStep(nextStep)

      if (nextStep >= totalSteps) {
        // Quiz complete
        setIsComplete(true)
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: quizType === 'article'
              ? 'All questions answered! Click "Generate Article" below to create your AI-powered article draft.'
              : 'All questions answered! Click "Generate Profile" below to create your company profile.',
            type: 'question',
          },
        ])
      } else {
        // Show next question
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: steps[nextStep].question,
            type: 'question',
          },
        ])
      }

      setTextAnswer('')
    } catch {
      toast.error('Failed to process your answer')
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleChoiceSelect(option: string) {
    submitAnswer(option)
  }

  function handleTextSubmit() {
    if (!textAnswer.trim()) {
      if (currentStepConfig?.required) {
        toast.error('This field is required')
        return
      }
    }
    submitAnswer(textAnswer.trim())
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const newUrls: string[] = []

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        if (sessionId) {
          formData.append('sessionId', sessionId)
        }

        const res = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          toast.error(`Failed to upload ${file.name}`)
          continue
        }

        const data = await res.json()
        if (data.url) {
          newUrls.push(data.url)
        }
      }

      if (newUrls.length > 0) {
        setUploadedUrls((prev) => [...prev, ...newUrls])
        toast.success(`${newUrls.length} file(s) uploaded`)
      }
    } catch {
      toast.error('Upload failed')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  function handleUploadSubmit() {
    if (uploadedUrls.length === 0 && currentStepConfig?.required) {
      toast.error('Please upload at least one photo')
      return
    }
    submitAnswer(uploadedUrls.length > 0 ? `Uploaded ${uploadedUrls.length} photo(s)` : 'No photos uploaded')
  }

  async function handleGenerate() {
    if (!sessionId) return
    setIsGenerating(true)

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to generate content')
        return
      }

      if (quizType === 'article' && data.data?.id) {
        setGeneratedArticleId(data.data.id)
        toast.success('Article draft generated!')
        router.push(`/supplier/articles/${data.data.id}/edit`)
      } else {
        toast.success('Profile updated!')
        router.push('/supplier/profile')
      }
    } catch {
      toast.error('Generation failed. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>
            Step {Math.min(currentStep + 1, totalSteps)} of {totalSteps}
          </span>
          <span>{progressPercent}% complete</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 min-h-[300px]">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {!isComplete && currentStepConfig && (
        <div className="border-t border-gray-200 pt-4">
          {currentStepConfig.type === 'choice' && currentStepConfig.options && (
            <div className="space-y-2">
              {currentStepConfig.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleChoiceSelect(option)}
                  disabled={isSubmitting}
                  className="block w-full text-left px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-colors text-sm font-medium text-gray-700 disabled:opacity-50"
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {currentStepConfig.type === 'text' && (
            <div className="flex gap-3">
              <div className="flex-1">
                <Textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder={currentStepConfig.placeholder || 'Type your answer...'}
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleTextSubmit()
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleTextSubmit}
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="self-end"
              >
                Send
              </Button>
            </div>
          )}

          {currentStepConfig.type === 'upload' && (
            <div className="space-y-3">
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                />
                <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600">
                  {isUploading ? 'Uploading...' : 'Click to upload photos'}
                </p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB each</p>
              </div>

              {uploadedUrls.length > 0 && (
                <p className="text-sm text-green-600">
                  {uploadedUrls.length} photo(s) uploaded
                </p>
              )}

              <Button
                onClick={handleUploadSubmit}
                isLoading={isSubmitting || isUploading}
                disabled={isSubmitting || isUploading}
                className="w-full"
              >
                {uploadedUrls.length > 0 ? 'Continue' : 'Skip Photos'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Generate button */}
      {isComplete && !generatedArticleId && (
        <div className="border-t border-gray-200 pt-4">
          <Button
            onClick={handleGenerate}
            isLoading={isGenerating}
            disabled={isGenerating}
            size="lg"
            className="w-full"
          >
            {isGenerating
              ? 'Generating with AI...'
              : quizType === 'article'
                ? 'Generate Article'
                : 'Generate Profile'}
          </Button>
          {isGenerating && (
            <p className="text-sm text-gray-500 text-center mt-3">
              This may take 30-60 seconds. Please wait...
            </p>
          )}
        </div>
      )}
    </div>
  )
}
