'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useEventsContext } from '@/contexts/EventsContext'
import CalendarView from '@/components/CalendarView'
import EventModal from '@/components/EventModal'
import EventDetailModal from '@/components/EventDetailModal'
import { useMembers } from '@/contexts/MembersContext'
import type { CalendarEvent } from '@/types/event'
import type { NewEventInput } from '@/contexts/EventsContext'

export default function Home() {
  const { user, logout } = useAuth()
  const { events, loading, addEvent, updateEvent, deleteEvent } = useEventsContext()
  const { members, memberColors, memberLabels } = useMembers()
  const isAdmin = !!user
  const isSuperAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL

  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | undefined>()
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [hiddenMembers, setHiddenMembers] = useState<Set<string>>(new Set())
  const initializedRef = useRef(false)

  // Sync initial hidden state from Firestore visible field (only once on first data load)
  useEffect(() => {
    if (initializedRef.current || members.length === 0) return
    initializedRef.current = true
    setHiddenMembers(new Set(members.filter((m) => m.visible === false).map((m) => m.id)))
  }, [members])

  const toggleMember = (id: string) => {
    setHiddenMembers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const visibleEvents = events.filter((e) => !hiddenMembers.has(e.member))

  const handleAddEvent = async (input: NewEventInput, notify: boolean) => {
    await addEvent(input)
    if (notify) {
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventTitle: input.title,
            memberLabel: memberLabels[input.member] ?? input.member,
          }),
        })
      } catch (e) {
        console.error('Notification send failed:', e)
      }
    }
  }

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
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <a
                href="/members"
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200"
              >
                メンバー管理
              </a>
            )}
            <button
              onClick={logout}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* Legend — tap to toggle member visibility */}
      <div className="border-b bg-white px-4 py-2">
        <div className="mx-auto flex max-w-2xl flex-wrap gap-2">
          {members.filter((m) => m.visible !== false).map((m) => {
            const isHidden = hiddenMembers.has(m.id)
            return (
              <button
                key={m.id}
                onClick={() => toggleMember(m.id)}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${
                  isHidden
                    ? 'border-gray-200 bg-gray-50 text-gray-300'
                    : 'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full transition"
                  style={{ backgroundColor: isHidden ? '#d1d5db' : memberColors[m.id] }}
                />
                <span className={isHidden ? 'line-through' : ''}>{m.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Calendar */}
      <main className="flex-1 px-2 py-4 pb-24">
        <div className="mx-auto max-w-2xl">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              読み込み中...
            </div>
          ) : (
            <CalendarView
              events={visibleEvents}
              isAdmin={isAdmin}
              onDateSelect={handleDateSelect}
              onEventClick={handleEventClick}
            />
          )}
        </div>
      </main>

      {/* Footer: Add button (admin only) */}
      {isAdmin && (
        <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-200 bg-white px-4 py-3">
          <div className="mx-auto max-w-2xl">
            <button
              onClick={() => {
                setSelectedDate(undefined)
                setShowAddModal(true)
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 active:scale-95 transition"
            >
              <span className="text-lg leading-none">+</span>
              予定を追加
            </button>
          </div>
        </footer>
      )}

      {/* Modals */}
      {showAddModal && (
        <EventModal
          initialDate={selectedDate}
          onSave={handleAddEvent}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isAdmin={isAdmin}
          onDelete={deleteEvent}
          onEdit={(event) => { setEditingEvent(event); setSelectedEvent(null) }}
          onClose={() => setSelectedEvent(null)}
        />
      )}
      {editingEvent && (
        <EventModal
          initialValues={editingEvent}
          onSave={addEvent}
          onUpdate={updateEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </div>
  )
}
