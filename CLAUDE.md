# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InaLogystics is a Progressive Web App for managing office logistics, specifically parking space and shared desk reservations. Built with Next.js 15, React 19, TypeScript, and PostgreSQL with Prisma ORM.

**Key Features:**
- Parking space management with interactive visualization (accessible spots, EV charging spots)
- Shared desk booking with interactive floor plans and amenity indicators
- Real-time updates via Socket.io
- Notification system for booking confirmations and reminders
- PWA support for mobile installation and offline functionality

## Development Commands

### Setup
```bash
# Install dependencies
npm install

# Copy environment variables and configure
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# Start PostgreSQL via Docker (runs on port 5434)
docker-compose up -d

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with initial data
npm run db:seed
```

### Running the Application
```bash
# Development server (runs on port 3002)
npm run dev

# Production build
npm run build

# Start production server (port 3002)
npm run start

# Linting
npm run lint
```

### Database Management
```bash
# Generate Prisma client after schema changes
npm run db:generate

# Push schema changes to database (without migrations)
npm run db:push

# Seed database with test users, desks, and parking spaces
npm run db:seed
```

### Utility Scripts
The `/scripts` directory contains various database utilities:
- `init-db.ts` - Main database seeding script
- `seed-desks.ts` - Populate desks with specific zones and positions
- `seed-parking.ts` - Populate parking spaces with floor assignments
- `create-test-booking.ts` - Create test bookings for development
- `clear-bookings.ts` - Clear all bookings from database
- `add-week-bookings.ts` - Add bookings for an entire week

Run scripts with: `tsx scripts/<script-name>.ts`

## Architecture & Code Structure

### Database Schema (Prisma)

The application uses a PostgreSQL database with the following main models:

**User**: Email-based user accounts with department info
- Referenced by bookings and notifications

**ParkingSpace**: Parking spot records
- Properties: `spotNumber`, `floor`, `isAccessible`, `isElectric`
- Unique constraint on `spotNumber`

**ParkingBooking**: Time-based parking reservations
- Links User ↔ ParkingSpace
- Unique constraint: `[parkingSpaceId, date, startTime]`
- Status: ACTIVE, CANCELLED, COMPLETED

**Desk**: Shared desk records with floor plan positioning
- Properties: `deskNumber`, `floor`, `zone`, `hasMonitor`, `hasStandingDesk`, `isShared`
- Position stored as `x`, `y` percentages for floor plan rendering
- `isActive` flag for enabling/disabling desks

**DeskBooking**: Time-based desk reservations
- Links User ↔ Desk
- Unique constraint: `[deskId, date, startTime]`
- Status: ACTIVE, CANCELLED, COMPLETED

**Notification**: User notifications
- Types: BOOKING_CONFIRMATION, BOOKING_REMINDER, BOOKING_CANCELLED, SPACE_AVAILABLE

### API Routes Structure

API routes follow RESTful conventions under `/src/app/api/`:

- `/api/bookings` - POST: Create desk bookings (validates desk availability)
- `/api/bookings/desk` - GET: Fetch desk bookings with filters
- `/api/bookings/parking` - GET: Fetch parking bookings with filters
- `/api/bookings/user` - GET: Get all bookings for a user
- `/api/desks` - GET: List all desks with booking status
- `/api/parking` - GET: List all parking spaces with availability
- `/api/notifications` - GET/POST: Notification management
- `/api/users` - GET/POST: User management

**Important**: The booking API uses timezone-aware date handling. Dates are parsed component-by-component to avoid timezone conversion issues. See `/api/bookings/route.ts:31-36` for the pattern.

### Frontend Structure

**Pages** (`/src/app/`):
- `page.tsx` - Landing page with feature cards and navigation
- `parking/page.tsx` - Parking space booking interface
- `desks/page.tsx` - Desk booking interface with floor plan
- `notifications/page.tsx` - Notification management

**Components** (`/src/components/`):
- `ParkingGrid.tsx` - Grid visualization of parking spaces
- `FloorPlan.tsx` - Basic floor plan visualization
- `InteractiveFloorPlan.tsx` - Clickable floor plan with desk selection
- `SmartFloorPlan.tsx` - Advanced floor plan with real-time updates
- `AdvancedFloorPlan.tsx` - Full-featured floor plan with amenity filters and zoom
- `WeekSelector.tsx` - Week-based booking calendar

### Real-time Updates

Socket.io is used for real-time booking updates:
- Server broadcasts booking events to connected clients
- Clients subscribe to relevant channels for live availability updates
- Important for preventing double-bookings in multi-user scenarios

### Date & Time Handling

**Critical**: This application has specific patterns for avoiding timezone bugs:
1. Date strings from forms are in `YYYY-MM-DD` format
2. Parse date components manually: `new Date(year, month-1, day, 0, 0, 0, 0)`
3. Never use `new Date(dateString)` directly as it triggers timezone conversion
4. See booking routes for reference implementation

### Styling

- Tailwind CSS for all styling
- Custom brand colors:
  - Primary: `#014059` (dark blue)
  - Accent: `#35C6F4` (cyan)
  - Background: `#F0F8FC` (light blue)
- Custom classes: `ina-gradient`, `ina-button-primary`, `ina-card`
- Global styles in `/src/app/globals.css`

## Development Notes

### Booking Validation
- Desks marked with `isShared: false` cannot be booked (assigned desks)
- Bookings check for overlapping time slots on the same date
- Unique constraints prevent race conditions at the database level

### Floor Plan Positioning
- Desk positions are stored as percentages (0-100) for `x` and `y`
- This allows responsive floor plans that scale to different screen sizes
- `zone` property groups desks by office area

### Testing
The application includes several test/debug pages and scripts for development. The `/test` route can be used for feature testing.

### Docker Setup
PostgreSQL runs in Docker on port 5434 (not the default 5432) to avoid conflicts with local PostgreSQL installations.

### Authentication

The application uses **NextAuth.js v5** with **Microsoft Entra ID (Azure AD)** for authentication:

- All routes are protected by middleware except `/auth/*` and `/api/auth/*`
- Users must authenticate via Microsoft Entra to access the application
- Session management uses database sessions (stored in PostgreSQL)
- User profile includes email, name, image, and department

**Setup**: See `ENTRA_SETUP.md` for detailed Azure AD configuration instructions.

### Environment Variables
Required in `.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL (e.g., `http://localhost:3002`)
- `NEXTAUTH_SECRET` / `AUTH_SECRET` - Random secret for session encryption (generate with `openssl rand -base64 32`)
- `AZURE_AD_CLIENT_ID` - Azure AD Application (Client) ID
- `AZURE_AD_CLIENT_SECRET` - Azure AD Client Secret
- `AZURE_AD_TENANT_ID` - Azure AD Directory (Tenant) ID
- Optional: FCM keys for push notifications

## Common Pitfalls

1. **Timezone Issues**: Always parse dates manually (year, month, day) rather than using Date constructor with strings
2. **Port Conflicts**: Dev server runs on port 3002, PostgreSQL on 5434
3. **Prisma Client**: Run `npm run db:generate` after any schema changes
4. **Shared Desks**: Only desks with `isShared: true` should appear in booking interfaces
5. **Booking Conflicts**: API validates at both application and database level (unique constraints)
