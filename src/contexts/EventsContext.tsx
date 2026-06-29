'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  deleteField,
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { db, auth } from '@/lib/firebase'
import type { CalendarEvent, FamilyMember } from '@/types/event'

export interface NewEventInput {
  title: string
  start: string
  end?: string
  allDay: boolean
  member: FamilyMember
  description?: string
}

interface EventsContextType {
  events: CalendarEvent[]
  loading: boolean
  addEvent: (input: NewEventInput) => Promise<void>
  updateEvent: (id: string, input: NewEventInput) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
}

const EventsContext = createContext<EventsContextType | null>(null)

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot()
        unsubscribeSnapshot = null
      }

      if (user) {
        const q = query(collection(db, 'events'), orderBy('start', 'asc'))
        unsubscribeSnapshot = onSnapshot(
          q,
          (snapshot) => {
            const data = snapshot.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<CalendarEvent, 'id'>),
            }))
            setEvents(data)
            setLoading(false)
          },
          (error) => {
            console.error('Events Firestore error:', error)
            setLoading(false)
          }
        )
      } else {
        setEvents([])
        setLoading(false)
      }
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeSnapshot) unsubscribeSnapshot()
    }
  }, [])

  const addEvent = async (input: NewEventInput) => {
    const data: Record<string, unknown> = {
      title: input.title,
      start: input.start,
      allDay: input.allDay,
      member: input.member,
      createdAt: new Date().toISOString(),
    }
    if (input.end) data.end = input.end
    if (input.description) data.description = input.description
    await addDoc(collection(db, 'events'), data)
  }

  const updateEvent = async (id: string, input: NewEventInput) => {
    await updateDoc(doc(db, 'events', id), {
      title: input.title,
      start: input.start,
      allDay: input.allDay,
      member: input.member,
      end: input.end ?? deleteField(),
      description: input.description ?? deleteField(),
    })
  }

  const deleteEvent = async (id: string) => {
    await deleteDoc(doc(db, 'events', id))
  }

  return (
    <EventsContext.Provider value={{ events, loading, addEvent, updateEvent, deleteEvent }}>
      {children}
    </EventsContext.Provider>
  )
}

export function useEventsContext() {
  const context = useContext(EventsContext)
  if (!context) throw new Error('useEventsContext must be used within EventsProvider')
  return context
}
