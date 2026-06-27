'use client'

import { useEffect } from 'react'
import { getToken, onMessage } from 'firebase/messaging'
import { doc, setDoc } from 'firebase/firestore'
import { db, messagingPromise } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'

// Trim whitespace and stray quotes that may be added by some .env editors
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
  ?.trim()
  .replace(/^["']|["']$/g, '')

export function useFCMToken() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user || !VAPID_KEY) return

    let registered = false

    async function register() {
      try {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        const sw = await navigator.serviceWorker.register('/api/firebase-sw', {
          scope: '/',
        })
        await navigator.serviceWorker.ready

        const messaging = await messagingPromise
        if (!messaging) return

        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: sw,
        })

        if (token && user) {
          await setDoc(doc(db, 'fcmTokens', user.uid), { token })
        }

        registered = true

        // Handle foreground messages
        onMessage(messaging, (payload) => {
          const title = payload.notification?.title ?? '家族カレンダー'
          const body = payload.notification?.body ?? ''
          if (Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/icon-192.png' })
          }
        })
      } catch (e) {
        console.error('FCM registration failed:', e)
      }
    }

    if ('Notification' in window && 'serviceWorker' in navigator) {
      register()
    }

    return () => {
      // cleanup: registered flag prevents double-registration on strict mode remounts
      registered = false
    }
  }, [user])
}
