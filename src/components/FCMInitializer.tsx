'use client'

import { useFCMToken } from '@/hooks/useFCMToken'

export default function FCMInitializer() {
  useFCMToken()
  return null
}
