import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const assignedDesks = [
  { deskNumber: 'D14', assignee: 'František Mikuš' },
  { deskNumber: 'D13', assignee: 'Gustáv Pálos' },
  { deskNumber: 'D07', assignee: 'Richard Leckéši' },
  { deskNumber: 'D08', assignee: 'Miroslav Kunovský' },
  { deskNumber: 'D16', assignee: 'Jana Solčianska' },
  { deskNumber: 'D06', assignee: 'Denis Džačko' },
]

async function assignDesks() {
  console.log('🔄 Updating assigned desks...')

  for (const { deskNumber, assignee } of assignedDesks) {
    try {
      const desk = await prisma.desk.findFirst({
        where: { deskNumber }
      })

      if (desk) {
        await prisma.desk.update({
          where: { id: desk.id },
          data: { isShared: false }
        })
        console.log(`✓ Desk ${deskNumber} assigned to ${assignee} (marked as not shared)`)
      } else {
        console.log(`⚠ Desk ${deskNumber} not found in database`)
      }
    } catch (error) {
      console.error(`✗ Error updating desk ${deskNumber}:`, error)
    }
  }

  // Set all other desks as shared
  const assignedDeskNumbers = assignedDesks.map(d => d.deskNumber)
  const otherDesks = await prisma.desk.updateMany({
    where: {
      deskNumber: {
        notIn: assignedDeskNumbers
      }
    },
    data: { isShared: true }
  })

  console.log(`✓ Updated ${otherDesks.count} other desks as shared`)
  console.log('✅ Desk assignment complete!')
}

assignDesks()
  .catch((error) => {
    console.error('Error assigning desks:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
