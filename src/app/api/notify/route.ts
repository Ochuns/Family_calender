import { NextRequest, NextResponse } from 'next/server'
import { adminMessaging, adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const { title, memberLabel, eventTitle } = await req.json()

    const db = adminDb()
    const tokensSnap = await db.collection('fcmTokens').get()

    if (tokensSnap.empty) {
      return NextResponse.json({ sent: 0 })
    }

    const tokens: string[] = []
    tokensSnap.forEach((doc) => {
      const token = doc.data().token as string | undefined
      if (token) tokens.push(token)
    })

    if (tokens.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    const notificationTitle = `${memberLabel}の予定が追加されました`
    const notificationBody = eventTitle || title || '新しい予定'

    const result = await adminMessaging().sendEachForMulticast({
      tokens,
      notification: {
        title: notificationTitle,
        body: notificationBody,
      },
      webpush: {
        notification: {
          icon: '/icon-192.png',
        },
      },
    })

    // Remove invalid tokens from Firestore
    const invalidTokenIndices: number[] = []
    result.responses.forEach((res, i) => {
      if (!res.success) invalidTokenIndices.push(i)
    })

    if (invalidTokenIndices.length > 0) {
      const batch = db.batch()
      tokensSnap.docs.forEach((doc, i) => {
        if (invalidTokenIndices.includes(i)) {
          batch.delete(doc.ref)
        }
      })
      await batch.commit()
    }

    return NextResponse.json({ sent: result.successCount })
  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
