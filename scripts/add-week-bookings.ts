import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addWeekBookings() {
  console.log('📅 Adding more bookings for the week...')

  // Find the existing user
  const user = await prisma.user.findFirst({
    where: { email: 'test@example.com' }
  })

  if (!user) {
    console.error('User not found')
    return
  }

  // Find desks
  const desk04 = await prisma.desk.findFirst({ where: { deskNumber: 'D04' } })
  const desk10 = await prisma.desk.findFirst({ where: { deskNumber: 'D10' } })

  if (!desk04 || !desk10) {
    console.error('Desks not found')
    return
  }

  // Add booking for tomorrow (D04)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const tomorrowBooking = await prisma.deskBooking.create({
    data: {
      userId: user.id,
      deskId: desk04.id,
      date: tomorrow,
      startTime: new Date(tomorrow.getTime() + 9 * 60 * 60 * 1000), // 9 AM
      endTime: new Date(tomorrow.getTime() + 17 * 60 * 60 * 1000), // 5 PM
      status: 'ACTIVE'
    }
  })

  console.log(`✅ Created booking for desk D04 on ${tomorrow.toISOString().split('T')[0]}`)

  // Add booking for day after tomorrow (D10)
  const dayAfter = new Date()
  dayAfter.setDate(dayAfter.getDate() + 2)
  dayAfter.setHours(0, 0, 0, 0)

  const dayAfterBooking = await prisma.deskBooking.create({
    data: {
      userId: user.id,
      deskId: desk10.id,
      date: dayAfter,
      startTime: new Date(dayAfter.getTime() + 9 * 60 * 60 * 1000), // 9 AM
      endTime: new Date(dayAfter.getTime() + 17 * 60 * 60 * 1000), // 5 PM
      status: 'ACTIVE'
    }
  })

  console.log(`✅ Created booking for desk D10 on ${dayAfter.toISOString().split('T')[0]}`)
}

addWeekBookings()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })