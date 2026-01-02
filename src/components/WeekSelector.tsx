'use client'

import { useState, useEffect } from 'react'
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from 'date-fns'

interface DayBooking {
  date: string
  hasBooking: boolean
  deskNumber?: string
  bookingId?: string
  startTime?: string
  endTime?: string
  parkingSpot?: string
  parkingLocation?: string
}

interface WeekSelectorProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  userBookings: DayBooking[]
  selectedDates?: Date[]
  isMultiDayMode?: boolean
  onCancelBooking?: (bookingId: string) => void
  cancellingBookingId?: string | null
}

export default function WeekSelector({
  selectedDate,
  onDateSelect,
  userBookings,
  selectedDates = [],
  isMultiDayMode = false,
  onCancelBooking,
  cancellingBookingId
}: WeekSelectorProps) {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(selectedDate, { weekStartsOn: 1 })) // Monday start

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i))

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1))
  }

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1))
  }

  const goToCurrentWeek = () => {
    const today = new Date()
    setCurrentWeek(startOfWeek(today, { weekStartsOn: 1 }))
    onDateSelect(today)
  }

  const getBookingForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    return userBookings.find(booking => booking.date === dateString)
  }

  const isToday = (date: Date) => isSameDay(date, new Date())
  const isSelected = (date: Date) => {
    if (isMultiDayMode) {
      return selectedDates.some(d => isSameDay(d, date))
    }
    return isSameDay(date, selectedDate)
  }
  const isPastDate = (date: Date) => date < new Date() && !isToday(date)

  return (
    <div className="bg-white p-2 sm:p-4 rounded-lg shadow mb-4">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <h3 className="text-base sm:text-lg font-semibold">Week View</h3>
          <button
            onClick={goToCurrentWeek}
            className="text-xs sm:text-sm bg-[#35C6F4] text-white px-2 sm:px-3 py-1 rounded-md hover:bg-[#2AB5E3] transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={goToPreviousWeek}
            className="p-1 sm:p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <span className="text-xs sm:text-sm font-medium min-w-24 sm:min-w-32 text-center">
            {format(currentWeek, 'MMM d')} - {format(addDays(currentWeek, 6), 'MMM d, yyyy')}
          </span>

          <button
            onClick={goToNextWeek}
            className="p-1 sm:p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {weekDays.map((day, index) => {
          const booking = getBookingForDate(day)
          const hasBooking = booking?.hasBooking || false
          const dayIsToday = isToday(day)
          const dayIsSelected = isSelected(day)
          const dayIsPast = isPastDate(day)

          return (
            <div
              key={index}
              className={`p-1 sm:p-3 rounded-lg border-2 transition-all duration-200 ${
                dayIsSelected
                  ? 'border-[#35C6F4] bg-[#35C6F4] text-white'
                  : dayIsToday
                  ? 'border-[#35C6F4] bg-[#35C6F4]/10 text-[#35C6F4] hover:bg-[#35C6F4]/20'
                  : dayIsPast
                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${!dayIsPast ? 'cursor-pointer' : ''}`}
              onClick={!dayIsPast ? () => onDateSelect(day) : undefined}
            >
              {/* Day name and date */}
              <div className="text-center">
                <div className="text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1">
                  {format(day, 'EEE')}
                </div>
                <div className="text-sm sm:text-lg font-bold mb-1 sm:mb-2">
                  {format(day, 'd')}
                </div>

                {/* Booking status */}
                <div className="h-auto min-h-4 sm:min-h-6 flex flex-col gap-0.5 sm:gap-1">
                  {hasBooking ? (
                    <>
                      <div className={`text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded ${
                        dayIsSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {booking?.deskNumber || 'Booked'}
                      </div>
                      {booking?.parkingSpot && (
                        <div className={`text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded ${
                          dayIsSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-100 text-blue-700'
                        }`} title={booking.parkingLocation}>
                          🚗 {booking.parkingSpot}
                        </div>
                      )}
                      {booking?.bookingId && onCancelBooking && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onCancelBooking(booking.bookingId!)
                          }}
                          disabled={cancellingBookingId === booking.bookingId}
                          className={`text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded transition-colors ${
                            cancellingBookingId === booking.bookingId
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {cancellingBookingId === booking.bookingId ? '...' : 'Cancel'}
                        </button>
                      )}
                      {booking?.startTime && booking?.endTime && (
                        <div className="text-[9px] sm:text-xs text-gray-500 hidden sm:block">
                          {booking.startTime}-{booking.endTime}
                        </div>
                      )}
                    </>
                  ) : !dayIsPast ? (
                    <div className={`text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded ${
                      dayIsSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      Available
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-[10px] sm:text-xs text-gray-500">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-100 border border-green-200 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-100 text-green-700 rounded flex items-center justify-center">
              <div className="w-1 h-1 bg-green-700 rounded-full"></div>
            </div>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#35C6F4] rounded"></div>
            <span>Selected</span>
          </div>
        </div>
        <div className="hidden sm:block">
          Click on a day to view desk availability
        </div>
      </div>
    </div>
  )
}