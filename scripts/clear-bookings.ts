import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearBookings() {
  console.log('🗑️ Clearing all bookings...')

  const deleted = await prisma.deskBooking.deleteMany()
  console.log(`✅ Deleted ${deleted.count} bookings`)
}

clearBookings()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })