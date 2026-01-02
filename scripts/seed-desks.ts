import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const desks = [
  // FIRST CLUSTER (2x3 desks) - Left cluster
  { deskNumber: 'D01', x: 14.8, y: 31.0, hasStandingDesk: true, zone: 'Open Space' },
  { deskNumber: 'D02', x: 18.4, y: 31.0, hasStandingDesk: true, zone: 'Open Space' },
  { deskNumber: 'D03', x: 14.8, y: 40.5, hasStandingDesk: false, zone: 'Open Space' },
  { deskNumber: 'D04', x: 18.4, y: 40.5, hasStandingDesk: false, zone: 'Open Space' },
  { deskNumber: 'D05', x: 14.8, y: 50.0, hasStandingDesk: false, zone: 'Open Space' },
  { deskNumber: 'D06', x: 18.4, y: 50.0, hasStandingDesk: false, zone: 'Open Space' },

  // SECOND CLUSTER (2x3 desks) - Middle-left cluster
  { deskNumber: 'D07', x: 33.0, y: 31.0, hasStandingDesk: true, zone: 'Open Space' },
  { deskNumber: 'D08', x: 36.5, y: 31.0, hasStandingDesk: true, zone: 'Open Space' },
  { deskNumber: 'D09', x: 33.0, y: 40.5, hasStandingDesk: false, zone: 'Open Space' },
  { deskNumber: 'D10', x: 36.5, y: 40.5, hasStandingDesk: false, zone: 'Open Space' },
  { deskNumber: 'D11', x: 33.0, y: 50.0, hasStandingDesk: false, zone: 'Open Space' },
  { deskNumber: 'D12', x: 36.5, y: 50.0, hasStandingDesk: false, zone: 'Open Space' },

  // THIRD CLUSTER (2x3 desks) - Center cluster
  { deskNumber: 'D13', x: 49.7, y: 31.0, hasStandingDesk: true, zone: 'Open Space' },
  { deskNumber: 'D14', x: 53.2, y: 31.0, hasStandingDesk: false, zone: 'Open Space' },
  { deskNumber: 'D15', x: 49.7, y: 40.5, hasStandingDesk: false, zone: 'Open Space' },
  { deskNumber: 'D16', x: 53.2, y: 40.5, hasStandingDesk: false, zone: 'Open Space' },
  { deskNumber: 'D17', x: 49.7, y: 50.0, hasStandingDesk: true, zone: 'Open Space' },
  { deskNumber: 'D18', x: 53.2, y: 50.0, hasStandingDesk: false, zone: 'Open Space' },

  // FOURTH CLUSTER (2x3 desks) - Right cluster (Room 3959)
  { deskNumber: 'D19', x: 86.1, y: 32.0, hasStandingDesk: true, zone: 'Private Office' },
  { deskNumber: 'D20', x: 89.5, y: 32.0, hasStandingDesk: true, zone: 'Private Office' },
  { deskNumber: 'D21', x: 86.1, y: 41.5, hasStandingDesk: false, zone: 'Private Office' },
  { deskNumber: 'D22', x: 89.5, y: 41.5, hasStandingDesk: false, zone: 'Private Office' },
  { deskNumber: 'D23', x: 86.1, y: 51.0, hasStandingDesk: false, zone: 'Private Office' },
  { deskNumber: 'D24', x: 89.5, y: 51.0, hasStandingDesk: false, zone: 'Private Office' },

  // FIFTH CLUSTER - Lower cluster
  { deskNumber: 'D25', x: 35.1, y: 74.0, hasStandingDesk: true, zone: 'Open Space' },
  { deskNumber: 'D26', x: 38.5, y: 74.7, hasStandingDesk: true, zone: 'Open Space' },
]

async function main() {
  console.log('🌱 Seeding desks...')

  // Clear existing desks
  await prisma.deskBooking.deleteMany()
  await prisma.desk.deleteMany()

  // Create desks
  for (const desk of desks) {
    await prisma.desk.create({
      data: {
        deskNumber: desk.deskNumber,
        zone: desk.zone,
        x: desk.x,
        y: desk.y,
        hasMonitor: true, // All desks have monitors
        hasStandingDesk: desk.hasStandingDesk,
        isShared: true, // All desks are shared
        floor: '6th Floor',
      }
    })
  }

  console.log(`✅ Created ${desks.length} desks`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })