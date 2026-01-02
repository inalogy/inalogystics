import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkBookings() {
  try {
    console.log('Checking bookings for December 17, 2025...\n')

    // Check all desk bookings for Dec 17
    const deskBookings = await prisma.deskBooking.findMany({
      where: {
        date: new Date(2025, 11, 17, 0, 0, 0, 0) // December 17, 2025 (month is 0-indexed)
      },
      include: {
        user: true,
        desk: true
      }
    })

    console.log(`Found ${deskBookings.length} desk bookings for December 17, 2025:`)
    console.log('─'.repeat(80))

    deskBookings.forEach(booking => {
      console.log(`ID: ${booking.id}`)
      console.log(`Desk: ${booking.desk.deskNumber}`)
      console.log(`User: ${booking.user.name} (${booking.user.email})`)
      console.log(`Time: ${booking.startTime} - ${booking.endTime}`)
      console.log(`Status: ${booking.status}`)
      console.log(`Created: ${booking.createdAt}`)
      console.log('─'.repeat(80))
    })

    // Also check the raw date values to see if there are timezone issues
    console.log('\nRaw database query to check date formats:')
    const rawBookings = await prisma.$queryRaw`
      SELECT id, "deskId", date, "startTime", "endTime", status
      FROM "DeskBooking"
      WHERE date::date = '2025-12-17'::date
    `
    console.log(rawBookings)

  } catch (error) {
    console.error('Error checking bookings:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkBookings()
