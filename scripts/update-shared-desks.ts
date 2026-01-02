import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Desks that should be non-shared (assigned/private)
const nonSharedDesks = ['D01', 'D02', 'D03', 'D05', 'D07', 'D09', 'D14', 'D16']

async function updateSharedStatus() {
  console.log('🔧 Updating desk sharing status...')

  // Set specified desks as non-shared (isShared: false)
  const updateNonShared = await prisma.desk.updateMany({
    where: {
      deskNumber: {
        in: nonSharedDesks
      }
    },
    data: {
      isShared: false
    }
  })

  console.log(`✅ Updated ${updateNonShared.count} desks to non-shared: ${nonSharedDesks.join(', ')}`)

  // Set all other desks as shared (isShared: true)
  const updateShared = await prisma.desk.updateMany({
    where: {
      deskNumber: {
        notIn: nonSharedDesks
      }
    },
    data: {
      isShared: true
    }
  })

  console.log(`✅ Updated ${updateShared.count} desks to shared`)

  // Show summary
  const sharedCount = await prisma.desk.count({ where: { isShared: true } })
  const nonSharedCount = await prisma.desk.count({ where: { isShared: false } })

  console.log(`📊 Summary: ${sharedCount} shared desks, ${nonSharedCount} non-shared desks`)
}

updateSharedStatus()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })