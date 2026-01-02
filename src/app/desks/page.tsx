'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  Chip,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  IconButton,
  Fab,
  ListSubheader,
} from '@mui/material'
import {
  Monitor as MonitorIcon,
  Height as HeightIcon,
  Close as CloseIcon,
  Book as BookIcon,
} from '@mui/icons-material'
import AdvancedFloorPlan, { AdvancedFloorPlanRef } from '@/components/AdvancedFloorPlan'
import WeekSelector from '@/components/WeekSelector'
import Navigation from '@/components/Navigation'
import { format, startOfWeek } from 'date-fns'

// Digital Park II 6th Floor - Precisely mapped desk positions (29 total desks)
const mockDesks = [
  // Team B Area (4 desks in 2x2 grid)
  { id: 'TB01', x: 16, y: 12, deskNumber: 'TB01', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Team B' },
  { id: 'TB02', x: 21, y: 12, deskNumber: 'TB02', isAvailable: false, hasMonitor: true, hasStandingDesk: true, zone: 'Team B' },
  { id: 'TB03', x: 16, y: 17, deskNumber: 'TB03', isAvailable: true, hasMonitor: false, hasStandingDesk: false, zone: 'Team B' },
  { id: 'TB04', x: 21, y: 17, deskNumber: 'TB04', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Team B' },

  // Central Open Workspace - Top Row (6 desks)
  { id: 'OW01', x: 42, y: 20, deskNumber: 'OW01', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Open Workspace' },
  { id: 'OW02', x: 47, y: 20, deskNumber: 'OW02', isAvailable: false, hasMonitor: true, hasStandingDesk: true, zone: 'Open Workspace' },
  { id: 'OW03', x: 52, y: 20, deskNumber: 'OW03', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Open Workspace' },
  { id: 'OW04', x: 42, y: 25, deskNumber: 'OW04', isAvailable: true, hasMonitor: false, hasStandingDesk: true, zone: 'Open Workspace' },
  { id: 'OW05', x: 47, y: 25, deskNumber: 'OW05', isAvailable: false, hasMonitor: true, hasStandingDesk: false, zone: 'Open Workspace' },
  { id: 'OW06', x: 52, y: 25, deskNumber: 'OW06', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Open Workspace' },

  // Central Open Workspace - Middle Row (6 desks)
  { id: 'OW07', x: 42, y: 35, deskNumber: 'OW07', isAvailable: true, hasMonitor: true, hasStandingDesk: true, zone: 'Open Workspace' },
  { id: 'OW08', x: 47, y: 35, deskNumber: 'OW08', isAvailable: false, hasMonitor: true, hasStandingDesk: false, zone: 'Open Workspace' },
  { id: 'OW09', x: 52, y: 35, deskNumber: 'OW09', isAvailable: true, hasMonitor: false, hasStandingDesk: false, zone: 'Open Workspace' },
  { id: 'OW10', x: 42, y: 40, deskNumber: 'OW10', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Open Workspace' },
  { id: 'OW11', x: 47, y: 40, deskNumber: 'OW11', isAvailable: false, hasMonitor: true, hasStandingDesk: true, zone: 'Open Workspace' },
  { id: 'OW12', x: 52, y: 40, deskNumber: 'OW12', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Open Workspace' },

  // Central Open Workspace - Lower Row (6 desks)
  { id: 'OW13', x: 42, y: 50, deskNumber: 'OW13', isAvailable: true, hasMonitor: false, hasStandingDesk: true, zone: 'Open Workspace' },
  { id: 'OW14', x: 47, y: 50, deskNumber: 'OW14', isAvailable: false, hasMonitor: true, hasStandingDesk: false, zone: 'Open Workspace' },
  { id: 'OW15', x: 52, y: 50, deskNumber: 'OW15', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Open Workspace' },
  { id: 'OW16', x: 42, y: 55, deskNumber: 'OW16', isAvailable: true, hasMonitor: true, hasStandingDesk: true, zone: 'Open Workspace' },
  { id: 'OW17', x: 47, y: 55, deskNumber: 'OW17', isAvailable: false, hasMonitor: true, hasStandingDesk: false, zone: 'Open Workspace' },
  { id: 'OW18', x: 52, y: 55, deskNumber: 'OW18', isAvailable: true, hasMonitor: false, hasStandingDesk: false, zone: 'Open Workspace' },

  // Right Wing (4 desks)
  { id: 'RS01', x: 62, y: 30, deskNumber: 'RS01', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Right Wing' },
  { id: 'RS02', x: 67, y: 30, deskNumber: 'RS02', isAvailable: false, hasMonitor: true, hasStandingDesk: true, zone: 'Right Wing' },
  { id: 'RS03', x: 62, y: 35, deskNumber: 'RS03', isAvailable: true, hasMonitor: false, hasStandingDesk: false, zone: 'Right Wing' },
  { id: 'RS04', x: 67, y: 35, deskNumber: 'RS04', isAvailable: true, hasMonitor: true, hasStandingDesk: false, zone: 'Right Wing' },

  // Lower Section (5 desks)
  { id: 'LS01', x: 30, y: 70, deskNumber: 'LS01', isAvailable: false, hasMonitor: true, hasStandingDesk: false, zone: 'Lower Section' },
  { id: 'LS02', x: 35, y: 70, deskNumber: 'LS02', isAvailable: true, hasMonitor: true, hasStandingDesk: true, zone: 'Lower Section' },
  { id: 'LS03', x: 40, y: 70, deskNumber: 'LS03', isAvailable: true, hasMonitor: false, hasStandingDesk: false, zone: 'Lower Section' },
  { id: 'LS04', x: 30, y: 75, deskNumber: 'LS04', isAvailable: false, hasMonitor: true, hasStandingDesk: false, zone: 'Lower Section' },
  { id: 'LS05', x: 35, y: 75, deskNumber: 'LS05', isAvailable: true, hasMonitor: true, hasStandingDesk: true, zone: 'Lower Section' },

  // Hot Desks (2 flexible workstations)
  { id: 'HD01', x: 26, y: 15, deskNumber: 'HD01', isAvailable: true, hasMonitor: false, hasStandingDesk: true, zone: 'Hot Desks' },
  { id: 'HD02', x: 72, y: 65, deskNumber: 'HD02', isAvailable: false, hasMonitor: true, hasStandingDesk: false, zone: 'Hot Desks' },
]

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

export default function DesksPage() {
  const { data: session } = useSession()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))
  const floorPlanRef = useRef<AdvancedFloorPlanRef>(null)
  const [selectedDesk, setSelectedDesk] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [isMultiDayMode, setIsMultiDayMode] = useState(false)
  const [selectedStartTime, setSelectedStartTime] = useState('09:00')
  const [selectedEndTime, setSelectedEndTime] = useState('17:00')
  const [needsParking, setNeedsParking] = useState(false)
  const [availableParkingSpots, setAvailableParkingSpots] = useState<any[]>([])
  const [selectedParkingSpot, setSelectedParkingSpot] = useState('')
  const [loadingParking, setLoadingParking] = useState(false)
  const [userBookings, setUserBookings] = useState<DayBooking[]>([])
  const [loading, setLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState('')
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)

  // Get user name from session
  const userName = session?.user?.name || 'User'
  const userEmail = session?.user?.email || ''

  // Fetch user bookings for the selected week
  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        setLoading(true)
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
        const weekStartString = format(weekStart, 'yyyy-MM-dd')
        const response = await fetch(`/api/bookings/user?weekStart=${weekStartString}`)
        if (response.ok) {
          const bookings = await response.json()
          setUserBookings(bookings)
        }
      } catch (error) {
        console.error('Error fetching user bookings:', error)
        setUserBookings([])
      } finally {
        setLoading(false)
      }
    }

    fetchUserBookings()
  }, [selectedDate])

  // Fetch available parking spots when parking is needed
  useEffect(() => {
    const fetchAvailableParkingSpots = async () => {
      if (!needsParking || isMultiDayMode) {
        setAvailableParkingSpots([])
        setSelectedParkingSpot('')
        return
      }

      try {
        setLoadingParking(true)
        const dateString = format(selectedDate, 'yyyy-MM-dd')
        const response = await fetch(`/api/parking-availability?date=${dateString}&startTime=${selectedStartTime}`)

        if (response.ok) {
          const spots = await response.json()
          setAvailableParkingSpots(spots)

          // Auto-select first available spot
          const firstAvailable = spots.find((spot: any) => spot.isAvailable)
          if (firstAvailable) {
            setSelectedParkingSpot(firstAvailable.id)
          } else {
            setSelectedParkingSpot('')
          }
        }
      } catch (error) {
        console.error('Error fetching parking availability:', error)
        setAvailableParkingSpots([])
      } finally {
        setLoadingParking(false)
      }
    }

    fetchAvailableParkingSpots()
  }, [needsParking, selectedDate, selectedStartTime, isMultiDayMode])

  // Cancel booking
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    setCancellingBookingId(bookingId)

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setBookingSuccess(data.message || 'Booking cancelled successfully')

        // Refresh data
        floorPlanRef.current?.refresh()

        // Refresh week bookings
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
        const weekStartString = format(weekStart, 'yyyy-MM-dd')
        const bookingsResponse = await fetch(`/api/bookings/user?weekStart=${weekStartString}`)
        if (bookingsResponse.ok) {
          const bookings = await bookingsResponse.json()
          setUserBookings(bookings)
        }
      } else {
        setBookingError(data.error || 'Failed to cancel booking')
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      setBookingError('Failed to cancel booking')
    } finally {
      setCancellingBookingId(null)
    }
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedDesk(null) // Clear selected desk when changing dates
  }

  const toggleDateInMultiDay = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    const isSelected = selectedDates.some(d => format(d, 'yyyy-MM-dd') === dateString)

    if (isSelected) {
      setSelectedDates(selectedDates.filter(d => format(d, 'yyyy-MM-dd') !== dateString))
    } else {
      setSelectedDates([...selectedDates, date])
    }
  }

  const handleDeskClick = (desk: any) => {
    if (desk.isAvailable) {
      setSelectedDesk(desk)
      if (isMobile) {
        setBookingDialogOpen(true)
      }
    }
  }

  const handleCloseDialog = () => {
    setBookingDialogOpen(false)
  }

  const handleCancelInDialog = () => {
    setSelectedDesk(null)
    setBookingError('')
    setBookingSuccess('')
    setBookingDialogOpen(false)
  }

  const handleBooking = async () => {
    if (!selectedDesk || !session?.user) return

    // Determine which dates to book
    const datesToBook = isMultiDayMode ? selectedDates : [selectedDate]

    if (datesToBook.length === 0) {
      setBookingError('Please select at least one date')
      return
    }

    setBookingLoading(true)
    setBookingError('')
    setBookingSuccess('')

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deskId: selectedDesk.deskNumber,
          dates: datesToBook.map(date => format(date, 'yyyy-MM-dd')),
          startTime: selectedStartTime,
          endTime: selectedEndTime,
          needsParking: needsParking,
          selectedParkingSpotId: selectedParkingSpot || null
        })
      })

      const data = await response.json()

      if (response.ok) {
        const successfulBookings = data.bookings || []
        const failedBookings = data.failed || []

        let successMessage = ''

        if (successfulBookings.length > 0) {
          if (successfulBookings.length === 1) {
            const booking = successfulBookings[0]
            successMessage = `Desk ${selectedDesk.deskNumber} booked successfully for ${format(new Date(booking.date), 'MMM d, yyyy')}!`

            // Add parking information
            if (booking.parking) {
              successMessage += ` Parking: ${booking.parking.spotNumber} (${booking.parking.location})`
            } else if (needsParking) {
              successMessage += ` No parking available - please park on PAAS`
            }
          } else {
            successMessage = `Desk ${selectedDesk.deskNumber} booked successfully for ${successfulBookings.length} days!`

            // Check if any bookings have parking
            const parkingBookings = successfulBookings.filter((b: any) => b.parking)
            if (parkingBookings.length > 0) {
              successMessage += ` Parking assigned for ${parkingBookings.length} day(s)`
            } else if (needsParking) {
              successMessage += ` No parking available - please park on PAAS`
            }
          }
        }

        if (failedBookings.length > 0) {
          // Build detailed error message with reasons
          const failedDetails = failedBookings.map((f: any) => {
            const dateStr = format(new Date(f.date), 'MMM d')
            return f.reason ? `${dateStr} - ${f.reason}` : dateStr
          }).join('; ')

          if (successMessage) {
            successMessage += ` However, booking failed for: ${failedDetails}`
          } else {
            setBookingError(`Booking failed: ${failedDetails}`)
          }
        }

        if (successMessage) {
          setBookingSuccess(successMessage)
        }

        setSelectedDesk(null)
        setSelectedDates([])
        setNeedsParking(false)
        setSelectedParkingSpot('')
        setAvailableParkingSpots([])

        // Close dialog on mobile after successful booking
        if (isMobile) {
          setBookingDialogOpen(false)
        }

        // Refresh floor plan immediately
        floorPlanRef.current?.refresh()

        // Refresh user bookings
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
        const weekStartString = format(weekStart, 'yyyy-MM-dd')
        const bookingsResponse = await fetch(`/api/bookings/user?weekStart=${weekStartString}`)
        if (bookingsResponse.ok) {
          const bookings = await bookingsResponse.json()
          setUserBookings(bookings)
        }
      } else {
        setBookingError(data.error || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      setBookingError('Failed to create booking')
    } finally {
      setBookingLoading(false)
    }
  }

  // Booking form content component (reusable for dialog and sidebar)
  const renderBookingForm = () => (
    <>
      {selectedDesk ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Selected Desk
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: 'secondary.main',
                mb: 1.5,
              }}
            >
              {selectedDesk.deskNumber}
            </Typography>
            {selectedDesk.zone && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                <strong>Zone:</strong> {selectedDesk.zone}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedDesk.hasMonitor && (
                <Chip icon={<MonitorIcon />} label="Has monitor" size="small" color="primary" variant="outlined" />
              )}
              {selectedDesk.hasStandingDesk && (
                <Chip icon={<HeightIcon />} label="Standing desk" size="small" color="secondary" variant="outlined" />
              )}
            </Box>
          </Paper>

          <TextField
            label="Booked By"
            value={userName}
            disabled
            fullWidth
            helperText="Automatically filled from your account"
          />

          <FormControlLabel
            control={
              <Switch
                checked={needsParking}
                onChange={(e) => setNeedsParking(e.target.checked)}
                color="primary"
              />
            }
            label="Need Parking?"
          />

          {needsParking && !isMultiDayMode && (
            <FormControl fullWidth disabled={loadingParking}>
              <InputLabel>Parking Spot</InputLabel>
              <Select
                value={selectedParkingSpot}
                onChange={(e) => setSelectedParkingSpot(e.target.value)}
                label="Parking Spot"
              >
                {loadingParking ? (
                  <MenuItem value="">Loading...</MenuItem>
                ) : availableParkingSpots.length === 0 ? (
                  <MenuItem value="">No spots available - park on PAAS</MenuItem>
                ) : [
                    <ListSubheader key="garage-header">Garage</ListSubheader>,
                    ...availableParkingSpots
                      .filter(spot => spot.location === 'Garage')
                      .map(spot => (
                        <MenuItem
                          key={spot.id}
                          value={spot.id}
                          disabled={!spot.isAvailable}
                        >
                          {spot.spotNumber} {!spot.isAvailable && '(Booked)'}
                        </MenuItem>
                      )),
                    <ListSubheader key="parking-house-header">Parking House</ListSubheader>,
                    ...availableParkingSpots
                      .filter(spot => spot.location === 'Parking House')
                      .map(spot => (
                        <MenuItem
                          key={spot.id}
                          value={spot.id}
                          disabled={!spot.isAvailable}
                        >
                          {spot.spotNumber} {!spot.isAvailable && '(Booked)'}
                        </MenuItem>
                      ))
                  ]
                }
              </Select>
            </FormControl>
          )}

          {!isMultiDayMode && (
            <TextField
              type="date"
              label="Date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => handleDateSelect(new Date(e.target.value))}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              fullWidth
            />
          )}

          {isMultiDayMode && (
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
              <Typography variant="body2" gutterBottom>
                Selected Dates
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {selectedDates.length} {selectedDates.length === 1 ? 'day' : 'days'}
              </Typography>
              {selectedDates.length === 0 && (
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Click on days in the calendar above to select
                </Typography>
              )}
            </Paper>
          )}

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Start Time</InputLabel>
                <Select
                  value={selectedStartTime}
                  onChange={(e) => setSelectedStartTime(e.target.value)}
                  label="Start Time"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 8).map(hour => (
                    <MenuItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                      {hour}:00
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>End Time</InputLabel>
                <Select
                  value={selectedEndTime}
                  onChange={(e) => setSelectedEndTime(e.target.value)}
                  label="End Time"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 9).map(hour => (
                    <MenuItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                      {hour}:00
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {bookingError && (
            <Alert severity="error" onClose={() => setBookingError('')}>
              {bookingError}
            </Alert>
          )}

          {bookingSuccess && (
            <Alert severity="success" onClose={() => setBookingSuccess('')}>
              {bookingSuccess}
            </Alert>
          )}

          <Button
            variant="contained"
            color="secondary"
            onClick={handleBooking}
            disabled={bookingLoading || !session?.user}
            fullWidth
            size="large"
          >
            {bookingLoading ? <CircularProgress size={24} color="inherit" /> : 'Book Desk'}
          </Button>
          <Button
            variant="outlined"
            onClick={isMobile ? handleCancelInDialog : () => {
              setSelectedDesk(null)
              setBookingError('')
              setBookingSuccess('')
            }}
            fullWidth
          >
            Cancel
          </Button>
        </Box>
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
          Select a desk from the floor plan to book
        </Typography>
      )}
    </>
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navigation currentPage="desks" />

      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h3"
          sx={{
            mb: { xs: 2, sm: 3, md: 4 },
            fontWeight: 700,
            color: 'primary.main',
            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          Book a Shared Desk
        </Typography>

        {/* Booking Mode Toggle */}
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <FormControlLabel
            control={
              <Switch
                checked={isMultiDayMode}
                onChange={(e) => {
                  setIsMultiDayMode(e.target.checked)
                  setSelectedDates([])
                  setSelectedDesk(null)
                }}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight={600} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Multi-Day Booking
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  {isMultiDayMode ? 'Select multiple days from the calendar below' : 'Book for a single day'}
                </Typography>
              </Box>
            }
          />
        </Box>

        {/* Week Selector */}
        <Box sx={{ mb: 4 }}>
          <WeekSelector
            selectedDate={selectedDate}
            onDateSelect={isMultiDayMode ? toggleDateInMultiDay : handleDateSelect}
            userBookings={userBookings}
            selectedDates={selectedDates}
            isMultiDayMode={isMultiDayMode}
            onCancelBooking={handleCancelBooking}
            cancellingBookingId={cancellingBookingId}
          />
        </Box>

        {/* Selected Dates Display for Multi-Day Mode */}
        {isMultiDayMode && selectedDates.length > 0 && (
          <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Selected Dates ({selectedDates.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedDates.sort((a, b) => a.getTime() - b.getTime()).map((date, index) => (
                    <Chip
                      key={index}
                      label={format(date, 'EEE, MMM d')}
                      onDelete={() => toggleDateInMultiDay(date)}
                      color="primary"
                      variant="outlined"
                      size={window.innerWidth < 640 ? 'small' : 'medium'}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, fontSize: { xs: '1.125rem', sm: '1.5rem' } }}>
                  Interactive Floor Plan
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Floor plan for {format(selectedDate, 'EEEE, MMM d, yyyy')}
                </Typography>
                <AdvancedFloorPlan
                  ref={floorPlanRef}
                  onDeskClick={handleDeskClick}
                  selectedDeskId={selectedDesk?.id}
                  selectedDate={selectedDate}
                  userEmail={userEmail}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Desktop sidebar - hidden on mobile */}
          <Grid item xs={12} lg={4} sx={{ display: { xs: 'none', lg: 'block' } }}>
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h5" sx={{ mb: { xs: 2, sm: 3 }, fontWeight: 600, fontSize: { xs: '1.125rem', sm: '1.5rem' } }}>
                  Booking Details
                </Typography>
                {renderBookingForm()}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Mobile booking dialog */}
        <Dialog
          open={bookingDialogOpen && isMobile}
          onClose={handleCloseDialog}
          fullScreen
          sx={{ display: { xs: 'block', lg: 'none' } }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box component="span" sx={{ fontWeight: 600 }}>
              Booking Details
            </Box>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleCloseDialog}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {renderBookingForm()}
          </DialogContent>
        </Dialog>

        {/* Floating action button for mobile - shown when desk is selected */}
        {isMobile && selectedDesk && !bookingDialogOpen && (
          <Fab
            color="secondary"
            aria-label="book desk"
            onClick={() => setBookingDialogOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000,
            }}
          >
            <BookIcon />
          </Fab>
        )}
      </Container>
    </Box>
  )
}
