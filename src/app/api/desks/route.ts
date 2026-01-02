import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    // Parse date ensuring no timezone conversion
    const [year, month, day] = date.split('-').map(Number)
    const queryDate = new Date(year, month - 1, day, 0, 0, 0, 0)

    // Fetch all desks
    const desks = await prisma.desk.findMany({
      where: {
        isActive: true
      },
      include: {
        bookings: {
          where: {
            date: {
              equals: queryDate
            },
            status: 'ACTIVE'
          },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        deskNumber: 'asc'
      }
    })

    // Transform the data to match the component interface
    const desksWithAvailability = desks.map(desk => {
      if (desk.bookings.length === 0) {
        // No bookings - fully available
        return {
          id: desk.deskNumber,
          x: desk.x,
          y: desk.y,
          deskNumber: desk.deskNumber,
          isAvailable: true,
          occupancyLevel: 'available' as const,
          hasMonitor: desk.hasMonitor,
          hasStandingDesk: desk.hasStandingDesk,
          zone: desk.zone,
          isShared: desk.isShared,
          bookings: desk.bookings
        }
      }

      // Calculate total occupied hours for the day
      const totalOccupiedMs = desk.bookings.reduce((total, booking) => {
        const durationMs = booking.endTime.getTime() - booking.startTime.getTime()
        return total + durationMs
      }, 0)

      const totalOccupiedHours = totalOccupiedMs / (1000 * 60 * 60)

      // Determine occupancy level based on hours
      let occupancyLevel: 'available' | 'partial' | 'occupied'
      let isAvailable: boolean

      if (totalOccupiedHours <= 4) {
        occupancyLevel = 'partial'
        isAvailable = true // Can still book remaining time slots
      } else {
        occupancyLevel = 'occupied'
        isAvailable = false // Fully occupied
      }

      return {
        id: desk.deskNumber,
        x: desk.x,
        y: desk.y,
        deskNumber: desk.deskNumber,
        isAvailable,
        occupancyLevel,
        hasMonitor: desk.hasMonitor,
        hasStandingDesk: desk.hasStandingDesk,
        zone: desk.zone,
        isShared: desk.isShared,
        bookings: desk.bookings,
        occupiedHours: totalOccupiedHours
      }
    })

    return NextResponse.json(desksWithAvailability)
  } catch (error) {
    console.error('Error fetching desks:', error)
    return NextResponse.json({ error: 'Failed to fetch desks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deskNumber, floor, zone, hasMonitor, hasStandingDesk, x, y } = body

    const desk = await prisma.desk.create({
      data: {
        deskNumber,
        floor,
        zone,
        hasMonitor: hasMonitor || true,
        hasStandingDesk: hasStandingDesk || false,
        x,
        y
      }
    })

    return NextResponse.json(desk)
  } catch (error) {
    console.error('Error creating desk:', error)
    return NextResponse.json({ error: 'Failed to create desk' }, { status: 500 })
  }
}