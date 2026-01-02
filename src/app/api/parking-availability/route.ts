import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const startTime = searchParams.get('startTime')

    if (!date || !startTime) {
      return NextResponse.json({ error: 'Missing date or startTime' }, { status: 400 })
    }

    // Parse date ensuring no timezone conversion
    const [year, month, day] = date.split('-').map(Number)
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const queryDate = new Date(year, month - 1, day, 0, 0, 0, 0)
    const queryStartTime = new Date(year, month - 1, day, startHour, startMinute, 0, 0)

    // Get all parking spaces
    const allSpaces = await prisma.parkingSpace.findMany({
      orderBy: [
        { location: 'asc' },
        { spotNumber: 'asc' }
      ]
    })

    // Get bookings for this date/time
    const bookings = await prisma.parkingBooking.findMany({
      where: {
        date: queryDate,
        startTime: queryStartTime,
        status: 'ACTIVE'
      },
      select: {
        parkingSpaceId: true
      }
    })

    const bookedSpaceIds = new Set(bookings.map(b => b.parkingSpaceId))

    // Mark spaces as available or not
    const spacesWithAvailability = allSpaces.map(space => ({
      id: space.id,
      spotNumber: space.spotNumber,
      location: space.location,
      isAvailable: !bookedSpaceIds.has(space.id)
    }))

    return NextResponse.json(spacesWithAvailability)
  } catch (error) {
    console.error('Error fetching parking availability:', error)
    return NextResponse.json({ error: 'Failed to fetch parking availability' }, { status: 500 })
  }
}
