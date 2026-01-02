import { PrismaClient } from '@prisma/client'
import { format } from 'date-fns'

const prisma = new PrismaClient()

async function debugDates() {
  console.log('🔍 Debug: Checking stored dates...')

  const bookings = await prisma.deskBooking.findMany({
    include: {
      user: true,
      desk: true
    }
  })

  console.log('Bookings found:', bookings.length)

  bookings.forEach((booking, index) => {
    console.log(`\n📅 Booking ${index + 1}:`)
    console.log('  Raw date from DB:', booking.date)
    console.log('  Start time:', booking.startTime)
    console.log('  End time:', booking.endTime)
    console.log('  format(date, "yyyy-MM-dd"):', format(booking.date, 'yyyy-MM-dd'))
    console.log('  format(startTime, "HH:mm"):', format(booking.startTime, 'HH:mm'))
    console.log('  format(endTime, "HH:mm"):', format(booking.endTime, 'HH:mm'))

    // Calculate duration in hours
    const durationMs = booking.endTime.getTime() - booking.startTime.getTime()
    const durationHours = durationMs / (1000 * 60 * 60)
    console.log('  Duration (hours):', durationHours)

    console.log('  User:', booking.user.name)
    console.log('  Desk:', booking.desk.deskNumber)
  })
}

debugDates()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })