import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/auth'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from session
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { deskId, date, dates, startTime, endTime, needsParking, selectedParkingSpotId } = body

    // Support both single date and multiple dates
    const datesToBook = dates ? dates : (date ? [date] : [])

    // Validate required fields
    if (!deskId || datesToBook.length === 0 || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Find the desk
    const desk = await prisma.desk.findFirst({
      where: { deskNumber: deskId }
    })

    if (!desk) {
      return NextResponse.json({ error: 'Desk not found' }, { status: 404 })
    }

    // Check if desk is shared (only shared desks can be booked)
    if (!desk.isShared) {
      return NextResponse.json({ error: 'This desk is assigned and cannot be booked' }, { status: 400 })
    }

    // Get user from database using authenticated email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    const successfulBookings = []
    const failedBookings = []

    // Process each date
    for (const dateString of datesToBook) {
      try {
        // Parse the date ensuring no timezone conversion
        const [year, month, day] = dateString.split('-').map(Number)
        const bookingDate = new Date(year, month - 1, day, 0, 0, 0, 0)
        const startDateTime = new Date(year, month - 1, day, startHour, startMinute, 0, 0)
        const endDateTime = new Date(year, month - 1, day, endHour, endMinute, 0, 0)

        console.log(`[BOOKING DEBUG] Attempting to book:`)
        console.log(`  Date string: ${dateString}`)
        console.log(`  Parsed date: ${bookingDate.toString()}`)
        console.log(`  Date (ISO): ${bookingDate.toISOString()}`)
        console.log(`  Start time: ${startDateTime.toISOString()}`)
        console.log(`  End time: ${endDateTime.toISOString()}`)
        console.log(`  Desk: ${desk.deskNumber}`)

        // Check for existing desk booking on this date
        const existingDeskBooking = await prisma.deskBooking.findFirst({
          where: {
            deskId: desk.id,
            date: bookingDate,
            status: 'ACTIVE'
          }
        })

        if (existingDeskBooking) {
          console.log(`[BOOKING DEBUG] Found existing booking:`, existingDeskBooking)
          failedBookings.push({
            date: dateString,
            reason: 'Desk is already booked for this date'
          })
          continue
        } else {
          console.log(`[BOOKING DEBUG] No existing booking found for this desk/date`)
        }

        // Check if user already has a booking for this date
        const userExistingBooking = await prisma.deskBooking.findFirst({
          where: {
            userId: user.id,
            date: bookingDate,
            status: 'ACTIVE'
          },
          include: {
            desk: {
              select: {
                deskNumber: true
              }
            }
          }
        })

        if (userExistingBooking) {
          failedBookings.push({
            date: dateString,
            reason: `You already have a booking for Desk ${userExistingBooking.desk.deskNumber}`
          })
          continue
        }

        // Create the desk booking
        const booking = await prisma.deskBooking.create({
          data: {
            userId: user.id,
            deskId: desk.id,
            date: bookingDate,
            startTime: startDateTime,
            endTime: endDateTime,
            status: 'ACTIVE'
          },
          include: {
            desk: {
              select: {
                deskNumber: true,
                zone: true
              }
            }
          }
        })

        let parkingInfo = null

        // Handle parking booking if requested
        if (needsParking) {
          console.log(`[PARKING DEBUG] needsParking: ${needsParking}, selectedParkingSpotId: ${selectedParkingSpotId}`)
          let parkingSpaceToBook = null

          // If user selected a specific spot, try to use it
          if (selectedParkingSpotId) {
            console.log(`[PARKING DEBUG] Looking for parking spot with ID: ${selectedParkingSpotId}`)
            // Verify the selected spot is available
            const selectedSpot = await prisma.parkingSpace.findFirst({
              where: {
                id: selectedParkingSpotId,
                bookings: {
                  none: {
                    date: bookingDate,
                    startTime: startDateTime,
                    status: 'ACTIVE'
                  }
                }
              }
            })

            console.log(`[PARKING DEBUG] Found selected spot:`, selectedSpot)
            if (selectedSpot) {
              parkingSpaceToBook = selectedSpot
            } else {
              console.log(`[PARKING DEBUG] Selected spot not available or not found`)
            }
          } else {
            console.log(`[PARKING DEBUG] No specific spot selected, finding any available spot`)
            // No specific spot selected, find any available spot
            parkingSpaceToBook = await prisma.parkingSpace.findFirst({
              where: {
                bookings: {
                  none: {
                    date: bookingDate,
                    startTime: startDateTime,
                    status: 'ACTIVE'
                  }
                }
              }
            })
            console.log(`[PARKING DEBUG] Found auto-assigned spot:`, parkingSpaceToBook)
          }

          if (parkingSpaceToBook) {
            console.log(`[PARKING DEBUG] Creating parking booking for spot: ${parkingSpaceToBook.spotNumber}`)
            const parkingBooking = await prisma.parkingBooking.create({
              data: {
                userId: user.id,
                parkingSpaceId: parkingSpaceToBook.id,
                date: bookingDate,
                startTime: startDateTime,
                endTime: endDateTime,
                status: 'ACTIVE'
              },
              include: {
                parkingSpace: {
                  select: {
                    spotNumber: true,
                    location: true
                  }
                }
              }
            })

            parkingInfo = {
              spotNumber: parkingBooking.parkingSpace.spotNumber,
              location: parkingBooking.parkingSpace.location
            }
            console.log(`[PARKING DEBUG] Parking booking created successfully:`, parkingInfo)
          } else {
            console.log(`[PARKING DEBUG] No parking space available to book`)
          }
        } else {
          console.log(`[PARKING DEBUG] Parking not requested`)
        }

        successfulBookings.push({
          date: dateString,
          deskNumber: booking.desk.deskNumber,
          zone: booking.desk.zone,
          parking: parkingInfo
        })
      } catch (error: any) {
        console.error(`Error booking date ${dateString}:`, error)

        let errorReason = 'Failed to create booking'

        // Check if it's a Prisma unique constraint error
        if (error.code === 'P2002') {
          const fields = error.meta?.target || []
          console.log(`[BOOKING DEBUG] Unique constraint failed on fields:`, fields)

          if (fields.includes('deskId') && fields.includes('date') && fields.includes('startTime')) {
            errorReason = 'This desk is already booked for the selected date and time'
          } else if (fields.includes('userId') && fields.includes('date')) {
            errorReason = 'You already have a booking for this date'
          } else {
            errorReason = `Booking conflict (${fields.join(', ')})`
          }
        }

        failedBookings.push({
          date: dateString,
          reason: errorReason
        })
      }
    }

    return NextResponse.json({
      success: successfulBookings.length > 0,
      bookings: successfulBookings,
      failed: failedBookings
    })

  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}