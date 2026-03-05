import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // ── Create editorial supplier ──────────────────────────────────
  const editorialPassword = await bcrypt.hash('editorial2026!', 12)

  const editorial = await prisma.supplier.upsert({
    where: { email: 'editorial@boattomorrow.com' },
    update: {},
    create: {
      name: 'BOATTOMORROW Editorial',
      slug: 'boattomorrow-editorial',
      email: 'editorial@boattomorrow.com',
      passwordHash: editorialPassword,
      type: 'charter',
      role: 'supplier',
      status: 'active',
      tagline: 'Ideas and guides for life on water',
      description: '## BOATTOMORROW Editorial\n\nThe in-house editorial team behind BOATTOMORROW. We research, travel, and write about the best sailing destinations, boats, and everything maritime.',
      regions: ['Mediterranean', 'Caribbean', 'Southeast Asia', 'Northern Europe', 'Pacific Islands', 'Indian Ocean'],
      profileStatus: 'published',
      logoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    },
  })

  console.log(`Editorial supplier created: ${editorial.id}`)

  // ── Helper: stagger dates ─────────────────────────────────────
  let dayOffset = 0
  function publishDate(): Date {
    const d = new Date('2026-02-01')
    d.setDate(d.getDate() + dayOffset)
    dayOffset += 2
    return d
  }

  // ══════════════════════════════════════════════════════════════
  //  DESTINATIONS  (3 articles)
  // ══════════════════════════════════════════════════════════════

  const destinations = [
    {
      supplierId: editorial.id,
      supplierType: 'charter' as const,
      title: 'The Aeolian Islands: Sicily\'s Volcanic Sailing Paradise',
      slug: 'aeolian-islands-sicily-sailing-paradise',
      coverImageUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1400&q=80',
      category: 'destination' as const,
      region: 'Mediterranean',
      tags: ['italy', 'sicily', 'aeolian', 'volcano', 'mediterranean', 'islands'],
      status: 'published' as const,
      publishedAt: publishDate(),
      metaTitle: 'Aeolian Islands Sailing Guide — Sicily\'s Volcanic Archipelago',
      metaDescription: 'Discover the Aeolian Islands by sailboat. Volcanic landscapes, turquoise coves, and some of the best anchorages in the Mediterranean.',
      excerpt: 'Seven volcanic islands off Sicily\'s north coast offer some of the most dramatic sailing in the Mediterranean — from Stromboli\'s nightly eruptions to Salina\'s emerald vineyards.',
      content: `The Aeolian archipelago rises from the Tyrrhenian Sea like a string of jewels scattered by an ancient god. Seven islands, each with its own personality, connected by deep blue water and steady summer breezes. For sailors, this is one of the Mediterranean's last genuinely uncrowded cruising grounds.

## Why the Aeolians stand apart

Unlike the heavily charted routes of Croatia or Greece, the Aeolians reward sailors who prefer solitude to marina nightlife. Anchorages here are still wild — you drop the hook in volcanic coves where the water changes colour from cobalt to jade within a single boat length. The holding is generally good in dark volcanic sand, though you'll want to check for patches of rock.

## Getting there

Most charters start from Portorosa or Capo d'Orlando on Sicily's north coast. Both have full-service marinas with provisioning. The crossing to Vulcano, the nearest island, takes roughly two hours in moderate conditions.

## Island by island

### Vulcano

Your first landfall. The sulphurous mud baths at Porto di Levante are a rite of passage — undignified but oddly relaxing. The anchorage in Gelso Bay on the south side is far quieter and offers excellent swimming.

### Lipari

The commercial hub of the group. Lipari town has the best provisioning, a handful of good restaurants, and the archipelago's only real supermarket. Anchor in Marina Corta for convenience, or tuck behind Punta della Castagna for more space.

### Salina

The greenest island, terraced with vineyards producing Malvasia dessert wine. Pollara Bay — the filming location for Il Postino — is a stunning lunch stop, though the afternoon swell can make it uncomfortable by evening.

### Panarea

Small, car-free, and fashionable. The anchorage off Zimmari beach fills up in July and August. Arrive early or consider the mooring field. The Bronze Age village at Capo Milazzese is worth the steep walk.

### Stromboli

The highlight for most crews. Anchor off Ficogrande (weather permitting) and time your arrival for dusk. Every twenty minutes or so, the volcano throws incandescent rock into the darkening sky. Watching eruptions from the cockpit, glass in hand, is one of sailing's great experiences.

### Filicudi & Alicudi

The outer islands reward those willing to make the longer crossing. Filicudi's Grotta del Bue Marino is one of the finest sea caves in the Mediterranean. Alicudi has no roads — only donkey paths — and feels genuinely remote.

## When to go

June and September are ideal. July and August bring crowds to Panarea and higher temperatures. The prevailing wind is northwest, typically 10–18 knots in summer, with thermal breezes adding variety close to the islands.

## Practical notes

Fuel is available in Lipari and Vulcano only. Water is scarce on the outer islands, so top up your tanks when you can. Most anchorages are free, though Panarea has introduced a mooring fee in recent years. Night sailing between the islands is straightforward — Stromboli's glow is visible for miles and makes an unmistakable landmark.

The Aeolians won't stay quiet forever. Visit now, while the anchorages still feel like discoveries rather than destinations.`,
    },
    {
      supplierId: editorial.id,
      supplierType: 'charter' as const,
      title: 'Sailing Gothenburg\'s Archipelago: A Nordic Summer Guide',
      slug: 'gothenburg-archipelago-nordic-sailing',
      coverImageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=80',
      category: 'destination' as const,
      region: 'Northern Europe',
      tags: ['sweden', 'gothenburg', 'scandinavia', 'archipelago', 'nordic'],
      status: 'published' as const,
      publishedAt: publishDate(),
      metaTitle: 'Gothenburg Archipelago Sailing Guide — Swedish West Coast',
      metaDescription: 'A complete guide to sailing Sweden\'s Gothenburg archipelago. Granite islands, wild swimming, and the famous Swedish right to roam.',
      excerpt: 'Sweden\'s west coast archipelago is one of Europe\'s best-kept sailing secrets — granite skerries, wild swimming, and Allemansrätten (the right to roam) make this a cruiser\'s dream.',
      content: `There is a particular quality of light on Sweden's west coast in high summer — long and golden, stretching past ten in the evening — that makes everything look like a painting. Add granite skerries polished smooth by ten thousand years of ice, water clean enough to drink, and a culture that considers nature a birthright, and you have one of the finest cruising grounds in northern Europe.

## The landscape

The Gothenburg archipelago consists of roughly twenty inhabited islands and countless uninhabited skerries spread along the coast north and south of the city. The terrain is low — granite domes rarely rising more than thirty metres — covered in heather, wild roses, and wind-sculpted pines. Navigation is straightforward, with excellent charts and well-maintained buoyage.

## Allemansrätten — the sailor's advantage

Sweden's Right to Roam means you can anchor almost anywhere, step ashore, swim, pick berries, and camp for a night — as long as you leave no trace and stay out of sight of private dwellings. For cruising sailors, this is transformative. No mooring fees at natural anchorages, no restricted zones, just an entire coast to explore.

## A week's itinerary

### Day 1–2: Southern islands — Styrsö & Donsö

Start from Gothenburg's Långedrag marina. The southern islands are connected by ferries but feel instantly rural. Styrsö has a charming village with a bakery and fish shop. Anchor in Tången Vik on Donsö's east side — the holding in sand is excellent.

### Day 3–4: Vrångö & outer skerries

Vrångö is the southernmost inhabited island and feels genuinely remote. Hike across the island to the ocean-facing west side for dramatic cliff formations. The anchorage in Vrångö Hamn is sheltered from the prevailing westerlies.

### Day 5: Marstrand

Head north to Marstrand, the historic sailing capital of Sweden. The fortress of Carlsten dominates the island. Moor in the guest harbour or anchor in the lee of Koön. Marstrand hosts some of Scandinavia's most prestigious regattas.

### Day 6–7: Käringön & Gullholmen

Continue north into Bohuslän. Käringön and Gullholmen are car-free fishing villages with brightly painted wooden houses, excellent seafood restaurants, and a pace of life that makes you reconsider everything.

## What to eat

Swedish archipelago cuisine revolves around seafood. Shrimp sandwiches on fresh bread, smoked mackerel, pickled herring in dill, and crayfish in season (August onwards). Most island harbours have a "fiskebod" — a fishmonger selling the day's catch.

## Season and weather

Late June through August is prime time. Expect daytime temperatures around 20–25°C and water temperatures of 18–22°C. Winds are typically light to moderate from the west or southwest. The weather can change quickly, so carry foul-weather gear even in July.

## Getting a boat

Several charter companies operate from Gothenburg. The most popular boats are 30–40 foot cruisers suited to the shallow, rock-strewn waters. A depth sounder is essential, and many experienced local sailors navigate by chart plotter rather than compass.

The Swedish archipelago doesn't shout for attention. It doesn't need to. Come once, and the quiet granite, the clean water, and the endless summer light will pull you back.`,
    },
    {
      supplierId: editorial.id,
      supplierType: 'charter' as const,
      title: 'Langkawi and the Andaman Sea: Southeast Asia by Sail',
      slug: 'langkawi-andaman-sea-southeast-asia-sailing',
      coverImageUrl: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=1400&q=80',
      category: 'destination' as const,
      region: 'Southeast Asia',
      tags: ['malaysia', 'langkawi', 'thailand', 'andaman', 'tropical', 'asia'],
      status: 'published' as const,
      publishedAt: publishDate(),
      metaTitle: 'Langkawi & Andaman Sea Sailing Guide — Southeast Asia',
      metaDescription: 'Sailing Langkawi and the Andaman Sea. Tropical islands, limestone karsts, and year-round warmth in Southeast Asia\'s best cruising ground.',
      excerpt: 'Limestone karsts, mangrove-lined bays, and 30°C water year-round make the Langkawi archipelago and surrounding Andaman Sea one of the world\'s most underrated cruising grounds.',
      content: `Southeast Asia doesn't feature on many European or American sailors' radar, and those who do discover it tend to keep quiet. Langkawi — a duty-free island off Malaysia's northwest coast — sits at the heart of a cruising area that stretches from Thailand's Butang Islands in the north to Penang in the south, with hundreds of islands in between.

## Why Langkawi

Langkawi is Southeast Asia's most practical sailing base. It has a modern marina (Telaga Harbour), duty-free fuel and provisions, excellent repair facilities, and international flights. From here, you can reach Thailand's Tarutao and Butang island groups in a single day's sail.

## The cruising area

### Langkawi Archipelago

The archipelago itself contains 99 islands (104 at low tide, Malaysians will tell you proudly). The standout anchorages are Pulau Dayang Bunting — a freshwater lake hidden inside a limestone island — and the mangrove channels along the north coast, where eagles circle above the canopy.

### Tarutao & Butang Islands (Thailand)

A short sail north brings you to Thailand's Tarutao National Marine Park. Koh Lipe has developed rapidly but the surrounding islands — Koh Rawi, Koh Adang, Koh Rok Nok — remain largely undeveloped. Clear-out and clear-in procedures between Malaysia and Thailand are straightforward.

### East coast exploration

The seldom-visited east coast of Langkawi offers protected anchorages behind the island of Tuba, where you can anchor alone and watch the sun set behind Gunung Raya, Langkawi's highest peak.

## Monsoon seasons

The northeast monsoon (November–March) brings the best sailing weather: clear skies, moderate northeast winds, and calm seas. The southwest monsoon (May–September) can bring squalls and uncomfortable swells, though many boats stay through it. April and October are transition months — generally fine with occasional rain.

## Life aboard

Provisioning is excellent and astonishingly cheap. Langkawi's duty-free status means alcohol, chocolate, and imported goods cost a fraction of their price elsewhere in Southeast Asia. Fresh fruit, fish, and vegetables are available at daily markets. Eating ashore at local hawker stalls, you can feed a crew of four for the price of a single marina coffee in the Mediterranean.

## Navigation notes

Tidal ranges are modest (1.5–2m) but currents can be strong between islands, particularly in the channels around the Butang group. Coral reefs are widespread — a coral-rated anchor and careful visual piloting are essential. Most areas are well charted on modern plotters, though some Thai islands still benefit from the old-school "eyeball and depth sounder" approach.

## What you need to know

Malaysian and Thai waters require different boat registrations. Most charter companies handle the paperwork. Bring comprehensive sun protection — the equatorial sun is relentless. And dive gear, if you have it: the reefs around Koh Rok and Koh Ha are world-class.

The Andaman Sea won't feature in glossy charter brochures anytime soon. That's part of its appeal. But for sailors willing to look beyond the Mediterranean, it offers an entirely different kind of sailing — warmer, wilder, and far more affordable.`,
    },
  ]

  // ══════════════════════════════════════════════════════════════
  //  BOATS  (2 articles)
  // ══════════════════════════════════════════════════════════════

  const boats = [
    {
      supplierId: editorial.id,
      supplierType: 'manufacturer' as const,
      title: 'The Modern Cruising Catamaran: Why Multihulls Took Over',
      slug: 'modern-cruising-catamaran-multihulls',
      coverImageUrl: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1400&q=80',
      category: 'boat' as const,
      region: null,
      tags: ['catamaran', 'multihull', 'cruising', 'yacht design', 'comparison'],
      status: 'published' as const,
      publishedAt: publishDate(),
      metaTitle: 'Cruising Catamarans Explained — Why Multihulls Dominate',
      metaDescription: 'Why cruising catamarans have overtaken monohulls in charter and long-distance sailing. Design evolution, practical advantages, and trade-offs.',
      excerpt: 'Twenty years ago, catamarans were a novelty. Today they account for over half of all new charter boats and a growing share of private bluewater cruisers. Here\'s why the shift happened.',
      content: `Walk through any charter marina in the Mediterranean or Caribbean today and you'll see the change. Where monohulls once dominated, catamarans now fill berth after berth — wide, stable, and increasingly sophisticated. The shift has been rapid, decisive, and not without controversy.

## A brief history

Multihulls have ancient origins — Polynesian voyaging canoes sailed the Pacific for centuries — but the modern cruising catamaran is a relatively recent invention. In the 1980s and '90s, French builders like Fountaine Pajot and Lagoon began producing series catamarans designed for comfort rather than racing. Early models were dismissed by traditionalists as floating platforms with poor windward performance and questionable build quality.

They had a point. But the builders listened, and the designs improved dramatically.

## What changed

### Interior volume

A 40-foot catamaran offers roughly the same living space as a 50-foot monohull. Two separate hulls mean two private cabins with en-suite heads, a spacious salon, and a galley that wouldn't look out of place in a small apartment. For charter crews and cruising families, this is the single biggest advantage.

### Stability

Catamarans don't heel. For many people — including those who love sailing but hate the constant 20-degree lean of a monohull — this alone is reason enough to switch. Cooking, sleeping, and moving around the boat become dramatically easier when the floor stays flat.

### Shallow draft

Most cruising catamarans draw between 0.9 and 1.4 metres. This opens up entire coastlines that deeper monohulls simply can't access — the Bahamas, parts of Southeast Asia, the Great Barrier Reef, and countless shallow anchorages worldwide.

### Speed on passage

A well-sailed catamaran is typically 15–25% faster than an equivalent monohull, particularly on reaching courses. On long passages, this translates to shorter watches and earlier arrivals.

## The trade-offs

No honest assessment of catamarans ignores their downsides.

**Windward performance** has improved significantly but remains the catamaran's weakest point. In short, steep seas on a hard beat, a good monohull will be more comfortable.

**Marina costs** are higher — catamarans take up roughly 1.5 times the berth width, and most marinas charge accordingly.

**Purchase price** is typically 30–50% more than an equivalent monohull, both new and on the secondhand market.

**Mooring and anchoring** can be trickier in tight spaces. Catamarans have wider turning circles and catch more wind at anchor.

## The builders to watch

The market is dominated by French yards: Lagoon (owned by Groupe Beneteau) leads by volume, followed by Fountaine Pajot, Excess (also Beneteau Group), and Catana/Bali. South African builder Leopard Catamarans offers competitive pricing, while Outremer focuses on performance-oriented models for serious offshore sailing.

New entrants from Turkey and China are beginning to appear at the lower end of the market, though long-term build quality remains unproven.

## Who should consider a catamaran

If you value space, comfort, and stability over traditional sailing feel, a catamaran is likely the right choice. For charter holidays with non-sailing partners and children, they're almost always better. For liveaboard cruising in warm climates with shallow anchorages, they're hard to beat.

If you live for the feeling of a well-balanced monohull driving to windward in 20 knots of breeze, nothing else will ever feel right.

The catamaran revolution isn't a fad — it's a fundamental shift in how people use sailboats. Whether that's progress or loss depends entirely on what you ask the sea to give you.`,
    },
    {
      supplierId: editorial.id,
      supplierType: 'manufacturer' as const,
      title: 'Choosing Your First Cruising Sailboat: 30 to 40 Feet',
      slug: 'choosing-first-cruising-sailboat-30-40-feet',
      coverImageUrl: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1400&q=80',
      category: 'boat' as const,
      region: null,
      tags: ['buying guide', 'cruising', 'first boat', 'sailboat', 'monohull'],
      status: 'published' as const,
      publishedAt: publishDate(),
      metaTitle: 'First Cruising Sailboat Guide — 30 to 40 Feet',
      metaDescription: 'How to choose your first cruising sailboat between 30 and 40 feet. Key considerations, popular models, and what to inspect before buying.',
      excerpt: 'The 30 to 40 foot range is the sweet spot for first-time cruising boat buyers — large enough for comfort, small enough to handle shorthanded. Here\'s how to navigate the market.',
      content: `Buying your first cruising sailboat is one of those decisions that can paralyse you with options. The internet is full of opinions, forums are full of arguments, and every sailor you meet has a different definition of the "perfect boat." Here's an attempt to cut through the noise.

## Why 30 to 40 feet

Under 30 feet, boats become cramped for extended cruising. Over 40 feet, they become expensive to maintain, harder to handle shorthanded, and more costly to berth. The 30–40 foot range hits the sweet spot: enough space for a couple or small family, manageable running costs, and small enough that one person can handle the boat in an emergency.

## The big questions

### New or used?

Used, almost certainly, for a first boat. New production boats in this range start around €150,000 for a basic 32-footer and climb steeply from there. The secondhand market offers boats that were €200,000+ new for a fraction of the cost, often well-maintained and fully equipped.

### Production or custom?

Production boats — built in series by manufacturers like Beneteau, Jeanneau, Bavaria, and Hanse — offer the best value. They're widely available secondhand, parts are easy to source, and their quirks are well-documented in owner forums. Custom or semi-custom boats offer higher quality but at significantly higher prices.

### What to look for

**Hull construction:** Fibreglass (GRP) is standard and low-maintenance. Avoid boats with known osmosis issues unless the price reflects this and the hull has been treated.

**Keel type:** Full keels offer directional stability and protection in groundings but are slower. Fin keels with spade rudders are faster and more responsive but more vulnerable. For serious offshore work, consider an encapsulated fin or modified full keel.

**Rig type:** Sloop rigs are simplest and most versatile. Cutter rigs (with an inner forestay) add flexibility for heavy weather. Ketches and yawls are increasingly rare but have devoted fans.

**Engine:** Marine diesels are remarkably long-lived if maintained. Check the hours, inspect for oil leaks, and look at the raw water system. Budget for replacing impellers, belts, and filters immediately after purchase.

**Deck layout:** Can you reach everything from the cockpit? Are the winches positioned sensibly? Is the anchor arrangement practical? These details matter more than interior joinery when you're sailing shorthanded at night.

## Proven models worth investigating

In the 30–35 foot range, look at the **Beneteau Oceanis 331**, **Jeanneau Sun Odyssey 34.2**, **Moody 336**, and **Hallberg-Rassy 31**. All are well-built, widely available, and hold their value.

In the 35–40 foot range, the **Beneteau Oceanis 373**, **Jeanneau Sun Odyssey 39i**, **Bavaria 38**, and **Dehler 38** offer excellent value. For those with larger budgets, the **Hallberg-Rassy 37** and **Najad 373** are outstanding cruisers.

## The survey

Never buy without a professional marine survey. Period. A good surveyor will find things you missed, give you negotiating leverage, and identify safety issues. Budget £500–£1,500 depending on boat size and location. Insist on a haul-out survey — seeing the hull, keel bolts, and running gear out of water is essential.

## A word on condition versus cosmetics

Many first-time buyers are seduced by interior woodwork and lose interest in boats with tired cushions or faded teak. This is backwards. Cosmetics are easy and cheap to fix. Structural issues, rig problems, and engine failures are not. Always buy the boat with the best bones, not the prettiest face.

## The right boat for you

There is no single "best" cruising boat. The best boat is the one that fits your budget, your crew, your sailing area, and your ambitions — and that you can afford to maintain properly. Start with realistic expectations, get out on the water, and upgrade when you know what you actually need rather than what the forums tell you to want.`,
    },
  ]

  // ══════════════════════════════════════════════════════════════
  //  LEARNING  (2 articles)
  // ══════════════════════════════════════════════════════════════

  const learning = [
    {
      supplierId: editorial.id,
      supplierType: 'school' as const,
      title: 'RYA vs IYT vs ASA: Which Sailing Certification Is Right for You?',
      slug: 'rya-iyt-asa-sailing-certification-comparison',
      coverImageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1400&q=80',
      category: 'learning' as const,
      region: null,
      tags: ['certification', 'RYA', 'IYT', 'ASA', 'training', 'sailing school'],
      status: 'published' as const,
      publishedAt: publishDate(),
      metaTitle: 'RYA vs IYT vs ASA — Sailing Certifications Compared',
      metaDescription: 'Compare the three major sailing certification systems: RYA, IYT, and ASA. Which is recognized where, costs, and how to choose.',
      excerpt: 'Three certification bodies dominate recreational sailing worldwide. Understanding the differences — and where each is recognized — can save you time, money, and frustration.',
      content: `If you're learning to sail with the intention of chartering boats abroad, the certificate you hold matters. Not all qualifications are recognized everywhere, and the wrong choice can leave you unable to rent a boat in your dream destination. Here's a practical comparison of the three main systems.

## The three systems at a glance

### RYA (Royal Yachting Association)

**Origin:** United Kingdom
**Global recognition:** Excellent, particularly in the UK, Mediterranean, Caribbean, and former British Commonwealth countries.
**Structure:** Competence-based (Day Skipper, Coastal Skipper, Yachtmaster Offshore, Yachtmaster Ocean).
**Teaching approach:** Blends theory and practical, with separate shore-based courses for navigation and theory.

### IYT (International Yacht Training)

**Origin:** Canada
**Global recognition:** Very good worldwide, particularly in the Mediterranean, Caribbean, and Southeast Asia.
**Structure:** Tiered system from Basic Crew to IYT Yachtmaster Ocean.
**Teaching approach:** Practical-focused with integrated theory modules.

### ASA (American Sailing Association)

**Origin:** United States
**Global recognition:** Strong in the Americas and Caribbean. More limited recognition in Europe and Asia.
**Structure:** Numbered courses (ASA 101 through ASA 114).
**Teaching approach:** Standardized curriculum with textbook-based theory.

## Where each is recognized

This is the crucial question. Charter companies decide which certificates they accept, and their requirements vary by country.

**Mediterranean (Greece, Croatia, Italy, Turkey):** RYA and IYT are universally accepted. ASA is accepted by many charter companies but may face restrictions in some Greek and Croatian locations.

**Caribbean:** All three are widely accepted.

**Southeast Asia (Thailand, Malaysia):** RYA and IYT preferred. ASA sometimes accepted but not standard.

**Australia & New Zealand:** RYA is the gold standard. IYT is accepted. ASA has limited recognition.

**Americas:** ASA dominates in the US. RYA and IYT are accepted but less common.

## Cost comparison

Costs vary significantly by location, but as a rough guide for reaching bareboat charter level:

**RYA Day Skipper (practical + theory):** €2,000–3,500
**IYT International Bareboat Skipper:** €1,500–3,000
**ASA 101 + 103 + 104:** $2,000–4,000

Note that these are approximate ranges. Prices in the Mediterranean tend to be lower than in the UK or US, and package deals that combine multiple courses offer better value.

## Which should you choose?

**Choose RYA if:** You plan to sail primarily in European waters, want the most widely recognized certificate, or might pursue professional qualifications later. The RYA Yachtmaster is arguably the most respected recreational certificate worldwide.

**Choose IYT if:** You want good international recognition at a lower cost, plan to sail in the Mediterranean or Caribbean, and prefer a more practical, less exam-heavy approach.

**Choose ASA if:** You're based in the US and plan to sail primarily in American or Caribbean waters. ASA courses are widely available across the United States.

## A practical note

Regardless of which system you choose, real competence matters more than the piece of paper. Charter companies care about your actual ability, not just your certificate. Log as many sea miles as you can, gain experience in different conditions, and practice your anchoring, mooring, and heavy weather techniques.

The best certificate is the one from a school that teaches you well, in waters similar to where you plan to sail. Theory learned in a classroom in London is useful, but it's no substitute for ten days on the water in the Aegean with a good instructor.`,
    },
    {
      supplierId: editorial.id,
      supplierType: 'school' as const,
      title: 'From Zero to Skipper: What to Expect in Your First Sailing Course',
      slug: 'zero-to-skipper-first-sailing-course',
      coverImageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1400&q=80',
      category: 'learning' as const,
      region: 'Mediterranean',
      tags: ['beginner', 'learn to sail', 'first course', 'day skipper', 'training'],
      status: 'published' as const,
      publishedAt: publishDate(),
      metaTitle: 'Your First Sailing Course — What to Expect',
      metaDescription: 'Everything you need to know before your first sailing course. What you\'ll learn, what to pack, and how to prepare for Day Skipper level.',
      excerpt: 'You\'ve booked your first sailing course and have no idea what to expect. Good news — you\'re about to have one of the best weeks of your life. Here\'s how to prepare.',
      content: `You've decided to learn to sail. Maybe a friend's holiday on a charter boat lit the spark, or perhaps you've been watching boats in the harbour for years and finally decided it's time. Either way, you've signed up for your first course. Here's what actually happens.

## Before the course

### Fitness level

You don't need to be an athlete. You do need to be able to move around a boat — stepping over things, pulling on ropes, climbing in and out of a dinghy. Basic fitness is enough. If you can walk up four flights of stairs without difficulty, you'll be fine.

### What to pack

The packing list is simpler than you think.

Layers are key — mornings and evenings can be cool even in the Mediterranean. A waterproof jacket is essential even if the forecast is perfect. Non-marking, non-slip shoes (deck shoes or soft-soled trainers). Sunscreen, sunglasses with a retainer strap, and a hat.

Bring a soft bag, not a rigid suitcase. This is important — there is nowhere to store a hard case on most boats.

### Theory preparation

Most schools send pre-course reading material. Read it. Not because you'll be tested immediately, but because the vocabulary of sailing is unlike anything else, and having a basic understanding of "port," "starboard," "sheets," and "halyards" will save you time on day one.

## The first day

You'll arrive at the marina feeling nervous and vaguely fraudulent. This is normal. Everyone feels it.

Your instructor will start with a boat tour — explaining every piece of equipment, every rope, every instrument. This is overwhelming. It's supposed to be. The purpose isn't for you to remember everything; it's to start building familiarity.

By lunchtime, you'll have practised basic knots (bowline, figure-of-eight, cleat hitch) and done your first motoring exercises — driving the boat in and out of the berth, turning in confined spaces. This is harder than it looks and more satisfying than you'd expect.

## The learning curve

### Days 2–3

You'll start sailing. Tacking (turning through the wind with the bow), gybing (turning with the stern), and basic sail trim. You'll make mistakes — crossing the sheets wrong, forgetting which way to turn the wheel. Your instructor has seen it all before. Nobody has ever been as bad as they think they are.

Navigation gets introduced: chart reading, plotting courses, identifying buoys, and understanding tides and weather. The theory starts connecting to what you're seeing on the water.

### Days 4–5

By now, the basic manoeuvres feel less terrifying. You'll practise anchoring — finding a good spot, setting the hook, checking it's held. You'll take the helm for longer periods, making decisions about sail trim and course corrections.

Man-overboard drills happen at some point during the course. Picking up a fender floating in the water sounds simple until you try it under sail. It teaches you more about boat handling than almost anything else.

### Days 6–7

The final days typically involve longer passages — putting all the skills together. Navigation, sail changes, watch-keeping, cooking underway, and dealing with whatever the weather throws at you. By now, you'll be surprised at how much you've absorbed.

## After the course

You'll leave with a certificate, a logbook with your first sea miles recorded, and a slightly different relationship with the sea. The certificate qualifies you to charter boats at a basic level, but the real education has just begun.

The single best thing you can do after your first course is get on boats as often as possible — crew for experienced sailors, join a sailing club, take a refresher course. Sailing is a skill built by practice, not paperwork.

Most people who complete their first course describe the same feeling: a mixture of exhaustion, accomplishment, and an urgent desire to get back on the water. If that happens to you, welcome to sailing. You're one of us now.`,
    },
  ]

  // ══════════════════════════════════════════════════════════════
  //  ROUTES  (2 articles)
  // ══════════════════════════════════════════════════════════════

  const routes = [
    {
      supplierId: editorial.id,
      supplierType: 'charter' as const,
      title: 'One Week in the Saronic Gulf: Athens to Hydra and Back',
      slug: 'one-week-saronic-gulf-athens-hydra',
      coverImageUrl: 'https://images.unsplash.com/photo-1515859005217-8a1f08870f59?w=1400&q=80',
      category: 'route' as const,
      region: 'Mediterranean',
      tags: ['greece', 'saronic', 'athens', 'hydra', 'one week', 'itinerary'],
      status: 'published' as const,
      publishedAt: publishDate(),
      metaTitle: 'Saronic Gulf Sailing Itinerary — One Week from Athens',
      metaDescription: 'A seven-day sailing route through Greece\'s Saronic Gulf. From Athens to Hydra, Spetses, and Epidavros with anchorage and restaurant recommendations.',
      excerpt: 'The Saronic Gulf is Greece\'s most accessible sailing area — just an hour from Athens, with reliable winds, short passages, and some of the country\'s most beautiful islands.',
      content: `The Saronic Gulf solves a problem that plagues many sailing holidays: the first and last day transfer. Charter bases in the Saronic sit on Athens' doorstep — you can be on the boat within an hour of landing at the airport. This alone makes it one of the most practical charter destinations in the Mediterranean.

But the Saronic deserves attention beyond convenience. The islands here are diverse — from cosmopolitan Hydra (no cars allowed) to pine-covered Poros and the ancient theatre at Epidavros, which you can reach by dinghy from a quiet anchorage. Distances between islands are short, making this ideal for crews that prefer exploring to long passages.

## The route

### Day 1: Alimos Marina → Aegina

**Distance:** 17 nm / **Time:** 3–4 hours

Depart Alimos marina (Athens' main charter base) and head south through the shipping lane. Keep a sharp lookout for commercial traffic. Aegina town has a busy harbour — arrive before 14:00 for a berth, or anchor in the bay and dinghy ashore. Visit the fish market for the freshest catch in the Saronic.

### Day 2: Aegina → Perdika → Moni Island

**Distance:** 8 nm / **Time:** 1.5 hours

A short motor south to Perdika, a fishing village on Aegina's southwest tip. Anchor off the village for lunch at one of the waterfront tavernas. In the afternoon, cross to uninhabited Moni Island for swimming in turquoise water. Anchor overnight off Perdika or return to Moni if the weather is settled.

### Day 3: Perdika → Poros

**Distance:** 18 nm / **Time:** 3–4 hours

Cross to Poros, entering the narrow channel between the island and the Peloponnese. This passage feels like sailing up a river — the mainland is close enough to see people in waterfront cafes. Moor stern-to on the Poros town quay. The clock tower hike offers panoramic views over the entire Saronic.

### Day 4: Poros → Hydra

**Distance:** 12 nm / **Time:** 2–3 hours

The highlight of the trip. Hydra bans all motor vehicles — even bicycles. Goods are carried by donkey. The harbour, a natural amphitheatre of stone mansions, is one of the most photographed anchorages in Greece. Moor on the inner quay if space permits (arrive early in summer) or take a mooring line from the rocks on the east side.

### Day 5: Hydra → Ermioni or Spetses

**Distance:** 8–15 nm / **Time:** 1.5–3 hours

Choose between Ermioni (a quiet mainland town with excellent holding in a protected bay) or Spetses (a larger island with more nightlife and a beautiful old harbour). Both are good. Ermioni's anchorage is one of the most peaceful in the Saronic.

### Day 6: Ermioni/Spetses → Epidavros

**Distance:** 20 nm / **Time:** 4–5 hours

Cross back to the Peloponnese coast and anchor in the small bay at Palea Epidavros. The ancient theatre of Epidavros — one of the best-preserved in the world — is a short taxi ride away. If performances are scheduled, attending a Greek tragedy in a 2,400-year-old theatre is an unforgettable experience.

### Day 7: Epidavros → Alimos

**Distance:** 25 nm / **Time:** 5–6 hours

Early start for the return. The morning northerly (often light) fills in around 10:00. Keep to the west of Aegina to avoid commercial shipping. Aim to be back at the marina by 16:00 for check-out.

## Practical notes

**Winds:** The Saronic is relatively sheltered. Expect 10–18 knots from the north-northwest in summer (the Meltemi reaches here but without the ferocity of the Cyclades). Afternoons tend to be windier than mornings.

**Mooring:** Stern-to Mediterranean mooring is standard in harbours. Practice before the trip if you're not confident. Many anchorages have good holding in sand or mud.

**Provisioning:** Aegina, Poros, and Hydra all have well-stocked mini-markets. For a major shop, provision in Athens before departure.

**Swimming:** Bring snorkelling gear. The water clarity in the Saronic is excellent, particularly around Moni Island and the south coast of Aegina.`,
    },
    {
      supplierId: editorial.id,
      supplierType: 'charter' as const,
      title: 'The Atlantic Crossing: Planning Your First Transatlantic Passage',
      slug: 'atlantic-crossing-first-transatlantic-passage',
      coverImageUrl: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1400&q=80',
      category: 'route' as const,
      region: null,
      tags: ['atlantic', 'bluewater', 'passage', 'offshore', 'ARC', 'transatlantic'],
      status: 'published' as const,
      publishedAt: publishDate(),
      metaTitle: 'First Atlantic Crossing Guide — Transatlantic Sailing',
      metaDescription: 'Planning your first transatlantic sailing passage. Routes, timing, preparation, provisioning, and what 2,800 nautical miles of open ocean actually feels like.',
      excerpt: 'The Atlantic crossing is sailing\'s great rite of passage — 2,800 nautical miles of open ocean between the Canary Islands and the Caribbean. Here\'s how to plan yours.',
      content: `Crossing the Atlantic under sail is the dividing line between coastal cruising and ocean voyaging. It's the passage that turns "I like sailing" into "I'm a sailor." And despite its mythical status, thousands of boats make the crossing every year — the vast majority safely and without drama.

That said, it requires genuine preparation. Here's what you need to know.

## The classic route

The standard route follows the northeast trade winds: depart from the Canary Islands (usually Las Palmas on Gran Canaria), sail southwest to approximately 20°N to pick up the trades, then ride them west to the Caribbean — typically Barbados, Martinique, or St Lucia. The distance is roughly 2,800 nautical miles.

This route has been used for centuries because it works. The trade winds blow reliably from the east-northeast at 15–25 knots for most of the crossing, pushing you westward with favourable swells.

## When to go

**November to January** is the standard window. Most rally fleets (the ARC departs from Las Palmas in late November) aim for a pre-Christmas arrival in the Caribbean. Earlier departures risk late-season Atlantic hurricanes. Later departures face the possibility of the trades dying down in late January.

## Joining a rally vs going solo

### Rally (ARC, etc.)

The Atlantic Rally for Cruisers (ARC) is the most popular organized crossing. Advantages: safety net of other boats, weather routing advice, pre-departure seminars, social events in Las Palmas and at the finish in St Lucia. Disadvantages: cost (around €2,500+ for the entry fee), fixed schedule, and the feeling of being in a convoy.

### Solo crossing

Many boats cross independently, choosing their own departure date and route. This requires more self-reliance but offers complete freedom. You'll need your own weather routing strategy — either through satellite services or by learning to read GRIB files and weather fax charts.

## Boat preparation

The crossing is long but not technically demanding in terms of boat handling. What it does demand is reliability — everything on the boat will be tested over two to three weeks of continuous use.

**Rig inspection:** Have a rigger check standing rigging, terminals, and all fittings. Rig failure is the most common serious problem on Atlantic crossings.

**Sail inventory:** At minimum, carry a mainsail, genoa, and a downwind sail (cruising chute, asymmetric spinnaker, or twin headsails poled out). Most of the crossing will be broad reaching or running.

**Watermaker:** Not essential if you carry enough water (plan 3 litres per person per day), but a watermaker removes one major source of anxiety.

**Autopilot:** Your autopilot will steer for 20+ hours a day. Carry spares for the drive unit and consider a backup system (wind vane or secondary electronic pilot).

**Safety equipment:** Life raft, EPIRB, PLB for each crew, AIS transponder, jacklines, tethers, and a comprehensive first aid kit. You'll be days from rescue — take this seriously.

## Provisioning

Plan for 18–25 days at sea. Fresh food lasts about a week (longer for root vegetables, apples, and citrus). After that, you'll rely on tinned and dried goods. Vacuum-sealed meats, pasta, rice, and eggs (which last surprisingly long unrefrigerated) form the backbone of most crossing menus.

Fishing is excellent in the mid-Atlantic — many crews catch mahi-mahi, tuna, and wahoo. Bring fishing gear and a few reliable lures.

## What the crossing is actually like

The first few days are an adjustment. The motion is constant, watches feel long, and the routine hasn't been established yet. Mild seasickness is common and usually passes within 48 hours.

By day four or five, the rhythm settles. Watch routines become natural, meals acquire importance as the highlight of the day, and the sheer scale of the ocean begins to feel less intimidating and more meditative.

The middle section of the crossing can feel repetitive — the same wind, the same swells, the same horizon in every direction. Books, music, fishing, and good company become essential.

The final days, as the Caribbean approaches, bring a growing anticipation. When the green peak of a Caribbean island finally appears on the horizon, after two or three weeks of nothing but sea, it's a moment that stays with you forever.

## The bottom line

An Atlantic crossing is achievable for any competent cruising sailor with a well-prepared boat and a willing crew. It doesn't require heroism or extreme skill — it requires planning, patience, and respect for the sea. Do it once, and you'll understand why so many people describe it as the best experience of their sailing lives.`,
    },
  ]

  // ══════════════════════════════════════════════════════════════
  //  TIPS  (2 articles)
  // ══════════════════════════════════════════════════════════════

  const tips = [
    {
      supplierId: editorial.id,
      supplierType: 'charter' as const,
      title: 'Mediterranean Mooring: How to Stern-To Like a Local',
      slug: 'mediterranean-mooring-stern-to-guide',
      coverImageUrl: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1400&q=80',
      category: 'tips' as const,
      region: 'Mediterranean',
      tags: ['mooring', 'stern-to', 'mediterranean', 'technique', 'skills'],
      status: 'published' as const,
      publishedAt: publishDate(),
      metaTitle: 'How to Stern-To Moor — Mediterranean Mooring Guide',
      metaDescription: 'Master Mediterranean stern-to mooring. Step-by-step technique, common mistakes, and tips for mooring like a local in crowded Med harbours.',
      excerpt: 'Mediterranean mooring strikes fear into charter skippers worldwide. It shouldn\'t. With the right technique and a calm approach, stern-to mooring becomes second nature.',
      content: `Every year, thousands of charter crews arrive in Mediterranean harbours and face the same challenge: mooring stern-to. Unlike the alongside or pontoon berths common in northern Europe, Med mooring requires you to reverse your boat into a narrow gap between two other vessels while simultaneously deploying your anchor. With an audience of sundowner-sipping locals on the quay, it can feel like performing surgery on live television.

It doesn't have to be stressful. Here's how to do it properly.

## Understanding the setup

In a typical Med harbour, boats lie perpendicular to the quay with their sterns against the dock. Each boat is held off the quay by its own anchor (or a fixed chain/line on the seabed) deployed ahead of the boat. Lazy lines — chains or ropes permanently attached to the quay — sometimes replace individual anchors.

The key principle: you approach the quay in reverse, drop your anchor (or pick up a lazy line) as you go, and reverse until your stern is close enough to step ashore. Two stern lines secure you to the quay.

## The technique, step by step

### 1. Preparation (before you enter the harbour)

Prepare your anchor and chain. Ensure the anchor is ready to drop and that chain will run freely. Rig fenders on both sides — you will always need them, regardless of how much space you think you have. Prepare two long stern lines, led outside the guardrails and back to the cockpit.

### 2. Assess the berth

Motor slowly past your target spot to check the width, depth, and wind direction. Note what the neighbouring boats are doing — are they on anchors or lazy lines? Is there room? Is the wind pushing you toward or away from the quay?

### 3. The approach

Position your boat approximately three to four boat-lengths from the quay, directly in line with your target berth, heading toward the quay. If using your own anchor, motor slowly toward the quay while dropping the anchor. Let out chain as you go — you want roughly five times the water depth in total scope.

### 4. The reverse

With the anchor set, shift into reverse and motor slowly toward the quay. Pay out chain steadily. Use short bursts of throttle rather than continuous power — this gives you more control. Steer with small corrections. If you start drifting sideways, don't panic — use a burst of forward with the helm turned to correct your angle, then resume reversing.

### 5. Securing

When you're within throwing distance of the quay, hand your stern lines to someone ashore (or step off the stern platform to tie them yourself). Secure both stern lines, then tension the anchor chain until the boat sits comfortably two to three feet off the quay. Adjust fenders to protect against your neighbours.

## Common mistakes

**Too much speed:** The number one error. Approach slowly. You can always add power; you can't undo a collision.

**Anchor too close to the quay:** Drop it early, not late. Too short a scope means the anchor won't hold, and you'll drift sideways.

**Ignoring the wind:** Crosswind is the enemy of stern-to mooring. If possible, approach from the downwind side so the wind pushes you into the berth rather than out of it.

**Crew chaos:** Brief your crew before you start. Everyone should know their job — who drops the anchor, who handles fenders, who passes stern lines.

## Wind techniques

**Crosswind from port:** Approach slightly upwind of your target berth. As you reverse, the wind will push you sideways into position.

**Strong onshore wind (pushing toward quay):** Use more chain scope and be ready to give a burst of forward gear to slow your approach. Have crew ready with fenders on the stern.

**Offshore wind (pushing away from quay):** The easiest condition. The wind keeps you clear of the quay, and you simply use engine power to close the gap.

## When it goes wrong

It will go wrong sometimes. Accept this. The correct response is always the same: if you're not happy with the approach, motor forward, retrieve your anchor, and try again. Nobody in the harbour will think less of you. Everyone watching has been there.

The worst outcomes happen when skippers are too embarrassed to abort a bad approach. Swallow your pride, go around, and try again. The third attempt will be perfect.`,
    },
    {
      supplierId: editorial.id,
      supplierType: 'charter' as const,
      title: 'Provisioning for a Week at Sea: The Complete Guide',
      slug: 'provisioning-week-at-sea-complete-guide',
      coverImageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1400&q=80',
      category: 'tips' as const,
      region: null,
      tags: ['provisioning', 'food', 'galley', 'cooking', 'planning', 'charter'],
      status: 'published' as const,
      publishedAt: publishDate(),
      metaTitle: 'Boat Provisioning Guide — One Week at Sea',
      metaDescription: 'How to provision a sailboat for a week. Meal planning, storage tips, shopping lists, and galley cooking strategies for cruising crews.',
      excerpt: 'Good provisioning is the difference between a great sailing holiday and a mediocre one. Here\'s a practical system for feeding a crew well for a week at sea.',
      content: `There's a particular kind of misery that comes from opening a boat fridge on day three and finding nothing but wilting lettuce, warm beer, and a mystery container of something that might have been tzatziki. Good provisioning prevents this entirely. With a simple system and thirty minutes of planning, you can eat well for a week on board with minimal waste and no emergency supermarket visits.

## The system

### Step 1: Count your meals

For a one-week charter with four people, you're looking at approximately:

- 7 breakfasts (simple — cereal, yogurt, fruit, coffee)
- 5 lunches on board (the other 2 will be ashore)
- 5 dinners on board (the other 2 will be at restaurants)
- Snacks for sailing days

That's 60+ individual meals. It sounds like a lot, but most breakfasts are identical and lunches are assembled rather than cooked. The real planning goes into dinners.

### Step 2: Plan dinners first

Write down five dinner ideas. Keep them simple — boat galleys are small, often hot, and cooking in a seaway is challenging. Good boat meals share common traits: few ingredients, one pot or pan, forgiving of imprecise timing.

**Proven boat dinners:**
- Pasta with fresh tomato sauce and grilled chicken
- Greek salad with feta, olives, and crusty bread
- Grilled fish (caught or bought) with lemon and potatoes
- One-pot vegetable curry with rice
- Spaghetti aglio e olio with tinned tuna

### Step 3: Build the shopping list

From your meal plan, create categories:

**Fresh (buy first day):** Tomatoes, cucumber, peppers, lemons, herbs, salad leaves, fresh bread, cheese, yogurt, chicken, eggs, fruit

**Long-life fresh (lasts all week):** Onions, garlic, potatoes, carrots, apples, oranges, hard cheese, eggs (kept unrefrigerated, these last up to two weeks)

**Pantry:** Pasta (two types), rice, olive oil, tinned tomatoes (3–4 cans), tinned tuna, olives, capers, dried herbs and spices, coffee, tea, sugar, salt, pepper

**Drinks:** Water (at minimum 2L per person per day for drinking and cooking), wine, beer, soft drinks, UHT milk as backup

**Snacks:** Crackers, nuts, dried fruit, chocolate, biscuits — more than you think you need. Sailing makes people hungry.

## Storage strategy

Boat fridges are small and often inefficient. Prioritize fridge space for items that will spoil quickly: dairy, meat, and prepared foods. Everything else can be stored in dry lockers.

**Day 1–2:** Cook the chicken and any meat dishes while they're freshest
**Day 3–4:** Fish (bought locally), eggs, hard vegetables
**Day 5–7:** Pantry meals, pasta, rice, tinned goods

## Shopping abroad

If you're chartering in the Mediterranean, the local markets are your best friend. Buy tomatoes, bread, and cheese from market vendors rather than supermarkets — the quality is dramatically better and the prices are often lower.

**Greece:** Look for laiki agora (farmers' markets). Buy feta in bulk, stock up on olives, and get bread from a bakery (fournos) rather than a supermarket.

**Croatia:** Pekara (bakeries) produce excellent bread. Fresh fish markets exist in most harbour towns. Croatian olive oil is excellent and inexpensive.

**Italy:** Even the smallest Italian island has a shop with excellent pasta, tinned tomatoes, and bread. Italian provisioning almost takes care of itself.

## Galley tips

- **Cook early in the day** when it's cooler and the boat is usually still
- **One-pot meals** reduce both effort and washing up
- **Pre-chop** onions, garlic, and vegetables when the boat is at anchor and store them in containers
- **Freeze water bottles** to use as ice packs in the cooler — they keep drinks cold and provide drinking water as they melt
- **Wash up immediately** — a pile of dirty dishes in a small galley on a moving boat is deeply unpleasant

## The secret ingredient

The single most important provisioning item isn't food at all — it's a good attitude about cooking on board. Boat meals don't need to be elaborate. A simple pasta eaten in the cockpit at sunset, with wine and good company, is one of life's genuine pleasures. Don't overcomplicate it.

Provision well, keep it simple, eat fresh when you can, and remember that the sea air and the swimming make everything taste better.`,
    },
  ]

  // ══════════════════════════════════════════════════════════════
  //  GEAR  (2 articles)
  // ══════════════════════════════════════════════════════════════

  const gear = [
    {
      supplierId: editorial.id,
      supplierType: 'manufacturer' as const,
      title: 'The Essential Foul Weather Gear Guide for Sailors',
      slug: 'foul-weather-gear-guide-sailors',
      coverImageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1400&q=80',
      category: 'gear' as const,
      region: null,
      tags: ['foul weather', 'clothing', 'offshore', 'waterproofs', 'gear guide'],
      status: 'published' as const,
      publishedAt: publishDate(),
      metaTitle: 'Foul Weather Gear Guide — Best Sailing Waterproofs',
      metaDescription: 'How to choose sailing foul weather gear. Coastal vs offshore jackets, layering systems, and what actually matters when buying waterproofs for sailing.',
      excerpt: 'Good foul weather gear is the single most important equipment investment a sailor can make. Here\'s how to choose the right setup without overspending.',
      content: `There is a direct relationship between the quality of your waterproofs and your willingness to go sailing in November. Good foul weather gear doesn't just keep you dry — it keeps you on the water when fair-weather sailors stay in the marina. Over a sailing lifetime, that's thousands of additional hours of experience.

But the market is confusing. Prices range from under a hundred to well over a thousand for a jacket alone. Brands make claims about breathability, waterproofing, and durability that are difficult to verify in a shop. Here's how to think about it.

## The layering system

Before discussing waterproofs, understand that staying warm and dry at sea is a system, not a single garment.

**Base layer:** Moisture-wicking synthetic or merino wool. Cotton is terrible at sea — it absorbs water, loses insulation, and takes forever to dry. Merino wool is the best option: it wicks, insulates when wet, and resists odour.

**Mid layer:** Fleece or soft-shell for insulation. Weight depends on conditions — a lightweight fleece for summer sailing, a heavy fleece or down jacket for offshore work in cold water.

**Outer layer:** Waterproof and windproof jacket and trousers. This is where the real investment goes.

## Coastal vs offshore

The sailing gear market is split into two broad categories, and choosing correctly saves money.

### Coastal / inshore gear

Designed for day sailing, coastal cruising, and dinghy racing where you're never far from shelter. Lighter fabrics, simpler construction, and lower waterhead ratings. Adequate for most recreational sailing in the Mediterranean and summer coastal sailing in northern Europe.

**Price range:** €150–400 for a jacket
**Key features:** Hood, adjustable cuffs, hand-warmer pockets, lighter weight

### Offshore gear

Built for ocean passages, extended voyaging, and heavy weather. Heavier fabrics, fully taped seams, higher collars, integrated harness attachment points, and construction designed to withstand sustained spray and breaking waves.

**Price range:** €400–1,200 for a jacket
**Key features:** High collar, fleece-lined collar, hand-warmer pockets with drain holes, reinforced seat and knees on trousers, reflective patches, harness attachment

## What actually matters

### Waterproofing

Measured in millimetres of water head. Coastal gear typically rates 10,000–15,000mm. Offshore gear rates 20,000mm+. For the Mediterranean in summer, 10,000mm is fine. For the English Channel in October, you want 20,000mm minimum.

### Breathability

Measured in grams of moisture vapour transmitted per square metre per day (g/m²/24hr). Higher is better. Good breathability prevents that clammy feeling of sweating inside waterproofs. Look for ratings above 10,000g/m²/24hr. Premium fabrics like Gore-Tex deliver 15,000–25,000g/m²/24hr.

### Fit

More important than any specification. Foul weather gear must be large enough to accommodate base and mid layers underneath, but not so large that it catches wind or allows water to enter at the waist and cuffs. Try gear on over your normal sailing layers.

## Brands worth considering

**Musto:** The benchmark for serious sailing gear. Their MPX and HPX lines are excellent offshore systems. Not cheap, but built to last.

**Gill:** Strong mid-range option with good coastal and race gear. The OS2 and OS3 ranges offer excellent value.

**Henri Lloyd:** Recently revived under new ownership. Their legacy in offshore sailing is strong.

**Helly Hansen:** Excellent technical gear with a strong Scandinavian heritage. The Aegir and Skagen lines are particularly good.

**Zhik:** Australian brand with innovative fabrics and racing-focused designs.

## Care and maintenance

Sailing waterproofs require maintenance to retain their performance.

After each use, rinse with fresh water — salt crystals destroy waterproof coatings over time. Wash periodically with a specialist cleaner (not regular detergent, which strips DWR coatings). Re-proof annually with a spray-on or wash-in DWR treatment.

Store hanging, not folded — creasing can damage taped seams. Keep zippers clean and lubricated.

## The bottom line

For occasional coastal sailing in warm climates, a mid-range coastal jacket and trousers (€300–500 total) will serve well for years. For regular sailing in northern waters or any offshore work, invest in a quality offshore set (€600–1,200 total) — the comfort and safety difference is immediate and lasting.

The best foul weather gear is the set that keeps you comfortable enough to enjoy being on the water when conditions are challenging. Everything else is marketing.`,
    },
    {
      supplierId: editorial.id,
      supplierType: 'manufacturer' as const,
      title: 'Sailing Apps and Navigation Software: What\'s Worth Installing',
      slug: 'sailing-apps-navigation-software-guide',
      coverImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=80',
      category: 'gear' as const,
      region: null,
      tags: ['apps', 'navigation', 'software', 'technology', 'digital', 'charts'],
      status: 'published' as const,
      publishedAt: publishDate(),
      metaTitle: 'Best Sailing Apps & Navigation Software for 2026',
      metaDescription: 'The essential sailing apps and navigation software for cruising and racing. Chart plotters, weather, tides, and passage planning tools reviewed.',
      excerpt: 'A smartphone or tablet running the right apps can now do everything that once required thousands of pounds of dedicated marine electronics. Here\'s what\'s worth installing.',
      content: `Ten years ago, a competent navigation setup required a dedicated chart plotter, separate GPS, VHF radio with DSC, wind instruments, and a shelf full of paper charts. Today, a tablet running two or three apps can replicate most of this functionality at a fraction of the cost. Paper charts remain important (batteries die, screens crack), but digital tools have transformed passage planning and real-time navigation.

Here's what's genuinely useful and what's marketing hype.

## Chart plotters / navigation

### Navionics Boating

The most widely used mobile chart plotter. Comprehensive chart coverage worldwide, AIS overlay, route planning, and automatic routing that accounts for depth and obstacles. The charts are updated regularly and community edits add useful local detail.

**Strengths:** Chart quality, community updates, SonarChart depth layers, dock-to-dock autorouting
**Weaknesses:** Subscription model (annual), some remote areas have limited detail
**Cost:** Approximately €25–60/year depending on region
**Platform:** iOS, Android

### iSailor

Popular in European waters with charts sourced from official hydrographic offices. Clean interface, fast rendering, and excellent detail in the Mediterranean.

**Strengths:** Official chart data, clean interface, fast performance
**Weaknesses:** Smaller user community, limited coverage outside Europe
**Cost:** Charts purchased per region (€15–50 per area)
**Platform:** iOS, Android

### OpenCPN

Open-source chart plotter for desktop and laptop computers. Uses free charts from various sources. Highly customisable but requires more technical knowledge to set up.

**Strengths:** Free, customisable, supports multiple chart formats, excellent for passage planning
**Weaknesses:** Steeper learning curve, less polished interface, limited mobile support
**Cost:** Free
**Platform:** Windows, Mac, Linux

## Weather

### Windy

The best all-purpose weather app for sailors. Multiple forecast models (GFS, ECMWF, and others), animated wind and wave maps, precipitation overlay, and the ability to compare different forecast models side by side.

**Strengths:** Beautiful visualisation, multiple models, wave and swell data, radar overlay
**Weaknesses:** Can be overwhelming for beginners; premium features require subscription
**Cost:** Free (premium €20/year)
**Platform:** iOS, Android, Web

### PredictWind

Professional-grade weather routing and forecasting. Generates optimal routes based on weather forecasts and your boat's polar data. Used by serious offshore sailors and racing teams.

**Strengths:** Weather routing, departure planning, GRIB file delivery via satellite
**Weaknesses:** Complex, expensive for full functionality
**Cost:** From €12/month to €30+/month
**Platform:** iOS, Android, Web

### SailGrib

GRIB file viewer and weather routing software designed specifically for sailing. Creates optimal routes by analysing weather data against your boat's performance characteristics.

**Strengths:** GRIB handling, weather routing, polar integration
**Weaknesses:** Android-only, dated interface
**Cost:** €10–25 one-time purchase
**Platform:** Android

## Tides and currents

### TotalTide / EasyTide

Tide prediction based on official UK Hydrographic Office data. Covers global tidal stations with detailed height and stream predictions.

### Tides Planner

Clean, simple tide app with visual graphs. Good for quick tide checks.

## Communication and safety

### MarineTraffic

Real-time AIS vessel tracking. Identify nearby commercial vessels, check their course and speed, and assess collision risks. The free version provides basic tracking; premium adds more detail and historical data.

### Savvy Navvy

Combines chart plotting with intelligent routing that factors in weather, tides, and your vessel's characteristics. Billed as "Google Maps for boats" — increasingly popular with less experienced sailors.

## What you actually need

For a typical coastal charter holiday, you need:

1. **One chart plotter app** (Navionics is the safe choice)
2. **One weather app** (Windy is excellent and mostly free)
3. **MarineTraffic** for AIS awareness
4. A tide app if sailing in tidal waters

That's it. Four apps. Everything else is nice to have but not essential.

For offshore passages, add PredictWind or SailGrib for weather routing, and ensure you have a way to receive weather data without cellular connectivity (satellite phone, Iridium GO, or HF radio with weatherfax).

## A word of caution

Apps are tools, not replacements for seamanship. A chart plotter can't tell you that the anchorage looks uncomfortable in the current swell. A weather app can't judge whether your crew is ready for 25 knots on the nose. And none of them work when your phone falls overboard.

Carry paper charts for your sailing area, know how to use a hand-bearing compass, and never rely entirely on a single source of navigation data. Technology is wonderful until it isn't. Good seamanship is always in range.`,
    },
  ]

  // ── Insert all articles ────────────────────────────────────────
  const allArticles = [...destinations, ...boats, ...learning, ...routes, ...tips, ...gear]

  for (const article of allArticles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        coverImageUrl: article.coverImageUrl,
        tags: article.tags,
        region: article.region,
        status: article.status,
        publishedAt: article.publishedAt,
      },
      create: article,
    })
    console.log(`  ✓ ${article.category}: ${article.title}`)
  }

  console.log(`\n✅ Created ${allArticles.length} editorial articles across 6 categories`)
  console.log('   Editorial account: editorial@boattomorrow.com / editorial2026!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
