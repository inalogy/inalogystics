import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deskId, userId, startTime, endTime, date } = body

    if (!deskId || !userId || !startTime || !endTime || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const startDateTime = new Date(`${date}T${startTime}:00`)
    const endDateTime = new Date(`${date}T${endTime}:00`)

    // Check for conflicting bookings
    const conflictingBooking = await prisma.deskBooking.findFirst({
      where: {
        deskId,
        status: 'CONFIRMED',
        OR: [
          {
            AND: [
              { startTime: { lte: startDateTime } },
              { endTime: { gt: startDateTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endDateTime } },
              { endTime: { gte: endDateTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: startDateTime } },
              { endTime: { lte: endDateTime } }
            ]
          }
        ]
      }
    })

    if (conflictingBooking) {
      return NextResponse.json({ error: 'Desk is already booked for this time slot' }, { status: 409 })
    }

    const booking = await prisma.deskBooking.create({
      data: {
        deskId,
        userId,
        startTime: startDateTime,
        endTime: endDateTime,
        status: 'CONFIRMED'
      },
      include: {
        desk: true,
        user: true
      }
    })

    // Create notification for successful booking
    await prisma.notification.create({
      data: {
        userId,
        type: 'BOOKING_CONFIRMED',
        title: 'Desk Booking Confirmed',
        message: `Your desk ${booking.desk.deskNumber} has been booked for ${date} from ${startTime} to ${endTime}`,
        isRead: false
      }
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const bookings = await prisma.deskBooking.findMany({
      where: {
        userId,
        status: 'CONFIRMED'
      },
      include: {
        desk: true
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}