import { Metadata } from 'next'
import Link from 'next/link'
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
  { name: 'Bareboat', desc: 'You are the captain. Rent the yacht, plan your route, and sail independently. You need a license or enough experience.', icon: 'anchor' },
  { name: 'Skippered', desc: 'A professional skipper sails the boat for you. You choose where to go and what to do. Perfect for beginners.', icon: 'user' },
  { name: 'Crewed', desc: 'A full crew including a cook and hostess. Luxury experience where everything is taken care of.', icon: 'users' },
  { name: 'Flotilla', desc: 'Sail in a group of boats with a lead crew. Social, guided, and ideal for first-timers who want company.', icon: 'flag' },
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

      {/* 1. Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-[#0a2e4a] via-[#0d3b5e] to-[#1a5276] text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0id2F2ZXMiIHg9IjAiIHk9IjAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNMCAxMDAgQzUwIDgwIDEwMCAxMjAgMjAwIDEwMCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjd2F2ZXMpIi8+PC9zdmc+')] opacity-30" />
        <div className="relative text-center px-6 max-w-3xl mx-auto">
          <p className="text-sm uppercase tracking-[0.3em] text-white/60 mb-6">
            <span className="text-[#E8500A]">/</span> your journey starts here
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight mb-6">
            Your Boat Tomorrow
          </h1>
          <p className="text-lg md:text-xl text-white/80 font-light max-w-xl mx-auto mb-10">
            Everything a first-timer needs to know about sailing holidays,
            from choosing a destination to stepping aboard.
          </p>
          <a
            href="#guide"
            className="inline-block bg-[#E8500A] text-white px-8 py-3.5 text-sm font-medium tracking-wide hover:opacity-85 transition-opacity"
          >
            Read the guide &darr;
          </a>
        </div>
      </section>

      {/* 2. Narrative */}
      <section id="guide" className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-xs uppercase tracking-widest text-muted mb-8">
            <span className="text-accent">/</span> why the sea?
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
      <section className="py-16 md:py-20 bg-bg-alt">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs uppercase tracking-widest text-muted mb-3">
            <span className="text-accent">/</span> myth vs reality
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-light mb-12">
            Five things people get wrong about sailing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myths.map((m, i) => (
              <div
                key={i}
                className="bg-bg border border-border p-6 section-animate"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-red-500 text-lg font-bold">X</span>
                  <span className="text-accent text-lg font-bold">&rarr;</span>
                  <span className="text-green-600 text-lg font-bold">&#10003;</span>
                </div>
                <p className="text-sm font-medium text-text mb-2 line-through decoration-red-300">
                  &ldquo;{m.myth}&rdquo;
                </p>
                <p className="text-sm text-muted leading-relaxed">
                  {m.reality}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HowItWorks — Charter types + Monohull vs Catamaran */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs uppercase tracking-widest text-muted mb-3">
            <span className="text-accent">/</span> how it works
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-light mb-12">
            Four types of charter
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {charterTypes.map((ct) => (
              <div key={ct.name} className="border border-border p-6">
                <h3 className="text-base font-medium text-text mb-2">{ct.name}</h3>
                <p className="text-sm text-muted leading-relaxed">{ct.desc}</p>
              </div>
            ))}
          </div>

          <h3 className="font-display text-2xl font-light mb-8">Monohull vs Catamaran</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-border p-6">
              <h4 className="text-sm uppercase tracking-widest text-muted mb-4">Monohull</h4>
              <ul className="space-y-2">
                {boatComparison.monohull.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-text">
                    <span className="text-accent mt-0.5">&#8226;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-border p-6">
              <h4 className="text-sm uppercase tracking-widest text-muted mb-4">Catamaran</h4>
              <ul className="space-y-2">
                {boatComparison.catamaran.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-text">
                    <span className="text-accent mt-0.5">&#8226;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WhereToGo — Destination cards */}
      <section className="py-16 md:py-20 bg-bg-alt">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs uppercase tracking-widest text-muted mb-3">
            <span className="text-accent">/</span> where to go
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-light mb-12">
            Best destinations for first-timers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {destinations.map((dest) => {
              const priceRange = dest.priceRange as { low?: number; currency?: string } | null
              return (
                <Link
                  key={dest.slug}
                  href={`/destinations/${dest.slug}`}
                  className="group block bg-bg border border-border overflow-hidden hover:border-accent/30 transition-colors"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#0a2e4a] to-[#1a5276] flex items-center justify-center">
                    <span className="text-white/30 text-6xl font-display font-light">
                      {dest.canonicalName.charAt(0)}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-medium text-text group-hover:text-accent transition-colors">
                      {dest.canonicalName}
                    </h3>
                    {dest.description && (
                      <p className="text-sm text-muted mt-1 line-clamp-2">{dest.description}</p>
                    )}
                    {priceRange?.low && (
                      <p className="text-sm font-medium text-accent mt-3">
                        from {priceRange.currency || 'EUR'} {priceRange.low}/week
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. StepByStep — Timeline */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-xs uppercase tracking-widest text-muted mb-3">
            <span className="text-accent">/</span> step by step
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-light mb-12">
            Seven steps to your first charter
          </h2>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

            <div className="space-y-8">
              {steps.map((step, i) => (
                <div key={i} className="relative flex gap-6 section-animate" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center text-sm font-medium relative z-10">
                    {i + 1}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="text-base font-medium text-text">{step.title}</h3>
                    <p className="text-sm text-muted mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. CostComparison */}
      <section className="py-16 md:py-20 bg-bg-alt">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs uppercase tracking-widest text-muted mb-3">
            <span className="text-accent">/</span> what it costs
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-light mb-12">
            Realistic budget breakdown
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {costs.map((c) => (
              <div
                key={c.tier}
                className={`border p-6 ${c.highlight ? 'border-accent bg-bg ring-1 ring-accent/20' : 'border-border bg-bg'}`}
              >
                {c.highlight && (
                  <span className="text-[10px] uppercase tracking-widest text-accent font-medium mb-2 block">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-medium text-text">{c.tier}</h3>
                <div className="mt-2 mb-4">
                  <span className="font-display text-3xl font-light text-text">&euro;{c.price}</span>
                  <span className="text-xs text-muted ml-1">{c.unit}</span>
                </div>
                <ul className="space-y-2">
                  {c.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted">
                      <span className="text-accent mt-0.5">&#10003;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted text-center mt-8">
            For comparison, a 4-star hotel in Dubrovnik averages &euro;180-250 per night for two people.
          </p>
        </div>
      </section>

      {/* 8. ClosingCTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-xs uppercase tracking-widest text-muted mb-3">
            <span className="text-accent">/</span> ready?
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-light mb-6">
            The best time to start was yesterday
          </h2>
          <div className="space-y-4 text-lg text-muted leading-relaxed font-light mb-8">
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
