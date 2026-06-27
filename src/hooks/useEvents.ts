'use client'

import { useState, useEffect } from 'react'
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
import { db } from '@/lib/firebase'
import type { CalendarEvent, FamilyMember } from '@/types/event'

export interface NewEventInput {
  title: string
  start: string
  end?: string
  allDay: boolean
  member: FamilyMember
  description?: string
}

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('start', 'asc'))
    const unsubscribe = onSnapshot(
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
        console.error('Firestore error:', error)
        setLoading(false)
      }
    )
    return () => unsubscribe()
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

  return { events, loading, addEvent, updateEvent, deleteEvent }
}
