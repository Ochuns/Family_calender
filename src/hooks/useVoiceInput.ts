'use client'

import { useState, useCallback, useRef } from 'react'

export type VoiceInputState = 'idle' | 'listening' | 'error'

interface UseVoiceInputOptions {
  onResult: (text: string) => void
  lang?: string
}

// SpeechRecognition is not fully typed in Next.js default tsconfig
type SR = {
  new (): {
    lang: string
    interimResults: boolean
    maxAlternatives: number
    onstart: (() => void) | null
    onresult: ((event: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null
    onerror: (() => void) | null
    onend: (() => void) | null
    start: () => void
    stop: () => void
  }
}

declare global {
  interface Window {
    SpeechRecognition?: SR
    webkitSpeechRecognition?: SR
  }
}

export function useVoiceInput({ onResult, lang = 'ja-JP' }: UseVoiceInputOptions) {
  const [state, setState] = useState<VoiceInputState>('idle')
  const recognitionRef = useRef<{ stop: () => void } | null>(null)

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const start = useCallback(() => {
    if (!isSupported) return

    const SRClass = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!SRClass) return
    const recognition = new SRClass()
    recognition.lang = lang
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setState('listening')

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript
      onResult(text)
      setState('idle')
    }

    recognition.onerror = () => setState('error')

    recognition.onend = () => {
      setState((s) => (s === 'listening' ? 'idle' : s))
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [isSupported, lang, onResult])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setState('idle')
  }, [])

  return { state, isSupported, start, stop }
}
