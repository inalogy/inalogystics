import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestBooking() {
  console.log('📝 Creating test booking...')

  // Test the same date parsing logic as the API
  const date = '2025-09-25'
  const startTime = '10:00'
  const endTime = '14:00'

  console.log('Input values:')
  console.log('  date:', date)
  console.log('  startTime:', startTime)
  console.log('  endTime:', endTime)

  // Parse the date and times ensuring no timezone conversion
  const [year, month, day] = date.split('-').map(Number)
  const bookingDate = new Date(year, month - 1, day, 0, 0, 0, 0)
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)
  const startDateTime = new Date(year, month - 1, day, startHour, startMinute, 0, 0)
  const endDateTime = new Date(year, month - 1, day, endHour, endMinute, 0, 0)

  console.log('\nParsed dates:')
  console.log('  bookingDate:', bookingDate)
  console.log('  startDateTime:', startDateTime)
  console.log('  endDateTime:', endDateTime)

  // Find user and desk
  let user = await prisma.user.findFirst({
    where: { email: 'test@example.com' }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        department: 'IT'
      }
    })
    console.log('✅ Created test user')
  }

  const desk = await prisma.desk.findFirst({
    where: { deskNumber: 'D10' }
  })

  if (!desk) {
    console.error('❌ Desk D10 not found')
    return
  }

  // Create booking
  const booking = await prisma.deskBooking.create({
    data: {
      userId: user.id,
      deskId: desk.id,
      date: bookingDate,
      startTime: startDateTime,
      endTime: endDateTime,
      status: 'ACTIVE'
    }
  })

  console.log('\n✅ Created booking with ID:', booking.id)
  console.log('Stored in DB:')
  console.log('  date:', booking.date)
  console.log('  startTime:', booking.startTime)
  console.log('  endTime:', booking.endTime)
}

createTestBooking()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })