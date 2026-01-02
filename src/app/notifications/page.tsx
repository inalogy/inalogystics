'use client'

import { useState } from 'react'
import Link from 'next/link'

// Mock notifications data
const mockNotifications = [
  {
    id: '1',
    title: 'Booking Confirmed',
    message: 'Your desk D06 booking for tomorrow at 9:00 AM has been confirmed.',
    type: 'BOOKING_CONFIRMATION',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: '2',
    title: 'Parking Space Available',
    message: 'Parking space P15 is now available for booking.',
    type: 'SPACE_AVAILABLE',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: '3',
    title: 'Booking Reminder',
    message: 'Reminder: You have a parking space P08 booked for today at 2:00 PM.',
    type: 'BOOKING_REMINDER',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [enablePush, setEnablePush] = useState(false)

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    )
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setEnablePush(true)
        new Notification('InaLogystics Notifications Enabled', {
          body: 'You will now receive notifications for bookings and updates.',
          icon: '/icon-192x192.png',
        })
      }
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMATION':
        return '✅'
      case 'BOOKING_REMINDER':
        return '⏰'
      case 'SPACE_AVAILABLE':
        return '🅿️'
      case 'BOOKING_CANCELLED':
        return '❌'
      default:
        return '📢'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 60) return `${minutes} minutes ago`
    if (hours < 24) return `${hours} hours ago`
    return `${days} days ago`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <button
            onClick={markAllAsRead}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Mark all as read
          </button>
        </div>

        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-xl font-semibold mb-4">Push Notifications</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Browser Notifications</p>
              <p className="text-sm text-gray-600">Get real-time updates about your bookings</p>
            </div>
            <button
              onClick={requestNotificationPermission}
              className={`px-4 py-2 rounded-md ${
                enablePush
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              disabled={enablePush}
            >
              {enablePush ? 'Enabled' : 'Enable'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="divide-y">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 cursor-pointer transition ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">{notification.title}</h3>
                        <span className="text-sm text-gray-500">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}