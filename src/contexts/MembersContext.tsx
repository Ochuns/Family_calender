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
  getDocs,
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { db, auth } from '@/lib/firebase'
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
    let unsubscribeSnapshot: (() => void) | null = null

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot()
        unsubscribeSnapshot = null
      }

      if (user) {
        const q = query(collection(db, 'members'), orderBy('order', 'asc'))
        unsubscribeSnapshot = onSnapshot(
          q,
          async (snapshot) => {
            if (snapshot.empty) {
              // コレクションが空の場合、orderフィールドを含めてFirestoreに初期化
              // 書き込み後にonSnapshotが再発火するため、setFirestoreMembersは不要
              try {
                const check = await getDocs(collection(db, 'members'))
                if (check.empty) {
                  const batch = writeBatch(db)
                  DEFAULT_MEMBERS.forEach((m) => {
                    batch.set(doc(db, 'members', m.id), {
                      label: m.label,
                      color: m.color,
                      order: m.order,
                      visible: true,
                    })
                  })
                  await batch.commit()
                }
              } catch (e) {
                console.error('Members auto-initialize failed:', e)
                setInitialized(true)
                setLoading(false)
              }
              return
            }
            const data = snapshot.docs.map((d) => ({
              id: d.id as FamilyMember,
              ...(d.data() as Omit<MemberInfo, 'id'>),
            }))
            setFirestoreMembers(data)
            setInitialized(true)
            setLoading(false)
          },
          (error) => {
            console.error('Members Firestore error:', error)
            setInitialized(true)
            setLoading(false)
          }
        )
      } else {
        setFirestoreMembers([])
        setInitialized(true)
        setLoading(false)
      }
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeSnapshot) unsubscribeSnapshot()
    }
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
