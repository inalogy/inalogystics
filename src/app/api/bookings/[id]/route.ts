import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/auth'

const prisma = new PrismaClient()

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user from session
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookingId = params.id

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find the booking
    const booking = await prisma.deskBooking.findUnique({
      where: { id: bookingId },
      include: {
        desk: {
          select: {
            deskNumber: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Verify the booking belongs to the user
    if (booking.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to cancel this booking' }, { status: 403 })
    }

    // Update booking status to CANCELLED
    await prisma.deskBooking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' }
    })

    // Also cancel any associated parking booking for the same date
    await prisma.parkingBooking.updateMany({
      where: {
        userId: user.id,
        date: booking.date,
        status: 'ACTIVE'
      },
      data: { status: 'CANCELLED' }
    })

    return NextResponse.json({
      success: true,
      message: `Booking for desk ${booking.desk.deskNumber} cancelled successfully`
    })

  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
  }
}
