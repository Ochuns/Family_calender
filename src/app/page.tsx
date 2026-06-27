'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useEvents } from '@/hooks/useEvents'
import CalendarView from '@/components/CalendarView'
import EventModal from '@/components/EventModal'
import EventDetailModal from '@/components/EventDetailModal'
import { MEMBER_COLORS, MEMBER_LABELS } from '@/types/event'
import type { CalendarEvent } from '@/types/event'

export default function Home() {
  const { user, role, logout } = useAuth()
  const { events, loading, addEvent, deleteEvent } = useEvents()
  const isAdmin = role === 'admin'

  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | undefined>()
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setShowAddModal(true)
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">家族カレンダー</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{isAdmin ? '管理者' : '閲覧者'}</span>
            <button
              onClick={logout}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* Legend */}
      <div className="border-b bg-white px-4 py-2">
        <div className="mx-auto flex max-w-2xl gap-4">
          {(Object.entries(MEMBER_LABELS) as [keyof typeof MEMBER_LABELS, string][]).map(
            ([key, label]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: MEMBER_COLORS[key] }}
                />
                <span className="text-xs text-gray-600">{label}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Calendar */}
      <main className="flex-1 px-2 py-4">
        <div className="mx-auto max-w-2xl">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              読み込み中...
            </div>
          ) : (
            <CalendarView
              events={events}
              isAdmin={isAdmin}
              onDateSelect={handleDateSelect}
              onEventClick={handleEventClick}
            />
          )}
        </div>
      </main>

      {/* Admin: Add button */}
      {isAdmin && (
        <div className="sticky bottom-6 flex justify-center px-4">
          <button
            onClick={() => {
              setSelectedDate(undefined)
              setShowAddModal(true)
            }}
            className="flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-600 active:scale-95"
          >
            <span className="text-lg leading-none">+</span>
            予定を追加
          </button>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <EventModal
          initialDate={selectedDate}
          onSave={addEvent}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isAdmin={isAdmin}
          onDelete={deleteEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  )
}
