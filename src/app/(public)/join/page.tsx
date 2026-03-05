import { Metadata } from 'next'
import Link from 'next/link'
import {
  Ship,
  GraduationCap,
  Wrench,
  MessageSquare,
  PenTool,
  TrendingUp,
  BarChart3,
  Share2,
  BadgeCheck,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Join BOATTOMORROW — Free leads for charter companies & sailing schools',
  description:
    'Reach sailors actively planning their next charter. BOATTOMORROW generates qualified leads through expert content. Your knowledge becomes articles that rank in Google and AI search.',
}

const steps = [
  {
    icon: MessageSquare,
    title: 'Share your expertise',
    description: '15-minute quiz about your fleet, routes, and region. We ask — you answer.',
  },
  {
    icon: PenTool,
    title: 'We create the content',
    description: 'AI generates magazine-quality articles from your answers, optimised for Google and AI search.',
  },
  {
    icon: TrendingUp,
    title: 'You receive leads',
    description: 'Readers inquire directly through your articles. Manage leads in your dashboard.',
  },
]

const benefits = [
  { icon: PenTool, text: 'Free professional content marketing' },
  { icon: TrendingUp, text: 'Leads attributed to your articles' },
  { icon: BarChart3, text: 'Full analytics: views, conversions, sources' },
  { icon: Share2, text: 'Distribution kit: ready-made social media posts' },
  { icon: BadgeCheck, text: 'Verified Supplier badge' },
]

const audiences = [
  {
    icon: Ship,
    title: 'Charter Companies',
    description: 'Reach sailors searching for their next bareboat or skippered charter.',
  },
  {
    icon: GraduationCap,
    title: 'Sailing Schools',
    description: 'Connect with beginners and intermediates looking for courses and certifications.',
  },
  {
    icon: Wrench,
    title: 'Yacht Builders & Distributors',
    description: 'Showcase your models to buyers researching their next boat purchase.',
  },
]

export default function JoinPage() {
  return (
    <div className="bg-bg">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #1B3A5C 0%, #2E6B8A 40%, #4A9BB5 70%, #E8DCC8 90%, #FAFAF8 100%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight">
            Reach sailors actively planning their next charter
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            BOATTOMORROW generates qualified leads through expert content.
            Your knowledge becomes articles that rank in Google and AI search.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 mt-10 bg-[#E8500A] text-white text-lg font-semibold px-8 py-4 rounded-lg hover:bg-[#D04500] shadow-lg hover:shadow-xl transition-all"
          >
            Create your free account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="font-display text-3xl md:text-4xl font-light text-center text-[#111] mb-4">
          How it works
        </h2>
        <p className="text-center text-[#6B6B6B] mb-14 max-w-xl mx-auto">
          From your expertise to qualified leads in three simple steps.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.title} className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#FFF8F5] border-2 border-[#E8500A]/20 flex items-center justify-center mx-auto mb-5">
                <step.icon className="w-7 h-7 text-[#E8500A]" />
              </div>
              <div className="text-xs font-semibold text-[#E8500A] uppercase tracking-widest mb-2">
                Step {i + 1}
              </div>
              <h3 className="text-xl font-bold text-[#111] mb-2">{step.title}</h3>
              <p className="text-[#4A4A4A] leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why join */}
      <section className="bg-[#F5F5F3] py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl md:text-4xl font-light text-center text-[#111] mb-12">
            Why join BOATTOMORROW
          </h2>
          <div className="space-y-5">
            {benefits.map((b) => (
              <div
                key={b.text}
                className="flex items-center gap-4 bg-white rounded-xl p-5 shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-[#FFF8F5] flex items-center justify-center flex-shrink-0">
                  <b.icon className="w-5 h-5 text-[#E8500A]" />
                </div>
                <span className="text-[#111] font-medium">{b.text}</span>
                <CheckCircle className="w-5 h-5 text-green-500 ml-auto flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="font-display text-3xl md:text-4xl font-light text-center text-[#111] mb-4">
          Who it&apos;s for
        </h2>
        <p className="text-center text-[#6B6B6B] mb-14 max-w-xl mx-auto">
          BOATTOMORROW connects three types of marine businesses with qualified leads.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {audiences.map((a) => (
            <div
              key={a.title}
              className="border border-[#E0E0E0] rounded-xl p-8 text-center hover:shadow-md hover:border-[#E8500A]/30 transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-[#111] text-white flex items-center justify-center mx-auto mb-5">
                <a.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#111] mb-2">{a.title}</h3>
              <p className="text-sm text-[#4A4A4A] leading-relaxed">{a.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#111] py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-light text-white mb-4">
            Ready to grow your business?
          </h2>
          <p className="text-lg text-white/60 mb-10">
            Join for free. Start publishing in minutes.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#E8500A] text-white text-lg font-semibold px-8 py-4 rounded-lg hover:bg-[#D04500] shadow-lg hover:shadow-xl transition-all"
          >
            Get started — it&apos;s free <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-6 text-sm text-white/40">
            Already have an account?{' '}
            <Link href="/login" className="text-white/60 hover:text-white underline transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
