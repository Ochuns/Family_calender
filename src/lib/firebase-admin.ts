import { getApps, initializeApp, cert, App } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'
import { getFirestore } from 'firebase-admin/firestore'

let adminApp: App

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0]
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
  return adminApp
}

export function adminMessaging() {
  return getMessaging(getAdminApp())
}

export function adminDb() {
  return getFirestore(getAdminApp())
}
