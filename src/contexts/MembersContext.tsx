'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  collection,
  onSnapshot,
  setDoc,
  doc,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { DEFAULT_MEMBERS } from '@/types/event'
import type { FamilyMember, MemberInfo } from '@/types/event'

interface MembersContextType {
  members: MemberInfo[]
  memberColors: Record<string, string>
  memberLabels: Record<string, string>
  loading: boolean
  initialized: boolean
  updateMember: (id: FamilyMember, updates: { label?: string; color?: string; visible?: boolean }) => Promise<void>
  initializeMembers: () => Promise<void>
}

const MembersContext = createContext<MembersContextType | null>(null)

export function MembersProvider({ children }: { children: ReactNode }) {
  const [firestoreMembers, setFirestoreMembers] = useState<MemberInfo[]>([])
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'members'), orderBy('order', 'asc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setInitialized(true)
        if (!snapshot.empty) {
          const data = snapshot.docs.map((d) => ({
            id: d.id as FamilyMember,
            ...(d.data() as Omit<MemberInfo, 'id'>),
          }))
          setFirestoreMembers(data)
        } else {
          setFirestoreMembers([])
        }
        setLoading(false)
      },
      (error) => {
        console.error('Members Firestore error:', error)
        setInitialized(true)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [])

  const members = firestoreMembers.length > 0 ? firestoreMembers : DEFAULT_MEMBERS

  const memberColors: Record<string, string> = Object.fromEntries(
    members.map((m) => [m.id, m.color])
  )

  const memberLabels: Record<string, string> = Object.fromEntries(
    members.map((m) => [m.id, m.label])
  )

  const updateMember = async (id: FamilyMember, updates: { label?: string; color?: string; visible?: boolean }) => {
    await setDoc(doc(db, 'members', id), updates, { merge: true })
  }

  const initializeMembers = async () => {
    const batch = writeBatch(db)
    DEFAULT_MEMBERS.forEach((m) => {
      batch.set(doc(db, 'members', m.id), {
        label: m.label,
        color: m.color,
        order: m.order,
      })
    })
    await batch.commit()
  }

  return (
    <MembersContext.Provider
      value={{ members, memberColors, memberLabels, loading, initialized, updateMember, initializeMembers }}
    >
      {children}
    </MembersContext.Provider>
  )
}

export function useMembers() {
  const context = useContext(MembersContext)
  if (!context) throw new Error('useMembers must be used within MembersProvider')
  return context
}
