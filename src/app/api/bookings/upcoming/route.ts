import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from session
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json([])
    }

    // Get today's date at midnight
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Fetch upcoming active bookings
    const bookings = await prisma.deskBooking.findMany({
      where: {
        userId: user.id,
        date: {
          gte: today
        },
        status: 'ACTIVE'
      },
      include: {
        desk: {
          select: {
            deskNumber: true,
            zone: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Format bookings for response
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      date: booking.date.toISOString().split('T')[0],
      startTime: booking.startTime.toISOString().split('T')[1].substring(0, 5),
      endTime: booking.endTime.toISOString().split('T')[1].substring(0, 5),
      deskNumber: booking.desk.deskNumber,
      zone: booking.desk.zone
    }))

    return NextResponse.json(formattedBookings)
  } catch (error) {
    console.error('Error fetching upcoming bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
