'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { ArrowRight, Compass } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password. Please try again.')
      } else {
        router.push('/supplier/dashboard')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-1">
          <span className="text-3xl font-bold text-[#111]">BOAT</span>
          <span className="text-3xl font-bold text-[#E8500A]">TOMORROW</span>
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-[#111]">Supplier Login</h1>
        <p className="mt-2 text-[#6B6B6B]">Manage your articles, leads, and company profile</p>
      </div>

      <Card>
        <CardContent className="py-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-3 text-center text-sm">
        <p className="text-[#6B6B6B]">
          Don&apos;t have an account?{' '}
          <Link href="/join" className="text-[#E8500A] font-medium hover:text-[#D04500] transition-colors inline-flex items-center gap-1">
            Join as supplier <ArrowRight className="w-3 h-3" />
          </Link>
        </p>
        <p className="text-[#999]">
          <Link href="/start" className="hover:text-[#6B6B6B] transition-colors inline-flex items-center gap-1">
            <Compass className="w-3 h-3" /> Looking for sailing info? Visit our Start Here guide
          </Link>
        </p>
      </div>
    </div>
  )
}
