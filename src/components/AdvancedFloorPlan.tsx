'use client'

import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react'

// Helper function to format date in local timezone as YYYY-MM-DD
const formatDateLocal = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// Helper function to format time from ISO string to HH:MM
const formatTimeFromISO = (isoString: string): string => {
  const date = new Date(isoString)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

interface Booking {
  id: string
  userId: string
  deskId: string
  date: string
  startTime: string
  endTime: string
  status: string
  user?: {
    name: string
    email: string
  }
}

interface Desk {
  id: string
  x: number // Percentage coordinates
  y: number
  deskNumber: string
  isAvailable: boolean
  occupancyLevel?: 'available' | 'partial' | 'occupied'
  hasMonitor?: boolean
  hasStandingDesk?: boolean
  zone?: string
  isShared: boolean
  occupiedHours?: number
  bookings?: Booking[]
}

interface AdvancedFloorPlanProps {
  onDeskClick?: (desk: Desk) => void
  selectedDeskId?: string
  selectedDate?: Date
  userEmail?: string
}

export interface AdvancedFloorPlanRef {
  refresh: () => void
}

const AdvancedFloorPlan = forwardRef<AdvancedFloorPlanRef, AdvancedFloorPlanProps>(
  ({ onDeskClick, selectedDeskId, selectedDate, userEmail }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [desks, setDesks] = useState<Desk[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch desks from API
  const fetchDesks = useCallback(async () => {
    try {
      setLoading(true)
      const dateParam = selectedDate
        ? `?date=${formatDateLocal(selectedDate)}`
        : ''
      const response = await fetch(`/api/desks${dateParam}`)
      if (response.ok) {
        const fetchedDesks = await response.json()
        setDesks(fetchedDesks)
      } else {
        console.error('Failed to fetch desks')
        // Fallback to hardcoded data if API fails
        setDesks(detectedDesks)
      }
    } catch (error) {
      console.error('Error fetching desks:', error)
      // Fallback to hardcoded data if API fails
      setDesks(detectedDesks)
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchDesks()
  }, [fetchDesks])

  // Expose refresh method to parent
  useImperativeHandle(ref, () => ({
    refresh: fetchDesks
  }))

  // Fallback desk data (keeping the original data as backup)
  const detectedDesks: Desk[] = [
    // FIRST CLUSTER (2x3 desks) - Left cluster
    { id: 'D01', x: 14.8, y: 31.0, deskNumber: 'D01', isAvailable: true, hasMonitor: true, hasStandingDesk: true, zone: 'Open Space', isShared: true },
    { id: 'D02', x: 18.4, y: 31.0, deskNumber: 'D02', isAvailable: false, hasMonitor: true, hasStandingDesk: true, zone: 'Open Space', isShared: true },
    { id: 'D03', x: 14.8, y: 40.5, deskNumber: 'D03', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Open Space', isShared: true },
    { id: 'D04', x: 18.4, y: 40.5, deskNumber: 'D04', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Open Space', isShared: true },
    { id: 'D05', x: 14.8, y: 50.0, deskNumber: 'D05', isAvailable: false, hasMonitor: true, hasStandingDesk: false, zone: 'Open Space', isShared: true },
    { id: 'D06', x: 18.4, y: 50.0, deskNumber: 'D06', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Open Space', isShared: true },

    // SECOND CLUSTER (2x3 desks) - Middle-left cluster
    { id: 'D07', x: 33.0, y: 31.0, deskNumber: 'D07', isAvailable: true, hasMonitor: true, hasStandingDesk: true, zone: 'Open Space', isShared: true },
    { id: 'D08', x: 36.5, y: 31.0, deskNumber: 'D08', isAvailable: false, hasMonitor: true, hasStandingDesk: true, zone: 'Open Space', isShared: true },
    { id: 'D09', x: 33.0, y: 40.5, deskNumber: 'D09', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Open Space', isShared: true },
    { id: 'D10', x: 36.5, y: 40.5, deskNumber: 'D10', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Open Space', isShared: true },
    { id: 'D11', x: 33.0, y: 50.0, deskNumber: 'D11', isAvailable: false, hasMonitor: true, hasStandingDesk: false, zone: 'Open Space', isShared: true },
    { id: 'D12', x: 36.5, y: 50.0, deskNumber: 'D12', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Open Space', isShared: true },

    // THIRD CLUSTER (2x3 desks) - Center cluster
    { id: 'D13', x: 49.7, y: 31.0, deskNumber: 'D13', isAvailable: false, hasMonitor: true, hasStandingDesk: true, zone: 'Open Space', isShared: true },
    { id: 'D14', x: 53.2, y: 31.0, deskNumber: 'D14', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Open Space', isShared: true },
    { id: 'D15', x: 49.7, y: 40.5, deskNumber: 'D15', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Open Space', isShared: true },
    { id: 'D16', x: 53.2, y: 40.5, deskNumber: 'D16', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Open Space', isShared: true },
    { id: 'D17', x: 49.7, y: 50.0, deskNumber: 'D17', isAvailable: false, hasMonitor: true, hasStandingDesk: true, zone: 'Open Space', isShared: true },
    { id: 'D18', x: 53.2, y: 50.0, deskNumber: 'D18', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Open Space', isShared: true },

    // FOURTH CLUSTER (2x3 desks) - Right cluster (Room 3959)
    { id: 'D19', x: 86.1, y: 32.0, deskNumber: 'D19', isAvailable: true, hasMonitor: true, hasStandingDesk: true, zone: 'Private Office', isShared: true },
    { id: 'D20', x: 89.5, y: 32.0, deskNumber: 'D20', isAvailable: false, hasMonitor: true, hasStandingDesk: true, zone: 'Private Office', isShared: true },
    { id: 'D21', x: 86.1, y: 41.5, deskNumber: 'D21', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Private Office', isShared: true },
    { id: 'D22', x: 89.5, y: 41.5, deskNumber: 'D22', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Private Office', isShared: true },
    { id: 'D23', x: 86.1, y: 51.0, deskNumber: 'D23', isAvailable: false, hasMonitor: true, hasStandingDesk: false, zone: 'Private Office', isShared: true },
    { id: 'D24', x: 89.5, y: 51.0, deskNumber: 'D24', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Private Office', isShared: true },

    // FIFTH CLUSTER - Lower cluster
    { id: 'D25', x: 35.1, y: 74.0, deskNumber: 'D25', isAvailable: true, hasMonitor: true, hasStandingDesk: true, zone: 'Open Space', isShared: true },
    { id: 'D26', x: 38.5, y: 74.7, deskNumber: 'D26', isAvailable: false, hasMonitor: true, hasStandingDesk: true, zone: 'Open Space', isShared: true },
  ]



  // Handle zoom with proper transform origin
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY * -0.01
    const newScale = Math.min(Math.max(0.5, scale + delta), 3)

    // Calculate zoom center point
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      const centerX = (e.clientX - rect.left - pan.x) / scale
      const centerY = (e.clientY - rect.top - pan.y) / scale

      // Adjust pan to zoom towards mouse position
      const newPan = {
        x: pan.x - centerX * (newScale - scale),
        y: pan.y - centerY * (newScale - scale)
      }

      setPan(newPan)
    }

    setScale(newScale)
  }, [scale, pan])

  // Attach wheel event listener with passive: false
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  // Handle pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Allow panning from anywhere in the container, not just the background
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    e.preventDefault()
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return

    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
    e.preventDefault()
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Handle desk click
  const handleDeskClick = useCallback((desk: Desk, e: React.MouseEvent) => {
    e.stopPropagation()
    if (desk.isAvailable && desk.isShared && onDeskClick) {
      onDeskClick(desk)
    }
  }, [onDeskClick])

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="relative overflow-hidden bg-gray-50 rounded-lg border-2 border-gray-200 select-none h-[400px] sm:h-[500px] lg:h-[600px]"
        style={{
          cursor: isDragging ? 'grabbing' : (scale > 1 ? 'grab' : 'default')
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Floor Plan Image */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            width: '100%',
            height: '100%'
          }}
        >
          {/* Image Display */}
          <img
            src="/floorplan.jpg"
            alt="Digital Park II Floor Plan"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />
          
          {/* Interactive desk overlays */}
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-gray-500">Loading desks...</div>
            </div>
          ) : (
            desks.map(desk => {
              const isSelected = selectedDeskId === desk.id
              // Check if this desk is booked by the current user
              const isBookedByUser = userEmail && desk.bookings && desk.bookings.some(
                booking => booking.user?.email === userEmail
              )

              return (
              <div
                key={desk.id}
                className="absolute group"
                style={{
                  left: `${desk.x}%`,
                  top: `${desk.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={(e) => handleDeskClick(desk, e)}
              >
                {/* Simple colored dot with desk ID */}
                <div
                  className={`rounded-full shadow-md transition-all duration-200 flex items-center justify-center ${
                    isSelected
                      ? 'w-6 h-6 ring-4 ring-[#35C6F4] ring-opacity-50'
                      : 'w-5 h-5'
                  } ${
                    isBookedByUser
                      ? 'bg-[#35C6F4] hover:bg-[#2AB5E3] cursor-pointer hover:w-6 hover:h-6' // Booked by current user (blue)
                      : !desk.isShared
                      ? 'bg-gray-500 cursor-not-allowed' // Non-shared desks (assigned)
                      : desk.occupancyLevel === 'occupied'
                      ? 'bg-red-500 hover:bg-red-600 cursor-not-allowed' // Fully occupied (>4 hours)
                      : desk.occupancyLevel === 'partial'
                      ? 'bg-orange-500 hover:bg-orange-600 cursor-pointer hover:w-6 hover:h-6' // Partially occupied (<=4 hours)
                      : 'bg-green-500 hover:bg-green-600 cursor-pointer hover:w-6 hover:h-6' // Available
                  }`}
                >
                  {/* Pulse animation for available and partially occupied shared desks */}
                  {desk.isAvailable && desk.isShared && desk.occupancyLevel === 'available' && (
                    <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
                  )}
                  {desk.isAvailable && desk.isShared && desk.occupancyLevel === 'partial' && (
                    <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-75"></div>
                  )}
                  {/* Desk ID text */}
                  <span className="text-white text-xs font-bold z-10 relative">
                    {desk.deskNumber.replace('D', '')}
                  </span>
                </div>

                {/* Hover tooltip */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 min-w-max">
                  <div className="font-semibold">{desk.deskNumber} - {desk.zone}</div>

                  {isBookedByUser && (
                    <div className="text-[#35C6F4] mt-1 font-semibold">Booked by You</div>
                  )}

                  {!isBookedByUser && !desk.isShared && (
                    <div className="text-gray-300 mt-1">Assigned Desk</div>
                  )}

                  {!isBookedByUser && desk.isShared && desk.occupancyLevel === 'available' && (
                    <div className="text-green-300 mt-1">Available</div>
                  )}

                  {desk.isShared && (desk.occupancyLevel === 'partial' || desk.occupancyLevel === 'occupied') && desk.bookings && desk.bookings.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className={`font-medium ${desk.occupancyLevel === 'partial' ? 'text-orange-300' : 'text-red-300'}`}>
                        {desk.occupancyLevel === 'partial' ? 'Partially occupied' : 'Fully occupied'} ({desk.occupiedHours?.toFixed(1)}h)
                      </div>
                      {desk.bookings.map((booking, index) => (
                        <div key={booking.id} className="text-gray-200 border-t border-gray-700 pt-1 mt-1">
                          <div className="font-medium">{booking.user?.name || 'Unknown User'}</div>
                          <div className="text-gray-400">
                            {formatTimeFromISO(booking.startTime)} - {formatTimeFromISO(booking.endTime)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )
          })
          )}
        </div>
      </div>
      
      {/* Controls */}
      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <button
            onClick={() => setScale(s => Math.max(0.5, s - 0.2))}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors font-medium text-sm"
          >
            Zoom Out
          </button>
          <span className="text-xs sm:text-sm text-gray-600 min-w-12 sm:min-w-16 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale(s => Math.min(3, s + 0.2))}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors font-medium text-sm"
          >
            Zoom In
          </button>
          <button
            onClick={() => { setScale(1); setPan({ x: 0, y: 0 }) }}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#35C6F4] text-white rounded-md hover:bg-[#2AB5E3] transition-colors font-medium text-sm"
          >
            Reset View
          </button>
        </div>

        <div className="text-xs sm:text-sm text-gray-600">
          <span className="font-medium">Digital Park II - 6th Floor</span> •{' '}
          <span className="font-medium">{loading ? '...' : desks.length} desks</span> •{' '}
          <span className="text-green-600 font-medium">{loading ? '...' : desks.filter(d => d.isAvailable && d.isShared).length} available</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-4 lg:gap-6 text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#35C6F4] rounded-full"></div>
          <span>Booked by You</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-500 rounded-full"></div>
          <span className="whitespace-nowrap">Partial (≤4h)</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full"></div>
          <span className="whitespace-nowrap">Occupied ({'>'}4h)</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-500 rounded-full"></div>
          <span>Assigned</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full ring-2 sm:ring-4 ring-[#35C6F4] ring-opacity-50"></div>
          <span>Selected</span>
        </div>
        <div className="col-span-2 text-[10px] sm:text-xs text-gray-500 sm:ml-auto">
          Click on green/orange dots to book
        </div>
      </div>
    </div>
  )
})

AdvancedFloorPlan.displayName = 'AdvancedFloorPlan'

export default AdvancedFloorPlan