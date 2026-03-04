import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create categories
  const categories = [
    { slug: 'destination', name: 'Destinations', description: 'Sailing destinations around the world', allowedSupplierTypes: ['charter', 'school'], sortOrder: 1 },
    { slug: 'route', name: 'Routes', description: 'Sailing routes and itineraries', allowedSupplierTypes: ['charter'], sortOrder: 2 },
    { slug: 'boat', name: 'Boats', description: 'Yacht reviews and boat guides', allowedSupplierTypes: ['manufacturer'], sortOrder: 3 },
    { slug: 'learning', name: 'Learning', description: 'Sailing education and courses', allowedSupplierTypes: ['school'], sortOrder: 4 },
    { slug: 'tips', name: 'Tips', description: 'Sailing tips and advice', allowedSupplierTypes: ['charter', 'school'], sortOrder: 5 },
    { slug: 'gear', name: 'Gear & Tech', description: 'Marine equipment and technology', allowedSupplierTypes: ['manufacturer'], sortOrder: 6 },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    })
  }

  console.log('Categories seeded')

  // Create superadmin supplier
  const adminEmail = process.env.SUPERADMIN_EMAIL || 'admin@boattomorrow.com'
  const adminPassword = await bcrypt.hash('admin123456', 12)

  await prisma.supplier.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'BOATTOMORROW Admin',
      slug: 'boattomorrow-admin',
      email: adminEmail,
      passwordHash: adminPassword,
      type: 'charter',
      role: 'superadmin',
      status: 'active',
      profileStatus: 'draft',
    },
  })

  console.log(`Superadmin created: ${adminEmail} / admin123456`)

  // Create demo charter company
  const demoCharterPassword = await bcrypt.hash('demo123456', 12)
  const demoCharter = await prisma.supplier.upsert({
    where: { email: 'demo-charter@boattomorrow.com' },
    update: {},
    create: {
      name: 'Adriatic Sails',
      slug: 'adriatic-sails',
      email: 'demo-charter@boattomorrow.com',
      passwordHash: demoCharterPassword,
      type: 'charter',
      status: 'active',
      tagline: 'Premium yacht charter in the Adriatic Sea',
      description: `## About Adriatic Sails\n\nWe are a premium charter company based in Split, Croatia, offering an exceptional fleet of sailing yachts and catamarans for unforgettable Mediterranean adventures.\n\n### Our Fleet\n\nWith over 50 boats ranging from 32 to 56 feet, we have the perfect yacht for every crew size and experience level.\n\n### Why Choose Us\n\n- 15+ years of experience\n- Multilingual crew support\n- Flexible booking options\n- Best price guarantee`,
      regions: ['Croatia', 'Montenegro', 'Greece'],
      profileStatus: 'published',
      typeMeta: {
        fleetTypes: ['sailboat', 'catamaran'],
        fleetSize: 52,
        seasons: ['April-October'],
        languages: ['EN', 'HR', 'DE', 'IT'],
        certificates: ['bareboat', 'skippered'],
      },
    },
  })

  // Create demo articles for the charter
  const articles = [
    {
      supplierId: demoCharter.id,
      supplierType: 'charter' as const,
      title: 'Sailing the Dalmatian Coast: A Complete Guide',
      slug: 'sailing-dalmatian-coast-guide',
      content: `## Why the Dalmatian Coast?\n\nThe Croatian Dalmatian Coast is one of Europe's premier sailing destinations, offering crystal-clear waters, over 1,000 islands, and a rich cultural heritage that spans millennia.\n\n## Best Time to Sail\n\nThe sailing season runs from April to October, with July and August being the peak months. For a more relaxed experience, consider May-June or September-October when the winds are favorable and the anchorages less crowded.\n\n## Top Anchorages\n\n### Hvar\nThe queen of Croatian islands, Hvar offers stunning lavender fields, medieval architecture, and vibrant nightlife.\n\n### Vis\nOne of the most remote inhabited islands, Vis rewards sailors with untouched nature and the famous Blue Cave.\n\n### Korcula\nBelieved to be the birthplace of Marco Polo, Korcula features dense forests and charming old town streets.\n\n## Recommended Route\n\nA typical one-week charter from Split:\n- Day 1: Split → Brac (Milna)\n- Day 2: Brac → Hvar\n- Day 3: Hvar → Vis\n- Day 4: Vis → Korcula\n- Day 5: Korcula → Lastovo\n- Day 6: Lastovo → Hvar (south side)\n- Day 7: Return to Split\n\n## What to Expect\n\nThe Dalmatian Coast offers reliable Maestral winds in summer, making it perfect for both beginners and experienced sailors. Water temperatures reach 25°C in peak season.\n\n## Book Your Adventure\n\nReady to explore the Dalmatian Coast? Contact us for personalized charter recommendations.`,
      excerpt: 'Discover the magic of sailing along Croatia\'s stunning Dalmatian Coast with our comprehensive guide to routes, anchorages, and insider tips.',
      metaTitle: 'Sailing the Dalmatian Coast | Charter Guide 2025',
      metaDescription: 'Complete guide to sailing the Croatian Dalmatian Coast. Best routes, anchorages, seasons, and yacht recommendations.',
      category: 'destination' as const,
      region: 'Croatia',
      tags: ['croatia', 'dalmatian coast', 'sailing', 'charter', 'mediterranean'],
      status: 'published' as const,
      publishedAt: new Date(),
    },
    {
      supplierId: demoCharter.id,
      supplierType: 'charter' as const,
      title: 'Greek Island Hopping by Sailboat',
      slug: 'greek-island-hopping-sailboat',
      content: `## The Greek Islands Await\n\nGreece offers over 6,000 islands and islets, making it a paradise for sailors seeking variety, beauty, and adventure.\n\n## Cyclades vs Ionian: Which to Choose?\n\n### Cyclades\nStronger winds (Meltemi), dramatic landscapes, iconic whitewashed villages. Best for experienced sailors.\n\n### Ionian Islands\nCalmer waters, lush green landscapes, gentle breezes. Perfect for families and beginners.\n\n## Essential Tips\n\n1. **Wind awareness**: The Meltemi can blow strongly in July-August\n2. **Mooring fees**: Budget for marina costs, especially in popular ports\n3. **Provisioning**: Stock up at larger islands\n4. **Documentation**: Have your sailing license ready\n\n## Our Recommendation\n\nFor first-time Greece sailors, we recommend the Ionian Islands. Start from Lefkada and explore Ithaca, Kefalonia, and Zakynthos for a perfect week of sailing.`,
      excerpt: 'Your guide to island hopping through Greece by sailboat. Compare the Cyclades and Ionian islands for your perfect sailing vacation.',
      metaTitle: 'Greek Island Hopping by Sailboat | Guide',
      metaDescription: 'Plan your Greek island hopping adventure by sailboat. Cyclades vs Ionian, tips, routes, and recommendations.',
      category: 'destination' as const,
      region: 'Greece',
      tags: ['greece', 'islands', 'sailing', 'cyclades', 'ionian'],
      status: 'published' as const,
      publishedAt: new Date(),
    },
    {
      supplierId: demoCharter.id,
      supplierType: 'charter' as const,
      title: '10 Essential Tips for First-Time Charter Guests',
      slug: '10-tips-first-time-charter-guests',
      content: `## Getting Ready for Your First Charter\n\nChartering a yacht for the first time? Here are our top 10 tips to make your sailing vacation unforgettable.\n\n## 1. Choose the Right Boat\n\nConsider your group size, experience level, and comfort preferences. Catamarans offer more space and stability, while monohulls provide a more authentic sailing experience.\n\n## 2. Pack Light\n\nBring soft bags instead of hard suitcases. Storage on boats is limited, and soft bags can be squeezed into odd-shaped compartments.\n\n## 3. Learn Basic Knots\n\nKnowing how to tie a bowline and a cleat hitch will make you a valuable crew member.\n\n## 4. Respect the Sea\n\nAlways wear a life jacket when asked, stay hydrated, and use sunscreen generously.\n\n## 5. Provision Wisely\n\nPlan meals in advance and shop at local markets. Fresh Mediterranean ingredients make for amazing on-board dining.\n\n## 6. Be Flexible with Itinerary\n\nWeather may change your plans. Embrace it as part of the adventure.\n\n## 7. Learn to Anchor\n\nProper anchoring is crucial. Practice Mediterranean mooring (stern-to) before your trip.\n\n## 8. Budget for Extras\n\nMarina fees, fuel, provisioning, and dining ashore can add up.\n\n## 9. Respect Local Rules\n\nLearn about marine protected areas and local regulations.\n\n## 10. Enjoy Every Moment\n\nThe best part of sailing is disconnecting from the everyday world. Put your phone away and enjoy the sea.`,
      excerpt: 'Planning your first yacht charter? Our 10 essential tips will help you prepare for an unforgettable sailing vacation.',
      metaTitle: '10 Tips for First-Time Charter Guests',
      metaDescription: 'Essential tips for first-time yacht charter guests. From packing to provisioning, everything you need to know.',
      category: 'tips' as const,
      region: 'Mediterranean',
      tags: ['charter', 'tips', 'beginners', 'sailing', 'vacation'],
      status: 'published' as const,
      publishedAt: new Date(),
    },
  ]

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: article,
    })
  }

  console.log('Demo articles seeded')

  // Create demo manufacturer
  const demoMfgPassword = await bcrypt.hash('demo123456', 12)
  await prisma.supplier.upsert({
    where: { email: 'demo-manufacturer@boattomorrow.com' },
    update: {},
    create: {
      name: 'Blue Horizon Yachts',
      slug: 'blue-horizon-yachts',
      email: 'demo-manufacturer@boattomorrow.com',
      passwordHash: demoMfgPassword,
      type: 'manufacturer',
      status: 'active',
      tagline: 'Crafting dreams on water since 1998',
      description: '## Blue Horizon Yachts\n\nWe design and build premium sailing yachts for those who demand excellence on the water.',
      regions: ['Europe', 'Americas', 'Asia Pacific'],
      profileStatus: 'published',
      typeMeta: {
        brands: ['Blue Horizon', 'BH Sport'],
        boatTypes: ['sailing', 'catamaran'],
        distributionRegions: ['Europe', 'North America'],
        hasShowroom: true,
      },
    },
  })

  // Create demo school
  const demoSchoolPassword = await bcrypt.hash('demo123456', 12)
  await prisma.supplier.upsert({
    where: { email: 'demo-school@boattomorrow.com' },
    update: {},
    create: {
      name: 'Mediterranean Sailing Academy',
      slug: 'mediterranean-sailing-academy',
      email: 'demo-school@boattomorrow.com',
      passwordHash: demoSchoolPassword,
      type: 'school',
      status: 'active',
      tagline: 'Learn to sail in the most beautiful waters',
      description: '## Mediterranean Sailing Academy\n\nIYT and RYA certified sailing school offering courses from beginner to Yachtmaster in Croatia and Greece.',
      regions: ['Croatia', 'Greece'],
      profileStatus: 'published',
      typeMeta: {
        certBodies: ['IYT', 'RYA'],
        levels: ['beginner', 'intermediate', 'advanced'],
        courseFormats: ['onwater', 'online'],
        languages: ['EN', 'DE', 'HR'],
        homePort: 'Split, Croatia',
      },
    },
  })

  console.log('Demo suppliers seeded')
  console.log('\nDemo accounts:')
  console.log('  Admin: admin@boattomorrow.com / admin123456')
  console.log('  Charter: demo-charter@boattomorrow.com / demo123456')
  console.log('  Manufacturer: demo-manufacturer@boattomorrow.com / demo123456')
  console.log('  School: demo-school@boattomorrow.com / demo123456')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
