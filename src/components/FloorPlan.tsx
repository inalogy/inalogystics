'use client'

import { useRef, useEffect, useState } from 'react'

interface Desk {
  id: string
  x: number
  y: number
  width: number
  height: number
  deskNumber: string
  isAvailable: boolean
  hasMonitor?: boolean
  hasStandingDesk?: boolean
}

interface FloorPlanProps {
  desks: Desk[]
  onDeskClick?: (desk: Desk) => void
  selectedDeskId?: string
}

export default function FloorPlan({ desks, onDeskClick, selectedDeskId }: FloorPlanProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredDesk, setHoveredDesk] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw floor outline
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 2
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

    // Draw desks
    desks.forEach(desk => {
      const isHovered = hoveredDesk === desk.id
      const isSelected = selectedDeskId === desk.id

      // Desk fill
      if (isSelected) {
        ctx.fillStyle = '#3b82f6' // Blue for selected
      } else if (!desk.isAvailable) {
        ctx.fillStyle = '#ef4444' // Red for occupied
      } else if (isHovered) {
        ctx.fillStyle = '#10b981' // Green hover
      } else {
        ctx.fillStyle = '#22c55e' // Green for available
      }

      // Draw desk rectangle
      ctx.fillRect(desk.x, desk.y, desk.width, desk.height)

      // Draw desk border
      ctx.strokeStyle = isHovered || isSelected ? '#1f2937' : '#9ca3af'
      ctx.lineWidth = isHovered || isSelected ? 2 : 1
      ctx.strokeRect(desk.x, desk.y, desk.width, desk.height)

      // Draw desk number
      ctx.fillStyle = '#ffffff'
      ctx.font = '12px Inter'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(desk.deskNumber, desk.x + desk.width / 2, desk.y + desk.height / 2)

      // Draw amenity indicators
      if (desk.hasMonitor) {
        ctx.fillStyle = '#3b82f6'
        ctx.fillRect(desk.x + desk.width - 10, desk.y + 2, 8, 8)
      }
      if (desk.hasStandingDesk) {
        ctx.fillStyle = '#8b5cf6'
        ctx.fillRect(desk.x + desk.width - 10, desk.y + 12, 8, 8)
      }
    })
  }, [desks, hoveredDesk, selectedDeskId])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const clickedDesk = desks.find(desk => 
      x >= desk.x && x <= desk.x + desk.width &&
      y >= desk.y && y <= desk.y + desk.height
    )

    if (clickedDesk && onDeskClick) {
      onDeskClick(clickedDesk)
    }
  }

  const handleCanvasMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const hoveredDesk = desks.find(desk => 
      x >= desk.x && x <= desk.x + desk.width &&
      y >= desk.y && y <= desk.y + desk.height
    )

    setHoveredDesk(hoveredDesk?.id || null)
    canvas.style.cursor = hoveredDesk ? 'pointer' : 'default'
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-300 rounded-lg shadow-sm bg-gray-50"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMove}
        onMouseLeave={() => setHoveredDesk(null)}
      />
      <div className="mt-4 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Monitor</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <span>Standing Desk</span>
        </div>
      </div>
    </div>
  )
}