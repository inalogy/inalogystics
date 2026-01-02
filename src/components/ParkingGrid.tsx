'use client'

interface ParkingSpace {
  id: string
  spotNumber: string
  isAvailable: boolean
  isAccessible?: boolean
  isElectric?: boolean
}

interface ParkingGridProps {
  spaces: ParkingSpace[]
  onSpaceClick?: (space: ParkingSpace) => void
  selectedSpaceId?: string
}

export default function ParkingGrid({ spaces, onSpaceClick, selectedSpaceId }: ParkingGridProps) {
  return (
    <div className="grid grid-cols-10 gap-2 p-4 bg-gray-50 rounded-lg">
      {spaces.map(space => {
        const isSelected = selectedSpaceId === space.id
        const baseClasses = "relative w-full aspect-[2/1] rounded-md flex items-center justify-center text-sm font-bold transition-all cursor-pointer hover:scale-105 border-2"
        
        let colorClasses = ""
        if (isSelected) {
          colorClasses = "bg-[#35C6F4] text-white border-[#35C6F4] shadow-lg"
        } else if (!space.isAvailable) {
          colorClasses = "bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed hover:scale-100"
        } else {
          colorClasses = "bg-white text-gray-700 border-gray-300 hover:border-[#35C6F4] hover:text-[#35C6F4] shadow-sm hover:shadow-md"
        }

        return (
          <div
            key={space.id}
            className={`${baseClasses} ${colorClasses}`}
            onClick={() => space.isAvailable && onSpaceClick?.(space)}
          >
            <span>{space.spotNumber}</span>
            {space.isAccessible && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">♿</span>
              </div>
            )}
            {space.isElectric && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">⚡</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}