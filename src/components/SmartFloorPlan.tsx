'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

interface Desk {
  id: string
  x: number // Absolute coordinates from PDF
  y: number
  width: number
  height: number
  deskNumber: string
  isAvailable: boolean
  hasMonitor?: boolean
  hasStandingDesk?: boolean
  zone?: string
}

interface SmartFloorPlanProps {
  onDeskClick?: (desk: Desk) => void
  selectedDeskId?: string
}

interface DetectedRectangle {
  x: number
  y: number
  width: number
  height: number
  id: string
}

export default function SmartFloorPlan({ onDeskClick, selectedDeskId }: SmartFloorPlanProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [page, setPage] = useState<any>(null)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [detectedDesks, setDetectedDesks] = useState<Desk[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load PDF.js dynamically
  useEffect(() => {
    const loadPdfJs = async () => {
      if (typeof window !== 'undefined') {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
        
        try {
          const pdf = await pdfjsLib.getDocument('/floorplan.pdf').promise
          const pdfPage = await pdf.getPage(1)
          setPdfDoc(pdf)
          setPage(pdfPage)
          setIsLoading(false)
        } catch (error) {
          console.error('Error loading PDF:', error)
          setIsLoading(false)
        }
      }
    }

    loadPdfJs()
  }, [])

  // Detect rectangular objects in the PDF and convert to desks
  const detectDesksFromPDF = useCallback(async () => {
    if (!page || !canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')!
    
    // Get viewport and render PDF
    const viewport = page.getViewport({ scale: 2 })
    canvas.width = viewport.width
    canvas.height = viewport.height
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise

    // Get image data for analysis
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const detectedRects = await analyzeImageForRectangles(imageData, canvas.width, canvas.height)
    
    // Convert detected rectangles to desk objects
    const desks: Desk[] = detectedRects.map((rect, index) => ({
      id: `desk-${index + 1}`,
      x: rect.x / canvas.width * 100, // Convert to percentage
      y: rect.y / canvas.height * 100,
      width: rect.width,
      height: rect.height,
      deskNumber: `D${String(index + 1).padStart(2, '0')}`,
      isAvailable: Math.random() > 0.3,
      hasMonitor: Math.random() > 0.5,
      hasStandingDesk: Math.random() > 0.7,
      zone: getZoneFromPosition(rect.x / canvas.width, rect.y / canvas.height)
    }))

    setDetectedDesks(desks)
  }, [page])

  // Simple rectangle detection algorithm
  const analyzeImageForRectangles = async (
    imageData: ImageData, 
    width: number, 
    height: number
  ): Promise<DetectedRectangle[]> => {
    const rectangles: DetectedRectangle[] = []
    const data = imageData.data
    const visited = new Set<string>()
    
    // Convert to grayscale and detect edges
    const threshold = 200
    
    for (let y = 10; y < height - 10; y += 5) {
      for (let x = 10; x < width - 10; x += 5) {
        const key = `${x},${y}`
        if (visited.has(key)) continue
        
        const idx = (y * width + x) * 4
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
        
        // Look for potential desk rectangles (darker areas that might be furniture)
        if (brightness < threshold) {
          const rect = findRectangleFromPoint(data, width, height, x, y, brightness, visited)
          if (rect && rect.width > 20 && rect.height > 15 && rect.width < 100 && rect.height < 80) {
            rectangles.push({
              ...rect,
              id: `rect-${rectangles.length}`
            })
          }
        }
      }
    }
    
    return rectangles.slice(0, 25) // Limit to 25 desks
  }

  // Find rectangle boundaries from a starting point
  const findRectangleFromPoint = (
    data: Uint8ClampedArray,
    width: number,
    height: number,
    startX: number,
    startY: number,
    targetBrightness: number,
    visited: Set<string>
  ): DetectedRectangle | null => {
    let minX = startX, maxX = startX
    let minY = startY, maxY = startY
    const tolerance = 50
    
    // Expand bounds to find rectangle edges
    for (let x = startX; x < width - 5; x++) {
      const idx = (startY * width + x) * 4
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
      if (Math.abs(brightness - targetBrightness) < tolerance) {
        maxX = x
        visited.add(`${x},${startY}`)
      } else break
    }
    
    for (let x = startX; x > 5; x--) {
      const idx = (startY * width + x) * 4
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
      if (Math.abs(brightness - targetBrightness) < tolerance) {
        minX = x
        visited.add(`${x},${startY}`)
      } else break
    }
    
    for (let y = startY; y < height - 5; y++) {
      const idx = (y * width + startX) * 4
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
      if (Math.abs(brightness - targetBrightness) < tolerance) {
        maxY = y
        visited.add(`${startX},${y}`)
      } else break
    }
    
    for (let y = startY; y > 5; y--) {
      const idx = (y * width + startX) * 4
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
      if (Math.abs(brightness - targetBrightness) < tolerance) {
        minY = y
        visited.add(`${startX},${y}`)
      } else break
    }
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      id: ''
    }
  }

  const getZoneFromPosition = (x: number, y: number): string => {
    if (y < 0.33) return 'North Wing'
    if (y > 0.66) return 'South Wing'
    return 'Central Area'
  }

  // Handle zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY * -0.01
    const newScale = Math.min(Math.max(0.5, scale + delta), 3)
    setScale(newScale)
  }, [scale])

  // Handle pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Handle desk click
  const handleDeskClick = useCallback((desk: Desk, e: React.MouseEvent) => {
    e.stopPropagation()
    if (desk.isAvailable && onDeskClick) {
      onDeskClick(desk)
    }
  }, [onDeskClick])

  // Render PDF and desks
  useEffect(() => {
    if (page && canvasRef.current) {
      detectDesksFromPDF()
    }
  }, [page, detectDesksFromPDF])

  // Render the PDF on canvas
  useEffect(() => {
    if (!page || !canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')!
    const viewport = page.getViewport({ scale: scale * 2 })
    
    canvas.width = viewport.width
    canvas.height = viewport.height
    
    page.render({
      canvasContext: context,
      viewport: viewport
    })
  }, [page, scale])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#35C6F4] mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing floorplan and detecting desks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className="relative overflow-hidden bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing"
        style={{ height: '600px' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          <canvas
            ref={canvasRef}
            className="block max-w-none"
          />
          
          {/* Interactive desk overlays */}
          {detectedDesks.map(desk => {
            const isSelected = selectedDeskId === desk.id
            return (
              <div
                key={desk.id}
                className={`absolute cursor-pointer transition-all duration-200 ${
                  isSelected ? 'z-20' : 'z-10'
                }`}
                style={{
                  left: `${desk.x}%`,
                  top: `${desk.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={(e) => handleDeskClick(desk, e)}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow-lg transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#35C6F4] border-[#35C6F4] text-white scale-125'
                      : !desk.isAvailable
                        ? 'bg-red-500 border-red-600 text-white'
                        : 'bg-white border-gray-400 text-gray-700 hover:border-[#35C6F4] hover:bg-[#35C6F4] hover:text-white hover:scale-110'
                  }`}
                >
                  <span className="text-[10px]">{desk.deskNumber.slice(-2)}</span>
                </div>
                
                {/* Amenity indicators */}
                {desk.hasMonitor && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                )}
                {desk.hasStandingDesk && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-500 rounded-full"></div>
                )}
                
                {/* Tooltip for selected desk */}
                {isSelected && (
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 border border-gray-200 min-w-32 z-30">
                    <div className="text-sm font-semibold text-gray-900">{desk.deskNumber}</div>
                    {desk.zone && <div className="text-xs text-gray-600">{desk.zone}</div>}
                    <div className="mt-1 space-y-1">
                      {desk.hasMonitor && <div className="text-xs text-blue-600">✓ Monitor</div>}
                      {desk.hasStandingDesk && <div className="text-xs text-purple-600">✓ Standing</div>}
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
      
      {/* Controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setScale(s => Math.max(0.5, s - 0.2))}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Zoom Out
          </button>
          <span className="text-sm text-gray-600">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale(s => Math.min(3, s + 0.2))}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Zoom In
          </button>
          <button
            onClick={() => { setScale(1); setPan({ x: 0, y: 0 }) }}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reset View
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          {detectedDesks.length} desks detected
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded-full"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span>Monitor</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
          <span>Standing</span>
        </div>
      </div>
    </div>
  )
}