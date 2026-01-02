import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestBooking() {
  console.log('🧪 Creating test booking...')

  // Find or create a test user
  let user = await prisma.user.findFirst({
    where: { email: 'test@example.com' }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        department: 'Engineering'
      }
    })
  }

  // Get the first desk
  const desk = await prisma.desk.findFirst({
    where: { deskNumber: 'D02' }
  })

  if (!desk) {
    console.error('No desk found')
    return
  }

  // Create a booking for today
  const today = new Date()
  const todayString = today.toISOString().split('T')[0]
  const bookingDate = new Date(todayString + 'T00:00:00Z')

  const booking = await prisma.deskBooking.create({
    data: {
      userId: user.id,
      deskId: desk.id,
      date: bookingDate,
      startTime: new Date(bookingDate.getTime() + 9 * 60 * 60 * 1000), // 9 AM
      endTime: new Date(bookingDate.getTime() + 17 * 60 * 60 * 1000), // 5 PM
      status: 'ACTIVE'
    }
  })

  console.log(`✅ Created booking for desk ${desk.deskNumber} by ${user.name}`)
  console.log(`📅 Date: ${booking.date.toISOString().split('T')[0]}`)
}

createTestBooking()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })