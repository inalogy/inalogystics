'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'

interface Desk {
  id: string
  x: number // Percentage from left
  y: number // Percentage from top
  deskNumber: string
  isAvailable: boolean
  hasMonitor?: boolean
  hasStandingDesk?: boolean
  zone?: string
}

interface InteractiveFloorPlanProps {
  desks: Desk[]
  onDeskClick?: (desk: Desk) => void
  selectedDeskId?: string
}

export default function InteractiveFloorPlan({ 
  desks, 
  onDeskClick, 
  selectedDeskId 
}: InteractiveFloorPlanProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const handleDeskClick = (desk: Desk) => {
    if (desk.isAvailable && onDeskClick) {
      onDeskClick(desk)
    }
  }

  return (
    <div className="relative">
      {/* PDF Viewer - Fallback for non-image formats */}
      <div className="relative bg-gray-50 rounded-lg overflow-hidden">
        <div 
          ref={containerRef}
          className="relative w-full"
          style={{ aspectRatio: '4/3', minHeight: '600px' }}
        >
          {/* PDF Background */}
          <iframe
            src="/floorplan.pdf"
            className="absolute inset-0 w-full h-full border-0"
            title="Office Floor Plan"
          />
          
          {/* Interactive Desk Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {desks.map(desk => {
              const isSelected = selectedDeskId === desk.id
              const isHovered = false // You can add hover state if needed
              
              return (
                <div
                  key={desk.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'scale-125 z-20' 
                      : isHovered 
                        ? 'scale-110 z-10' 
                        : 'z-5'
                  }`}
                  style={{
                    left: `${desk.x}%`,
                    top: `${desk.y}%`,
                  }}
                  onClick={() => handleDeskClick(desk)}
                >
                  {/* Desk Marker */}
                  <div
                    className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow-lg transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#35C6F4] border-[#35C6F4] text-white'
                        : !desk.isAvailable
                          ? 'bg-red-500 border-red-600 text-white cursor-not-allowed'
                          : 'bg-white border-gray-400 text-gray-700 hover:border-[#35C6F4] hover:bg-[#35C6F4] hover:text-white'
                    }`}
                  >
                    <span className="text-[10px]">{desk.deskNumber}</span>
                    
                    {/* Amenity Indicators */}
                    {desk.hasMonitor && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-[8px]">M</span>
                      </div>
                    )}
                    {desk.hasStandingDesk && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-[8px]">S</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Desk Info Tooltip */}
                  {isSelected && (
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 border border-gray-200 min-w-32 z-30">
                      <div className="text-sm font-semibold text-gray-900">{desk.deskNumber}</div>
                      {desk.zone && (
                        <div className="text-xs text-gray-600">Zone: {desk.zone}</div>
                      )}
                      <div className="mt-1 space-y-1">
                        {desk.hasMonitor && (
                          <div className="text-xs text-blue-600">✓ Monitor</div>
                        )}
                        {desk.hasStandingDesk && (
                          <div className="text-xs text-purple-600">✓ Standing Desk</div>
                        )}
                      </div>
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded-full"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 border-2 border-red-600 rounded-full"></div>
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#35C6F4] border-2 border-[#35C6F4] rounded-full"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">M</div>
            <div className="w-3 h-3 bg-purple-500 rounded-full text-white text-xs flex items-center justify-center">S</div>
          </div>
          <span>Monitor / Standing</span>
        </div>
      </div>
    </div>
  )
}