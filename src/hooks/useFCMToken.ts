'use client'

import { useEffect } from 'react'
import { getToken, onMessage } from 'firebase/messaging'
import { doc, setDoc } from 'firebase/firestore'
import { db, messagingPromise } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'

function sanitizeVapidKey(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  // Remove ALL whitespace (handles line-wrapped values in .env) and surrounding quotes
  const cleaned = raw.replace(/\s+/g, '').replace(/^["']|["']$/g, '')
  // Allow URL-safe base64 chars (A-Z a-z 0-9 - _) plus optional = padding
  if (!cleaned || !/^[A-Za-z0-9_=-]{10,}$/.test(cleaned)) return undefined
  return cleaned
}

export function useFCMToken() {
  const { user } = useAuth()

  useEffect(() => {
    // Evaluate the key inside the effect so it only runs in the browser,
    // not at module evaluation time (which fires on every page navigation).
    const vapidKey = sanitizeVapidKey(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY)
    if (!user || !vapidKey) return

    let cancelled = false

    async function register() {
      try {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted' || cancelled) return

        const sw = await navigator.serviceWorker.register('/api/firebase-sw', {
          scope: '/',
        })
        await navigator.serviceWorker.ready
        if (cancelled) return

        const messaging = await messagingPromise
        if (!messaging || cancelled) return

        const token = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: sw,
        })

        if (token && user && !cancelled) {
          await setDoc(doc(db, 'fcmTokens', user.uid), { token })
        }

        if (!cancelled) {
          onMessage(messaging, (payload) => {
            const title = payload.notification?.title ?? '家族カレンダー'
            const body = payload.notification?.body ?? ''
            if (Notification.permission === 'granted') {
              new Notification(title, { body, icon: '/icon-192.png' })
            }
          })
        }
      } catch (e) {
        console.error('FCM registration failed:', e)
      }
    }

    if ('Notification' in window && 'serviceWorker' in navigator) {
      register()
    }

    return () => {
      cancelled = true
    }
  }, [user])
}
