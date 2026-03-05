import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const destinations = [
  {
    canonicalName: 'Croatia',
    slug: 'croatia',
    aliases: ['Croatia', 'Dalmatia', 'Dalmatian Coast'],
    region: 'Mediterranean',
    description: 'Croatia offers over 1,200 islands along its Adriatic coastline, making it one of the most popular sailing destinations in the world.',
    heroImage: 'https://images.pexels.com/photos/2440061/pexels-photo-2440061.jpeg?auto=compress&cs=tinysrgb&w=1200',
    answerCapsule: 'Croatia is a premier Mediterranean sailing destination with over 1,200 islands, reliable summer winds, crystal-clear Adriatic waters, and well-equipped marinas along the Dalmatian coast. Peak season runs June through September.',
    overview: 'The Croatian coast stretches over 1,700 kilometres along the eastern Adriatic, sheltering more than a thousand islands between Istria in the north and Dubrovnik in the south. The waters are calm, the distances between anchorages short, and the infrastructure modern enough for first-time charterers.\n\nMost sailors begin in Split or Dubrovnik, though Zadar and Pula offer quieter starting points. The Kornati archipelago remains the most dramatic landscape, a maze of bare-rock islands with hidden coves. Further south, Hvar and Vis combine good anchorages with lively shore towns.',
    quickFacts: {
      season: 'May - October',
      temperature: '24-32°C (summer)',
      currency: 'EUR',
      language: 'Croatian',
      mainMarinas: ['ACI Split', 'Marina Dubrovnik', 'Marina Kornati', 'ACI Pula'],
    },
    seasonData: [
      { month: 'Jan', rating: 'off', avgTemp: '8°C' },
      { month: 'Feb', rating: 'off', avgTemp: '9°C' },
      { month: 'Mar', rating: 'off', avgTemp: '12°C' },
      { month: 'Apr', rating: 'shoulder', avgTemp: '16°C' },
      { month: 'May', rating: 'good', avgTemp: '21°C' },
      { month: 'Jun', rating: 'peak', avgTemp: '25°C' },
      { month: 'Jul', rating: 'peak', avgTemp: '29°C' },
      { month: 'Aug', rating: 'peak', avgTemp: '29°C' },
      { month: 'Sep', rating: 'good', avgTemp: '24°C' },
      { month: 'Oct', rating: 'shoulder', avgTemp: '19°C' },
      { month: 'Nov', rating: 'off', avgTemp: '13°C' },
      { month: 'Dec', rating: 'off', avgTemp: '9°C' },
    ],
    priceRange: { low: 1500, high: 8000, currency: '€', unit: 'week' },
    metaTitle: 'Sailing in Croatia: Complete Charter Guide 2026',
    metaDescription: 'Plan your Croatian sailing holiday. Routes, marinas, seasons, costs, and trusted charter companies. Expert guides from verified yachting suppliers.',
  },
  {
    canonicalName: 'Greece',
    slug: 'greece',
    aliases: ['Greece', 'Greek Islands', 'Cyclades', 'Ionian'],
    region: 'Mediterranean',
    description: 'Greece offers diverse sailing across the Aegean and Ionian seas, with thousands of islands and a rich maritime heritage.',
    heroImage: 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=1200',
    answerCapsule: 'Greece provides world-class sailing across the Aegean and Ionian seas with over 6,000 islands. The Cyclades offer challenging Meltemi winds for experienced sailors, while the Ionian islands provide gentler conditions for families and beginners.',
    overview: 'Greece is the birthplace of seafaring, and sailing here feels like stepping into a living mythology. The country divides neatly into two sailing zones: the Ionian islands in the west, where gentle breezes and sheltered waters make it perfect for beginners; and the Aegean in the east, where the Meltemi wind demands respect but rewards with dramatic island-hopping.\n\nThe Cyclades are the classic Greek sailing circuit: Mykonos, Santorini, Paros, Naxos. The Dodecanese near Turkey offer quieter waters and fewer tourists. The Saronic Gulf, just south of Athens, provides a weekend-friendly route with ancient harbours.',
    quickFacts: {
      season: 'April - October',
      temperature: '22-35°C (summer)',
      currency: 'EUR',
      language: 'Greek',
      mainMarinas: ['Alimos (Athens)', 'Lefkas Marina', 'Gouvia (Corfu)', 'Kos Marina'],
    },
    seasonData: [
      { month: 'Jan', rating: 'off', avgTemp: '10°C' },
      { month: 'Feb', rating: 'off', avgTemp: '11°C' },
      { month: 'Mar', rating: 'off', avgTemp: '13°C' },
      { month: 'Apr', rating: 'shoulder', avgTemp: '17°C' },
      { month: 'May', rating: 'good', avgTemp: '22°C' },
      { month: 'Jun', rating: 'peak', avgTemp: '27°C' },
      { month: 'Jul', rating: 'peak', avgTemp: '30°C', note: 'Meltemi winds in Aegean' },
      { month: 'Aug', rating: 'peak', avgTemp: '30°C', note: 'Strongest Meltemi period' },
      { month: 'Sep', rating: 'good', avgTemp: '26°C' },
      { month: 'Oct', rating: 'shoulder', avgTemp: '21°C' },
      { month: 'Nov', rating: 'off', avgTemp: '15°C' },
      { month: 'Dec', rating: 'off', avgTemp: '11°C' },
    ],
    priceRange: { low: 1200, high: 7000, currency: '€', unit: 'week' },
    metaTitle: 'Sailing in Greece: Complete Island-Hopping Guide 2026',
    metaDescription: 'Plan your Greek sailing adventure. Cyclades, Ionian, Dodecanese routes. Best seasons, costs, marinas, and trusted charter companies.',
  },
  {
    canonicalName: 'Turkey',
    slug: 'turkey',
    aliases: ['Turkey', 'Turkish Riviera', 'Turquoise Coast'],
    region: 'Mediterranean',
    description: 'Turkey\'s Turquoise Coast combines ancient ruins, pristine bays, and competitive charter prices.',
    heroImage: 'https://images.pexels.com/photos/3278939/pexels-photo-3278939.jpeg?auto=compress&cs=tinysrgb&w=1200',
    answerCapsule: 'Turkey\'s Turquoise Coast between Bodrum and Antalya offers sheltered bays, ancient ruins, excellent marinas, and charter prices typically 20-30% lower than Greece or Croatia. The sailing season runs May through October.',
    overview: 'The Turkish Riviera, known locally as the Turquoise Coast, runs from Bodrum in the west to Antalya in the east. It is one of the Mediterranean\'s best-kept sailing secrets: deep blue waters, deserted pine-fringed bays, and a coastline dotted with Lycian tombs and Greek amphitheatres.\n\nMost charters start from Bodrum, Marmaris, Gocek, or Fethiye. The Gocek-to-Fethiye route is considered one of the finest short sailing passages in the Mediterranean, with a dozen uninhabited bays reachable in a single week.',
    quickFacts: {
      season: 'May - October',
      temperature: '25-35°C (summer)',
      currency: 'TRY / EUR accepted',
      language: 'Turkish',
      mainMarinas: ['D-Marin Bodrum', 'Netsel Marmaris', 'Club Marina Gocek', 'Ece Saray Fethiye'],
    },
    seasonData: [
      { month: 'Jan', rating: 'off', avgTemp: '10°C' },
      { month: 'Feb', rating: 'off', avgTemp: '11°C' },
      { month: 'Mar', rating: 'off', avgTemp: '14°C' },
      { month: 'Apr', rating: 'shoulder', avgTemp: '18°C' },
      { month: 'May', rating: 'good', avgTemp: '23°C' },
      { month: 'Jun', rating: 'peak', avgTemp: '28°C' },
      { month: 'Jul', rating: 'peak', avgTemp: '33°C' },
      { month: 'Aug', rating: 'peak', avgTemp: '33°C' },
      { month: 'Sep', rating: 'good', avgTemp: '28°C' },
      { month: 'Oct', rating: 'shoulder', avgTemp: '22°C' },
      { month: 'Nov', rating: 'off', avgTemp: '16°C' },
      { month: 'Dec', rating: 'off', avgTemp: '11°C' },
    ],
    priceRange: { low: 1000, high: 5000, currency: '€', unit: 'week' },
    metaTitle: 'Sailing Turkey\'s Turquoise Coast: Complete Guide 2026',
    metaDescription: 'Sail Turkey\'s stunning coastline. Bodrum to Gocek routes, marinas, seasons, costs. Expert guides from verified charter companies.',
  },
  {
    canonicalName: 'Italy - Sardinia',
    slug: 'sardinia',
    aliases: ['Sardinia', 'Italy', 'Costa Smeralda'],
    region: 'Mediterranean',
    description: 'Sardinia offers spectacular coastal scenery, from the glamorous Costa Smeralda to the wild Maddalena archipelago.',
    heroImage: 'https://images.pexels.com/photos/2325137/pexels-photo-2325137.jpeg?auto=compress&cs=tinysrgb&w=1200',
    answerCapsule: 'Sardinia combines Italy\'s finest coastal scenery with challenging open-water sailing. The Maddalena archipelago in the north offers turquoise anchorages, while the western coast has dramatic cliffs and caves. Best sailed May through September.',
    overview: 'Sardinia is the Mediterranean\'s second-largest island, and its coastline is arguably the most beautiful in Italy. The Costa Smeralda in the northeast draws the superyacht crowd, but sailors know the real treasures lie in the Maddalena archipelago just to the north, and in the quieter anchorages along the western shore.\n\nThe island offers more demanding sailing than Croatia or the Ionian. The Strait of Bonifacio between Sardinia and Corsica can produce strong currents and steep seas, while the western coast is exposed to the Mistral. But for experienced crews, these conditions add to the appeal.',
    quickFacts: {
      season: 'May - September',
      temperature: '22-30°C (summer)',
      currency: 'EUR',
      language: 'Italian',
      mainMarinas: ['Marina di Olbia', 'Porto Cervo', 'Alghero Marina', 'Cagliari Marina'],
    },
    seasonData: [
      { month: 'Jan', rating: 'off', avgTemp: '9°C' },
      { month: 'Feb', rating: 'off', avgTemp: '10°C' },
      { month: 'Mar', rating: 'off', avgTemp: '12°C' },
      { month: 'Apr', rating: 'shoulder', avgTemp: '15°C' },
      { month: 'May', rating: 'good', avgTemp: '20°C' },
      { month: 'Jun', rating: 'peak', avgTemp: '25°C' },
      { month: 'Jul', rating: 'peak', avgTemp: '28°C' },
      { month: 'Aug', rating: 'peak', avgTemp: '28°C' },
      { month: 'Sep', rating: 'good', avgTemp: '24°C' },
      { month: 'Oct', rating: 'shoulder', avgTemp: '19°C' },
      { month: 'Nov', rating: 'off', avgTemp: '14°C' },
      { month: 'Dec', rating: 'off', avgTemp: '10°C' },
    ],
    priceRange: { low: 2000, high: 10000, currency: '€', unit: 'week' },
    metaTitle: 'Sailing Sardinia: Complete Guide to Italy\'s Best Coastline 2026',
    metaDescription: 'Plan your Sardinia sailing trip. Costa Smeralda, Maddalena, western coast routes. Marinas, seasons, costs, and charter companies.',
  },
  {
    canonicalName: 'British Virgin Islands',
    slug: 'bvi',
    aliases: ['BVI', 'British Virgin Islands', 'Caribbean'],
    region: 'Caribbean',
    description: 'The BVI is the sailing capital of the Caribbean, with steady trade winds and short island hops.',
    heroImage: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200',
    answerCapsule: 'The British Virgin Islands offer the Caribbean\'s most accessible sailing with steady trade winds, short passages between islands, protected anchorages, and year-round warm weather. The cluster of 60+ islands can be explored comfortably in a one-week charter.',
    overview: 'The BVI is often called the sailing capital of the world, and for good reason. Sixty-plus islands and cays are clustered close enough that the longest passage takes just a few hours. The trade winds blow steadily from the east at 15-20 knots, the waters are protected by a chain of reefs, and the anchorages are plentiful.\n\nMost charters start from Road Town on Tortola. The classic BVI route heads east to Virgin Gorda and the famous Baths, then loops through Anegada, Jost Van Dyke, and the smaller cays. It is a route you can sail a dozen times and find something new each trip.',
    quickFacts: {
      season: 'November - July',
      temperature: '25-31°C (year-round)',
      currency: 'USD',
      language: 'English',
      mainMarinas: ['Nanny Cay', 'Village Cay', 'Soper\'s Hole', 'Virgin Gorda Yacht Harbour'],
    },
    seasonData: [
      { month: 'Jan', rating: 'peak', avgTemp: '26°C' },
      { month: 'Feb', rating: 'peak', avgTemp: '26°C' },
      { month: 'Mar', rating: 'peak', avgTemp: '27°C' },
      { month: 'Apr', rating: 'good', avgTemp: '28°C' },
      { month: 'May', rating: 'good', avgTemp: '29°C' },
      { month: 'Jun', rating: 'shoulder', avgTemp: '30°C', note: 'Hurricane season starts' },
      { month: 'Jul', rating: 'shoulder', avgTemp: '31°C' },
      { month: 'Aug', rating: 'off', avgTemp: '31°C', note: 'Peak hurricane risk' },
      { month: 'Sep', rating: 'off', avgTemp: '31°C', note: 'Peak hurricane risk' },
      { month: 'Oct', rating: 'off', avgTemp: '30°C' },
      { month: 'Nov', rating: 'good', avgTemp: '28°C' },
      { month: 'Dec', rating: 'peak', avgTemp: '27°C' },
    ],
    priceRange: { low: 3000, high: 15000, currency: '$', unit: 'week' },
    metaTitle: 'Sailing the BVI: Complete Caribbean Charter Guide 2026',
    metaDescription: 'Plan your BVI sailing holiday. Island-hopping routes, trade winds, anchorages, costs. Expert guides from verified charter companies.',
  },
]

async function main() {
  for (const dest of destinations) {
    const existing = await prisma.destination.findUnique({
      where: { slug: dest.slug },
    })

    if (existing) {
      // Update with mega-page fields
      await prisma.destination.update({
        where: { slug: dest.slug },
        data: {
          heroImage: dest.heroImage,
          answerCapsule: dest.answerCapsule,
          quickFacts: dest.quickFacts,
          seasonData: dest.seasonData,
          priceRange: dest.priceRange,
          overview: dest.overview,
          metaTitle: dest.metaTitle,
          metaDescription: dest.metaDescription,
          description: dest.description,
        },
      })
      console.log(`Updated: ${dest.canonicalName}`)
    } else {
      await prisma.destination.create({ data: dest })
      console.log(`Created: ${dest.canonicalName}`)
    }
  }

  console.log('Done seeding destinations!')
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
