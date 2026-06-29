import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { MembersProvider } from '@/contexts/MembersContext'
import { EventsProvider } from '@/contexts/EventsContext'
import FCMInitializer from '@/components/FCMInitializer'

export const metadata: Metadata = {
  title: '家族カレンダー',
  description: '家族専用カレンダーアプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          <MembersProvider>
            <EventsProvider>
              <FCMInitializer />
              {children}
            </EventsProvider>
          </MembersProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
