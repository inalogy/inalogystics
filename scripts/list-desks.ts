import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listDesks() {
  const desks = await prisma.desk.findMany({
    orderBy: { deskNumber: 'asc' }
  })

  console.log(`\n📋 Found ${desks.length} desks in database:\n`)

  desks.forEach(desk => {
    console.log(`  ${desk.deskNumber} - Zone: ${desk.zone}, Shared: ${desk.isShared}`)
  })
}

listDesks()
  .catch((error) => {
    console.error('Error listing desks:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
