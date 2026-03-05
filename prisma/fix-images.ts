import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function pexels(id: number): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1400`
}

// All images verified by Pexels page titles from search results
const imageMap: Record<string, string> = {
  // ── DESTINATIONS ──
  // Pexels 12220325: "Stormy Sky Over Sea And Volcano Island" (by Antonio Treccarichi)
  'aeolian-islands-sicily-sailing-paradise': pexels(12220325),

  // Pexels 913112: "Aerial Photography of Sea" (harbor with cruise ships and sailboats)
  'sailing-dalmatian-coast-guide': pexels(913112),

  // Pexels 13650588: "Blue and White Ship on the Sea" (Aegean Sea, Greek islands)
  'greek-island-hopping-sailboat': pexels(13650588),

  // Pexels 10785532: "Bay of Kotor, Montenegro" (aerial bay with mountains)
  // Montenegro article — will match by title pattern below

  // Pexels 13829550: "Small Rocky Island on the Sea" (Nordic-looking rocky island)
  'gothenburg-archipelago-nordic-sailing': pexels(13829550),

  // Pexels 19160369: "Boats in a Bay" (tropical boats in bay)
  'langkawi-andaman-sea-southeast-asia-sailing': pexels(19160369),

  // ── BOATS ──
  // Pexels 4600762: "White and Blue Boat on Blue Sea" (aerial catamaran on crystal water)
  'modern-cruising-catamaran-multihulls': pexels(4600762),

  // Pexels 1266884: "White and Blue Sailboat on Sea" (classic sailboat)
  'choosing-first-cruising-sailboat-30-40-feet': pexels(1266884),

  // ── LEARNING ──
  // Pexels 327337: "High Angle View of People Sailing on Sea"
  'rya-iyt-asa-sailing-certification-comparison': pexels(327337),

  // Pexels 6750248: "People on a Sailboat" (crew on deck)
  'zero-to-skipper-first-sailing-course': pexels(6750248),

  // ── ROUTES ──
  // Pexels 8292102: "Boats Docked in the Harbor" (harbor with docked boats)
  'one-week-saronic-gulf-athens-hydra': pexels(8292102),

  // Pexels 9565566: "White and Blue Boat on the Ocean" (boat on open ocean)
  'atlantic-crossing-first-transatlantic-passage': pexels(9565566),

  // ── TIPS ──
  // Pexels 13121940: "Boats Docked on the Harbor" (sailboats in marina bay)
  'mediterranean-mooring-stern-to-guide': pexels(13121940),

  // Pexels 1640777: fresh vegetables/food flat lay
  'provisioning-week-at-sea-complete-guide': pexels(1640777),

  // Pexels 746683: "Photography of Sailboat on Sea" (sailboat at golden hour)
  '10-tips-first-time-charter-guests': pexels(746683),

  // ── GEAR ──
  // Pexels 33579: "White Sailboat at Sea Under Gray Sky" (moody weather sailing)
  'foul-weather-gear-guide-sailors': `https://images.pexels.com/photos/33579/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1400`,

  // Pexels 5302808: "Maps and Navigation Tools on Wooden Table"
  'sailing-apps-navigation-software-guide': pexels(5302808),
}

async function main() {
  // Update articles by slug
  for (const [slug, imageUrl] of Object.entries(imageMap)) {
    const result = await prisma.article.updateMany({
      where: { slug },
      data: { coverImageUrl: imageUrl },
    })
    const status = result.count > 0 ? '✓' : '✗ not found'
    console.log(`  ${status}  ${slug}`)
  }

  // Handle Montenegro article (may have been AI-generated with unpredictable slug)
  const montenegroArticle = await prisma.article.findFirst({
    where: {
      title: { contains: 'Montenegro' },
      status: 'published',
    },
  })
  if (montenegroArticle) {
    await prisma.article.update({
      where: { id: montenegroArticle.id },
      data: { coverImageUrl: pexels(10785532) },
    })
    console.log(`  ✓  Montenegro: ${montenegroArticle.slug}`)
  }

  // Check for any remaining articles without cover images
  const noCover = await prisma.article.findMany({
    where: { status: 'published', coverImageUrl: null },
    select: { slug: true, title: true },
  })
  if (noCover.length > 0) {
    console.log('\n⚠ Articles still without cover images:')
    noCover.forEach(a => console.log(`  - ${a.title} (${a.slug})`))
  } else {
    console.log('\n✅ All published articles now have cover images!')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
