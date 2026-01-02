# InaLogystics - Office Space Management System

A Progressive Web App (PWA) for managing office logistics including parking space and shared desk reservations.

## Features

- **Parking Space Management**
  - Interactive parking lot visualization
  - Real-time availability status
  - Support for accessible and electric vehicle spots
  - Time-based reservations

- **Shared Desk Booking**
  - Interactive floor plan with desk visualization
  - Desk amenity indicators (monitors, standing desks)
  - Available/occupied status display
  - Flexible booking times

- **Notification System**
  - Browser push notifications
  - Booking confirmations
  - Availability alerts
  - Booking reminders

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.io
- **State Management**: React Query (TanStack Query)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database credentials

4. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

- `/src/app` - Next.js app router pages
- `/src/components` - React components
- `/prisma` - Database schema and migrations
- `/public` - Static assets and PWA manifest

## PWA Features

The app is installable on mobile devices and desktops, works offline with cached data, and supports push notifications for booking updates.