import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john.doe@inalogy.com' },
      update: {},
      create: {
        email: 'john.doe@inalogy.com',
        firstName: 'John',
        lastName: 'Doe',
        department: 'Engineering',
        role: 'EMPLOYEE'
      }
    }),
    prisma.user.upsert({
      where: { email: 'jane.smith@inalogy.com' },
      update: {},
      create: {
        email: 'jane.smith@inalogy.com',
        firstName: 'Jane',
        lastName: 'Smith',
        department: 'Design',
        role: 'MANAGER'
      }
    }),
    prisma.user.upsert({
      where: { email: 'admin@inalogy.com' },
      update: {},
      create: {
        email: 'admin@inalogy.com',
        firstName: 'Admin',
        lastName: 'User',
        department: 'IT',
        role: 'ADMIN'
      }
    })
  ])

  console.log('✅ Created users:', users.length)

  // Create desks with coordinates matching the floorplan
  const desks = [
    // North Wing desks
    { deskNumber: 'D01', x: 20, y: 25, zone: 'North Wing', floor: 'Ground Floor' },
    { deskNumber: 'D02', x: 30, y: 25, zone: 'North Wing', floor: 'Ground Floor' },
    { deskNumber: 'D03', x: 40, y: 25, zone: 'North Wing', floor: 'Ground Floor' },
    { deskNumber: 'D04', x: 50, y: 25, zone: 'North Wing', floor: 'Ground Floor' },
    { deskNumber: 'D05', x: 60, y: 25, zone: 'North Wing', floor: 'Ground Floor' },
    { deskNumber: 'D06', x: 70, y: 25, zone: 'North Wing', floor: 'Ground Floor' },
    
    // Central Area desks
    { deskNumber: 'D07', x: 20, y: 45, zone: 'Central Area', floor: 'Ground Floor' },
    { deskNumber: 'D08', x: 30, y: 45, zone: 'Central Area', floor: 'Ground Floor' },
    { deskNumber: 'D09', x: 40, y: 45, zone: 'Central Area', floor: 'Ground Floor' },
    { deskNumber: 'D10', x: 50, y: 45, zone: 'Central Area', floor: 'Ground Floor' },
    { deskNumber: 'D11', x: 60, y: 45, zone: 'Central Area', floor: 'Ground Floor' },
    { deskNumber: 'D12', x: 70, y: 45, zone: 'Central Area', floor: 'Ground Floor' },
    
    // South Wing desks
    { deskNumber: 'D13', x: 20, y: 65, zone: 'South Wing', floor: 'Ground Floor' },
    { deskNumber: 'D14', x: 30, y: 65, zone: 'South Wing', floor: 'Ground Floor' },
    { deskNumber: 'D15', x: 40, y: 65, zone: 'South Wing', floor: 'Ground Floor' },
    { deskNumber: 'D16', x: 50, y: 65, zone: 'South Wing', floor: 'Ground Floor' },
    { deskNumber: 'D17', x: 60, y: 65, zone: 'South Wing', floor: 'Ground Floor' },
    { deskNumber: 'D18', x: 70, y: 65, zone: 'South Wing', floor: 'Ground Floor' },
  ]

  for (const desk of desks) {
    await prisma.desk.upsert({
      where: { deskNumber: desk.deskNumber },
      update: {},
      create: {
        ...desk,
        hasMonitor: Math.random() > 0.3, // 70% have monitors
        hasStandingDesk: Math.random() > 0.7 // 30% are standing desks
      }
    })
  }

  console.log('✅ Created desks:', desks.length)

  // Create parking spaces
  const parkingSpaces = [
    { spaceNumber: 'P01', location: 'North Lot', x: 10, y: 10 },
    { spaceNumber: 'P02', location: 'North Lot', x: 20, y: 10 },
    { spaceNumber: 'P03', location: 'North Lot', x: 30, y: 10 },
    { spaceNumber: 'P04', location: 'North Lot', x: 40, y: 10 },
    { spaceNumber: 'P05', location: 'North Lot', x: 50, y: 10 },
    { spaceNumber: 'H01', location: 'North Lot', x: 60, y: 10, isHandicapAccessible: true },
    { spaceNumber: 'E01', location: 'South Lot', x: 10, y: 90, isEVCharging: true },
    { spaceNumber: 'E02', location: 'South Lot', x: 20, y: 90, isEVCharging: true },
    { spaceNumber: 'P06', location: 'South Lot', x: 30, y: 90 },
    { spaceNumber: 'P07', location: 'South Lot', x: 40, y: 90 },
    { spaceNumber: 'P08', location: 'South Lot', x: 50, y: 90 },
    { spaceNumber: 'P09', location: 'South Lot', x: 60, y: 90 },
  ]

  for (const space of parkingSpaces) {
    await prisma.parkingSpace.upsert({
      where: { spaceNumber: space.spaceNumber },
      update: {},
      create: {
        ...space,
        isHandicapAccessible: space.isHandicapAccessible || false,
        isEVCharging: space.isEVCharging || false
      }
    })
  }

  console.log('✅ Created parking spaces:', parkingSpaces.length)

  // Create some sample notifications
  for (const user of users) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'WELCOME',
        title: 'Welcome to Inalogystics!',
        message: 'Welcome to the office logistics platform. You can now book desks and parking spaces.',
        isRead: false
      }
    })
  }

  console.log('✅ Created welcome notifications')
  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })