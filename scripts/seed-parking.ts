import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedParking() {
  console.log('🚗 Seeding parking spaces...')

  // Delete existing parking bookings first (to avoid foreign key constraint errors)
  await prisma.parkingBooking.deleteMany()

  // Delete existing parking spaces
  await prisma.parkingSpace.deleteMany()

  // Create 5 garage parking spots (G12, G13, G14, G15, G60)
  const garageSpots = [
    { spotNumber: 'G12', location: 'Garage' },
    { spotNumber: 'G13', location: 'Garage' },
    { spotNumber: 'G14', location: 'Garage' },
    { spotNumber: 'G15', location: 'Garage' },
    { spotNumber: 'G60', location: 'Garage' }
  ]

  // Create 5 parking house spots (PH66-PH70)
  const parkingHouseSpots = []
  for (let i = 66; i <= 70; i++) {
    parkingHouseSpots.push({
      spotNumber: `PH${i}`,
      location: 'Parking House'
    })
  }

  // Insert all parking spaces
  const allSpots = [...garageSpots, ...parkingHouseSpots]

  const createdSpaces = await Promise.all(
    allSpots.map(space =>
      prisma.parkingSpace.create({
        data: space
      })
    )
  )

  console.log(`✅ Created ${createdSpaces.length} parking spaces`)

  // Show summary
  const garageCount = createdSpaces.filter(s => s.location === 'Garage').length
  const parkingHouseCount = createdSpaces.filter(s => s.location === 'Parking House').length

  console.log(`   🏢 Garage spots: ${garageCount} (G12, G13, G14, G15, G60)`)
  console.log(`   🏘️  Parking House spots: ${parkingHouseCount} (PH66-PH70)`)
}

seedParking()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })