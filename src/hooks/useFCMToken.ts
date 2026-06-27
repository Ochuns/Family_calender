'use client'

import { useEffect } from 'react'
import { getToken, onMessage } from 'firebase/messaging'
import { doc, setDoc } from 'firebase/firestore'
import { db, messagingPromise } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'

function sanitizeVapidKey(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  // Remove ALL whitespace (trim() misses mid-string newlines from line-wrapped .env values)
  // and strip surrounding quotes from some editors
  const cleaned = raw.replace(/\s+/g, '').replace(/^["']|["']$/g, '')
  // VAPID keys are URL-safe base64 (A-Z a-z 0-9 - _), typically 87 chars
  if (!cleaned || !/^[A-Za-z0-9_-]{10,}$/.test(cleaned)) {
    console.error(
      '[FCM] VAPID key is invalid. Open Firebase Console → Project Settings → Cloud Messaging → Web Push certificates and copy the key pair again into NEXT_PUBLIC_FIREBASE_VAPID_KEY in .env.local'
    )
    return undefined
  }
  return cleaned
}

const VAPID_KEY = sanitizeVapidKey(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY)

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
