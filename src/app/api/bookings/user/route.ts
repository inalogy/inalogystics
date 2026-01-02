import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { format, startOfWeek, endOfWeek, addDays } from 'date-fns'
import { auth } from '@/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from session
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const weekStart = searchParams.get('weekStart')

    if (!weekStart) {
      return NextResponse.json({ error: 'weekStart parameter is required' }, { status: 400 })
    }

    const startDate = new Date(weekStart)
    const endDate = endOfWeek(startDate, { weekStartsOn: 1 })

    // Get user from database using authenticated email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      // Return empty bookings if user doesn't exist yet
      return NextResponse.json([])
    }

    // Fetch bookings for the week
    const bookings = await prisma.deskBooking.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate
        },
        status: 'ACTIVE'
      },
      include: {
        desk: {
          select: {
            deskNumber: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Fetch parking bookings for the week
    const parkingBookings = await prisma.parkingBooking.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate
        },
        status: 'ACTIVE'
      },
      include: {
        parkingSpace: {
          select: {
            spotNumber: true,
            location: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Transform to the format expected by WeekSelector
    const weekBookings = []

    // Create entries for each day of the week
    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i)
      const dayString = format(day, 'yyyy-MM-dd')

      const dayBooking = bookings.find(booking =>
        format(booking.date, 'yyyy-MM-dd') === dayString
      )

      const dayParkingBooking = parkingBookings.find(booking =>
        format(booking.date, 'yyyy-MM-dd') === dayString
      )

      weekBookings.push({
        date: dayString,
        hasBooking: !!dayBooking,
        deskNumber: dayBooking?.desk.deskNumber,
        bookingId: dayBooking?.id,
        startTime: dayBooking?.startTime ? format(dayBooking.startTime, 'HH:mm') : undefined,
        endTime: dayBooking?.endTime ? format(dayBooking.endTime, 'HH:mm') : undefined,
        parkingSpot: dayParkingBooking?.parkingSpace.spotNumber,
        parkingLocation: dayParkingBooking?.parkingSpace.location
      })
    }

    return NextResponse.json(weekBookings)
  } catch (error) {
    console.error('Error fetching user bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch user bookings' }, { status: 500 })
  }
}