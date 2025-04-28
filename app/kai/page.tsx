'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react'
import Recorder from 'recorder-js'

export default function KaiPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [recorder, setRecorder] = useState<typeof Recorder | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)

  useEffect(() => {
    if (!isRecording) return

    const startRecorder = async () => {
      console.log('🎙️ Starting recording with RecorderJS...')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const newRecorder = new Recorder(audioCtx)

      await newRecorder.init(stream)
      newRecorder.start()

      setRecorder(newRecorder as Recorder)
      setAudioContext(audioCtx)

      console.log('🟢 Recorder started.')

      setTimeout(async () => {
        console.log('🛑 Auto-stopping recorder after 10 seconds...')
        if (newRecorder) {
          const { blob } = await newRecorder.stop()
          console.log('🎙️ Got WAV blob:', blob.size, 'bytes')

          if (blob.size === 0) {
            console.error('❌ No audio captured.')
            return
          }

          const formData = new FormData()
          formData.append('file', blob)
          formData.append('model', 'whisper-1')

          console.log('📤 Sending WAV blob to OpenAI Speech API...')

          try {
            const openaiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
              },
              body: formData,
            })

            const transcription = await openaiResponse.json()

            console.log('🧠 OpenAI response:', transcription)

            if (transcription.text) {
              console.log('📩 Posting transcription to /api/kai:', transcription.text)
              await fetch('/api/kai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: transcription.text }),
              })
            } else {
              console.error('⚠️ No transcription text returned from OpenAI.')
            }
          } catch (error) {
            console.error('❌ Error calling OpenAI API:', error)
          }
        }
      }, 10000)
    }

    startRecorder()

    return () => {
      recorder?.stop()
      audioContext?.close()
    }
  }, [isRecording])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">🎤 Kai Control Panel (RecorderJS)</h1>
      <button
        onClick={() => {
          console.log('🎬 Button clicked. isRecording:', !isRecording)
          setIsRecording((prev) => !prev)
        }}
        className={`px-6 py-3 rounded-lg ${
          isRecording ? 'bg-red-600' : 'bg-blue-600'
        } text-white`}
      >
        {isRecording ? 'Stop Listening' : 'Start Listening'}
      </button>
    </div>
  )
}
