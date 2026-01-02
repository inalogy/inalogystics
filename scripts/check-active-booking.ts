import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkActiveBooking() {
  try {
    console.log('Checking the ACTIVE booking from raw query...\n')

    const booking = await prisma.deskBooking.findUnique({
      where: {
        id: '1e5f8e3c-756b-4670-bc6b-5fb882b19c49'
      },
      include: {
        user: true,
        desk: true
      }
    })

    if (booking) {
      console.log('Booking Details:')
      console.log('─'.repeat(80))
      console.log(`ID: ${booking.id}`)
      console.log(`Desk: ${booking.desk.deskNumber}`)
      console.log(`User: ${booking.user.name} (${booking.user.email})`)
      console.log(`Date: ${booking.date}`)
      console.log(`Date (ISO): ${booking.date.toISOString()}`)
      console.log(`Date (Local): ${booking.date.toLocaleString('en-US', { timeZone: 'Europe/Prague' })}`)
      console.log(`Start Time: ${booking.startTime}`)
      console.log(`Start Time (ISO): ${booking.startTime.toISOString()}`)
      console.log(`End Time: ${booking.endTime}`)
      console.log(`End Time (ISO): ${booking.endTime.toISOString()}`)
      console.log(`Status: ${booking.status}`)
      console.log(`Created: ${booking.createdAt}`)
      console.log('─'.repeat(80))

      // Check what date this actually represents in local time
      const localDate = new Date(booking.date)
      const year = localDate.getFullYear()
      const month = localDate.getMonth() + 1
      const day = localDate.getDate()
      console.log(`\nThis booking is for: ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} (local date extraction)`)
    } else {
      console.log('Booking not found')
    }

    // Also check all ACTIVE bookings for December
    console.log('\n\nAll ACTIVE bookings for December 2025:')
    console.log('─'.repeat(80))
    const decemberBookings = await prisma.deskBooking.findMany({
      where: {
        status: 'ACTIVE',
        date: {
          gte: new Date(2025, 11, 1, 0, 0, 0, 0),
          lt: new Date(2026, 0, 1, 0, 0, 0, 0)
        }
      },
      include: {
        desk: true,
        user: true
      },
      orderBy: {
        date: 'asc'
      }
    })

    decemberBookings.forEach(b => {
      const localDate = new Date(b.date)
      const year = localDate.getFullYear()
      const month = localDate.getMonth() + 1
      const day = localDate.getDate()
      console.log(`${b.desk.deskNumber} - ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} - ${b.user.name}`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkActiveBooking()
