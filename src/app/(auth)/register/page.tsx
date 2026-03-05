'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Ship, GraduationCap, Wrench, ArrowRight } from 'lucide-react'

const supplierTypes = [
  {
    value: 'charter',
    label: 'Charter Company',
    description: 'Yacht charter services, boat rentals, and sailing experiences',
    icon: Ship,
  },
  {
    value: 'manufacturer',
    label: 'Yacht Builder / Distributor',
    description: 'Boat builders, yacht manufacturers, and marine equipment brands',
    icon: Wrench,
  },
  {
    value: 'school',
    label: 'Sailing School',
    description: 'Sailing academies, training centres, and certification programmes',
    icon: GraduationCap,
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [supplierType, setSupplierType] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function handleTypeSelect(type: string) {
    setSupplierType(type)
    setStep(2)
  }

  function validateForm(): string | null {
    if (!name.trim()) return 'Company name is required'
    if (!email.trim()) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address'
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (password !== confirmPassword) return 'Passwords do not match'
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          type: supplierType,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.')
        return
      }

      // Auto sign-in after successful registration
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        router.push('/login')
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
    <div className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-1">
          <span className="text-3xl font-bold text-[#111]">BOAT</span>
          <span className="text-3xl font-bold text-[#E8500A]">TOMORROW</span>
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-[#111]">Create your supplier account</h1>
        <p className="mt-2 text-[#6B6B6B]">Free to join. Start publishing in minutes.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step >= 1 ? 'bg-[#E8500A] text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            1
          </div>
          <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-[#E8500A]' : 'bg-gray-200'}`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step >= 2 ? 'bg-[#E8500A] text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            2
          </div>
        </div>
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold text-[#111] text-center mb-6">
            What type of supplier are you?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {supplierTypes.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.value}
                  onClick={() => handleTypeSelect(type.value)}
                  className="bg-white rounded-xl border-2 border-[#E0E0E0] p-6 text-left hover:border-[#E8500A] hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#E8500A]/30 focus:ring-offset-2"
                >
                  <div className="w-12 h-12 rounded-full bg-[#FFF8F5] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#E8500A]" />
                  </div>
                  <h3 className="font-semibold text-[#111] mb-1">{type.label}</h3>
                  <p className="text-sm text-[#6B6B6B]">{type.description}</p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#111]">Company Details</h2>
              <button
                onClick={() => setStep(1)}
                className="text-sm text-[#E8500A] hover:text-[#D04500] font-medium transition-colors"
              >
                Change type
              </button>
            </div>

            <div className="mb-6 px-3 py-2 bg-[#FFF8F5] border border-[#E8500A]/20 rounded-lg text-sm text-[#111]">
              Registering as: <strong>{supplierTypes.find((t) => t.value === supplierType)?.label}</strong>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Company Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your company name"
                required
              />

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
                placeholder="Minimum 8 characters"
                required
                autoComplete="new-password"
              />

              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                autoComplete="new-password"
              />

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
                size="lg"
              >
                Create Account
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <p className="mt-6 text-center text-sm text-[#6B6B6B]">
        Already have an account?{' '}
        <Link href="/login" className="text-[#E8500A] font-medium hover:text-[#D04500] transition-colors inline-flex items-center gap-1">
          Sign in <ArrowRight className="w-3 h-3" />
        </Link>
      </p>
    </div>
  )
}
