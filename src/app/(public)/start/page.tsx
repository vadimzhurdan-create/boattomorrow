import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Anchor, Navigation, Users, Flag, Check, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { LeadForm } from '@/components/leads/LeadForm'

export const metadata: Metadata = {
  title: 'Start Here — Your First Sailing Adventure | BOATTOMORROW',
  description: 'New to sailing? Everything you need to know about yacht charters, sailing destinations, costs, and how to plan your first trip on the water.',
}

const myths = [
  { myth: 'You need a license to charter a yacht', reality: 'In many popular destinations you can hire a skipper, no license needed. Some regions like BVI and Greece are beginner-friendly.' },
  { myth: 'Sailing holidays cost a fortune', reality: 'Split between a group, a week on a yacht can cost less per person than a resort hotel. Budget options start from around 50 euros per day.' },
  { myth: 'You need sailing experience', reality: 'Skippered charters mean a professional handles the boat. You just enjoy the sea, swimming, and the islands.' },
  { myth: 'Yachts are uncomfortable', reality: 'Modern charter yachts have private cabins, hot showers, full kitchens, and more space than most hotel rooms.' },
  { myth: 'It is dangerous for children', reality: 'Family charters are extremely popular. The pace is relaxed, stops are frequent, and safety gear is standard.' },
]

const charterTypes = [
  { name: 'Bareboat', desc: 'You are the captain. Rent the yacht, plan your route, and sail independently. You need a license or enough experience.', Icon: Anchor, recommended: false },
  { name: 'Skippered', desc: 'A professional skipper sails the boat for you. You choose where to go and what to do. Perfect for beginners.', Icon: Navigation, recommended: true },
  { name: 'Crewed', desc: 'A full crew including a cook and hostess. Luxury experience where everything is taken care of.', Icon: Users, recommended: false },
  { name: 'Flotilla', desc: 'Sail in a group of boats with a lead crew. Social, guided, and ideal for first-timers who want company.', Icon: Flag, recommended: false },
]

const boatComparison = {
  monohull: ['Classic sailing feel', 'Better upwind performance', 'Lower charter price', 'Marina berths easier to find', 'More authentic experience'],
  catamaran: ['More deck space and stability', 'Less heeling (tilting)', 'Shallow draft for anchorages', 'Better for families with children', 'Spacious saloon and cabins'],
}

const steps = [
  { title: 'Pick your crew', desc: 'Decide who is coming. A group of 4-8 is ideal for splitting costs and filling cabins.' },
  { title: 'Choose a destination', desc: 'Croatia, Greece, and BVI are the most popular for first-timers. Consider season and distance.' },
  { title: 'Decide on a charter type', desc: 'Bareboat if you can sail, skippered if you cannot. Crewed for luxury, flotilla for a social trip.' },
  { title: 'Set your dates and budget', desc: 'High season is July-August. Shoulder months (May-June, September) offer better prices and fewer crowds.' },
  { title: 'Book early', desc: 'Popular boats in peak season sell out 6-12 months ahead. Early booking means better selection and prices.' },
  { title: 'Plan provisions', desc: 'Most charters offer provisioning services. Stock up before departure or arrange delivery to the marina.' },
  { title: 'Arrive and enjoy', desc: 'Check-in is usually Saturday afternoon. Your skipper or the base team will walk you through the boat.' },
]

const costs = [
  {
    tier: 'Budget',
    price: '50-80',
    unit: '/day per person',
    includes: ['Older monohull yacht', 'Self-catering', 'Anchoring (free bays)', 'Shared cabin'],
    highlight: false,
  },
  {
    tier: 'Mid-Range',
    price: '100-180',
    unit: '/day per person',
    includes: ['Modern yacht or catamaran', 'Professional skipper', 'Mix of marinas and anchorages', 'Private cabin'],
    highlight: true,
  },
  {
    tier: 'Comfortable',
    price: '250-500',
    unit: '/day per person',
    includes: ['Premium catamaran', 'Full crew with cook', 'Marina berths every night', 'All meals included'],
    highlight: false,
  },
]

export default async function StartHerePage() {
  const destinations = await prisma.destination.findMany({
    where: {
      slug: { in: ['croatia-dalmatian-coast', 'greece-cyclades', 'british-virgin-islands'] },
    },
    select: {
      slug: true,
      canonicalName: true,
      description: true,
      heroImage: true,
      priceRange: true,
    },
  })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://boattomorrow.com'

  // Find a general supplier for the lead form (or use first active)
  const supplier = await prisma.supplier.findFirst({
    where: { status: 'active' },
    select: { id: true },
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Start Here — Your First Sailing Adventure',
    description: 'Everything beginners need to know about yacht charters, sailing destinations, and planning a trip.',
    url: `${siteUrl}/start`,
    isPartOf: { '@type': 'WebSite', name: 'BOATTOMORROW', url: siteUrl },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Hero — sea-horizon gradient */}
      <section
        className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, #1B3A5C 0%, #2E6B8A 40%, #4A9BB5 70%, #E8DCC8 90%, #FAFAF8 100%)',
        }}
      >
        <div className="relative text-center px-6 max-w-3xl mx-auto py-20 md:py-32">
          <p className="text-sm uppercase tracking-[0.15em] font-semibold text-white/60 mb-6">
            your journey starts here
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6 text-white">
            Your Boat Tomorrow
          </h1>
          <p className="text-xl md:text-2xl text-white/80 font-light max-w-xl mx-auto mb-10">
            Everything a first-timer needs to know about sailing holidays,
            from choosing a destination to stepping aboard.
          </p>
          <a
            href="#guide"
            className="inline-block bg-[#E8500A] text-white px-8 py-3.5 rounded-lg text-base font-semibold tracking-wide hover:bg-[#D04500] transition-colors shadow-sm hover:shadow-md"
          >
            Read the guide &darr;
          </a>
        </div>
      </section>

      {/* 2. Narrative */}
      <section id="guide" className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-sm uppercase tracking-[0.15em] font-semibold text-[#E8500A] mb-8">
            why the sea?
          </p>
          <div className="space-y-6 text-lg text-muted leading-relaxed font-light">
            <p>
              There is a moment, usually on the second morning, when you realize the sea has changed something.
              The phone has not buzzed in hours. The horizon is unbroken. The only schedule is the wind.
            </p>
            <p>
              A sailing holiday is not a cruise ship with a thousand strangers. It is a small boat, your people,
              and a coastline that unfolds one cove at a time. You wake up anchored in a bay you have never heard of,
              swim before breakfast, and sail to a village for lunch.
            </p>
            <p>
              This guide exists because we believe the sea should not feel exclusive. It is closer than you think,
              simpler than you imagine, and more affordable than the brochures suggest. Here is everything you need
              to plan your first trip.
            </p>
          </div>
        </div>
      </section>

      {/* 3. MythBuster */}
      <section className="py-20 md:py-28 bg-bg-alt">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-sm uppercase tracking-[0.15em] font-semibold text-[#E8500A] mb-3">
            myth vs reality
          </p>
          <h2 className="font-display text-3xl md:text-[2.5rem] font-light mb-4">
            Five things people get wrong about sailing
          </h2>
          <div className="w-12 h-[3px] bg-[#E8500A] mt-3 mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myths.map((m, i) => (
              <div
                key={i}
                className="bg-bg border-l-4 border-l-green-500 rounded-lg p-6 md:p-8 section-animate transition-all duration-300 hover:shadow-md"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-lg font-bold">✕</span>
                  <p className="text-base text-muted-light line-through decoration-red-300 pt-1">
                    &ldquo;{m.myth}&rdquo;
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-lg font-bold">&#10003;</span>
                  <p className="text-base text-text font-medium leading-relaxed pt-1">
                    {m.reality}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HowItWorks — Charter types + Monohull vs Catamaran */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-sm uppercase tracking-[0.15em] font-semibold text-[#E8500A] mb-3">
            how it works
          </p>
          <h2 className="font-display text-3xl md:text-[2.5rem] font-light mb-4">
            Four types of charter
          </h2>
          <div className="w-12 h-[3px] bg-[#E8500A] mt-3 mb-12" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {charterTypes.map((ct) => (
              <div
                key={ct.name}
                className={`relative rounded-lg p-6 md:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-[2px] ${
                  ct.recommended
                    ? 'border-2 border-[#E8500A] bg-orange-50'
                    : 'border border-border bg-bg hover:border-l-4 hover:border-l-[#E8500A]'
                }`}
              >
                {ct.recommended && (
                  <span className="absolute -top-3 right-4 bg-[#E8500A] text-white text-xs font-medium px-3 py-1 rounded-full">
                    ★ Best for first-timers
                  </span>
                )}
                <ct.Icon className="w-10 h-10 text-[#E8500A] mb-4" />
                <h3 className="text-xl font-bold text-text mb-2">{ct.name}</h3>
                <p className="text-base text-muted leading-relaxed">{ct.desc}</p>
              </div>
            ))}
          </div>

          <h3 className="font-display text-2xl md:text-3xl font-light mb-3">Monohull vs Catamaran</h3>
          <p className="text-base text-muted-light mb-8">
            Two types of boat, two different experiences. Here&apos;s how they compare.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-bg-alt rounded-lg p-6 md:p-8">
              {/* Monohull silhouette */}
              <div className="mb-5 flex justify-center">
                <svg width="100" height="60" viewBox="0 0 100 60" className="text-text">
                  <path d="M15 40 Q25 20, 50 15 Q75 20, 85 40 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <line x1="50" y1="15" x2="50" y2="5" stroke="currentColor" strokeWidth="2"/>
                  <path d="M50 8 Q65 15, 50 30" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10 42 Q50 50, 90 42" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h4 className="text-sm uppercase tracking-[0.15em] font-semibold text-[#E8500A] mb-4">Monohull</h4>
              <ul className="space-y-3">
                {boatComparison.monohull.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base text-text">
                    <Check className="w-5 h-5 text-[#E8500A] mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-border rounded-lg p-6 md:p-8">
              {/* Catamaran silhouette */}
              <div className="mb-5 flex justify-center">
                <svg width="100" height="60" viewBox="0 0 100 60" className="text-text">
                  <path d="M10 40 Q20 25, 35 40" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <path d="M65 40 Q75 25, 90 40" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <line x1="25" y1="30" x2="75" y2="30" stroke="currentColor" strokeWidth="2"/>
                  <line x1="50" y1="30" x2="50" y2="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M50 12 Q65 18, 50 28" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5 42 Q25 48, 40 42" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M60 42 Q75 48, 95 42" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <h4 className="text-sm uppercase tracking-[0.15em] font-semibold text-[#E8500A] mb-4">Catamaran</h4>
              <ul className="space-y-3">
                {boatComparison.catamaran.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base text-text">
                    <Check className="w-5 h-5 text-[#E8500A] mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WhereToGo — Destination cards */}
      <section className="py-20 md:py-28 bg-bg-alt">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-sm uppercase tracking-[0.15em] font-semibold text-[#E8500A] mb-3">
            where to go
          </p>
          <h2 className="font-display text-3xl md:text-[2.5rem] font-light mb-4">
            Best destinations for first-timers
          </h2>
          <div className="w-12 h-[3px] bg-[#E8500A] mt-3 mb-12" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {destinations.map((dest) => {
              const priceRange = dest.priceRange as { low?: number; currency?: string } | null
              return (
                <Link
                  key={dest.slug}
                  href={`/destinations/${dest.slug}`}
                  className="group block overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-[2px]"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {dest.heroImage ? (
                      <Image
                        src={dest.heroImage}
                        alt={dest.canonicalName}
                        width={400}
                        height={533}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(180deg, #1B3A5C 0%, #2E6B8A 50%, #4A9BB5 100%)',
                        }}
                      >
                        <span className="text-white/20 text-7xl font-display font-light">
                          {dest.canonicalName.charAt(0)}
                        </span>
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.7))' }} />
                    {/* Text on photo */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="font-display text-2xl font-bold text-white group-hover:text-white/90 transition-colors">
                        {dest.canonicalName}
                      </h3>
                      {dest.description && (
                        <p className="text-sm text-white/70 mt-1 line-clamp-2">{dest.description}</p>
                      )}
                      {priceRange?.low && (
                        <p className="text-sm font-semibold text-white mt-2">
                          from {priceRange.currency || 'EUR'} {priceRange.low}/week
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. StepByStep — Timeline with large numbers */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-sm uppercase tracking-[0.15em] font-semibold text-[#E8500A] mb-3">
            step by step
          </p>
          <h2 className="font-display text-3xl md:text-[2.5rem] font-light mb-4">
            Seven steps to your first charter
          </h2>
          <div className="w-12 h-[3px] bg-[#E8500A] mt-3 mb-12" />

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[28px] top-4 bottom-4 w-[2px] bg-[#E8500A]/20" />

            <div className="space-y-10">
              {steps.map((step, i) => (
                <div key={i} className="relative flex gap-6 section-animate" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center relative z-10">
                    <span className="font-display text-4xl md:text-5xl font-bold text-[#E8500A] opacity-80">
                      {i + 1}
                    </span>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-semibold text-text">{step.title}</h3>
                    <p className="text-base text-muted mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. CostComparison — with highlighted mid-range */}
      <section className="py-20 md:py-28 bg-bg-alt">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-sm uppercase tracking-[0.15em] font-semibold text-[#E8500A] mb-3">
            what it costs
          </p>
          <h2 className="font-display text-3xl md:text-[2.5rem] font-light mb-4">
            Realistic budget breakdown
          </h2>
          <div className="w-12 h-[3px] bg-[#E8500A] mt-3 mb-12" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {costs.map((c) => (
              <div
                key={c.tier}
                className={`relative rounded-lg p-6 md:p-8 transition-all duration-300 ${
                  c.highlight
                    ? 'border-2 border-[#E8500A] bg-white shadow-lg md:scale-105 z-10'
                    : 'border border-border bg-white hover:shadow-md'
                }`}
              >
                {c.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E8500A] text-white text-xs font-semibold uppercase tracking-wider px-4 py-1 rounded-full whitespace-nowrap">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-text">{c.tier}</h3>
                <div className="mt-3 mb-5">
                  <span className="font-display text-4xl font-bold text-text">&euro;{c.price}</span>
                  <span className="text-sm text-muted-light ml-1">{c.unit}</span>
                </div>
                <ul className="space-y-3">
                  {c.includes.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-base text-muted">
                      <Check className="w-5 h-5 text-[#E8500A] mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 p-4 bg-orange-50 rounded-lg">
            <span className="text-sm text-muted">
              For comparison: a 4&#9733; hotel in Croatia averages <strong>&euro;200-300</strong>/night for two
            </span>
          </div>
        </div>
      </section>

      {/* 8. ClosingCTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-sm uppercase tracking-[0.15em] font-semibold text-[#E8500A] mb-3">
            ready?
          </p>
          <h2 className="font-display text-3xl md:text-[2.5rem] font-light mb-6">
            The best time to start was yesterday
          </h2>
          <div className="w-12 h-[3px] bg-[#E8500A] mt-3 mb-8" />
          <div className="space-y-4 text-lg text-muted leading-relaxed font-light mb-10">
            <p>
              You do not need to know everything. You do not need the perfect boat or the perfect week.
              You just need to decide that this is the year.
            </p>
            <p>
              Tell us where you want to go, how many people are coming, and when. We will connect you
              with verified charter companies who will handle the rest.
            </p>
          </div>

          {supplier && (
            <LeadForm
              supplierId={supplier.id}
              intent="general"
              sourceType="search"
            />
          )}
        </div>
      </section>
    </>
  )
}
