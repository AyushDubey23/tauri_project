"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, Mic, MicOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function VoiceTranscriptionPage() {
  // State management for recording and transcription
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Refs to persist across renders without causing re-renders
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const websocketRef = useRef<WebSocket | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Deepgram API Key - Replace with your actual API key
const DEEPGRAM_API_KEY = "26b5c519a0b243a2122d49f644024d416594ecc8";

  /**
   * Start Recording Function
   * 1. Request microphone access from the browser
   * 2. Establish WebSocket connection to Deepgram's real-time API
   * 3. Create MediaRecorder to capture audio chunks
   * 4. Send audio data to Deepgram for transcription
   */
  const startRecording = async () => {
    try {
      setError(null)
      setIsConnecting(true)

      // Request microphone access using Web Audio API
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true, // Simplified to use default audio settings for better browser compatibility
      })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      // Establish WebSocket connection to Deepgram's streaming API
      const websocket = new WebSocket(
        "wss://api.deepgram.com/v1/listen",
        ["token", DEEPGRAM_API_KEY], // Simplified URL - Deepgram auto-detects encoding
      )

      websocketRef.current = websocket

      // WebSocket event handlers
      websocket.onopen = () => {
        console.log("[v0] WebSocket connection established")
        setIsConnecting(false)
        setIsRecording(true)

        mediaRecorder.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0 && websocket.readyState === WebSocket.OPEN) {
            // Send audio blob directly to Deepgram (no conversion needed)
            websocket.send(event.data)
          }
        })

        // Start recording and send data every 250ms for real-time transcription
        mediaRecorder.start(250)
      }

      // Handle incoming transcription results from Deepgram
      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        const transcriptText = data.channel?.alternatives?.[0]?.transcript
        const isFinal = data.is_final // Check if this is the final transcript for this utterance

        // Only add non-empty final transcripts to avoid duplicates
        if (transcriptText && transcriptText.trim() !== "" && isFinal) {
          console.log("[v0] Received transcript:", transcriptText)
          setTranscript((prev) => [...prev, transcriptText])
        }
      }

      // Handle WebSocket errors
      websocket.onerror = (event) => {
        console.error("[v0] WebSocket error:", event)
        setError("Connection error. Please check your API key and network connection.")
        stopRecording()
      }

      // Handle WebSocket closure
      websocket.onclose = () => {
        console.log("[v0] WebSocket connection closed")
      }
    } catch (err) {
      setIsConnecting(false)
      console.error("[v0] Error starting recording:", err)

      // Handle specific error cases
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Microphone access denied. Please allow microphone access and try again.")
      } else if (err instanceof DOMException && err.name === "NotFoundError") {
        setError("No microphone found. Please connect a microphone and try again.")
      } else {
        setError("Failed to start recording. Please check your microphone and try again.")
      }
    }
  }

  /**
   * Stop Recording Function
   * 1. Stop the MediaRecorder
   * 2. Close the WebSocket connection
   * 3. Release microphone resources
   */
  const stopRecording = () => {
    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }

    // Close WebSocket connection
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.close()
      websocketRef.current = null
    }

    // Release microphone stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    setIsRecording(false)
    setIsConnecting(false)
  }

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopRecording()
    }
  }, [])

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Voice-to-Text Transcription</h1>
          <p className="text-muted-foreground">Real-time speech transcription powered by Deepgram AI</p>
        </div>

        {/* Recording Controls */}
        <Card className="p-8">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              {/* Start Recording Button */}
              <Button
                onClick={startRecording}
                disabled={isRecording || isConnecting}
                size="lg"
                className="min-w-[180px]"
              >
                <Mic className="mr-2 h-5 w-5" />
                {isConnecting ? "Connecting..." : "Start Recording"}
              </Button>

              {/* Stop Recording Button */}
              <Button
                onClick={stopRecording}
                disabled={!isRecording}
                variant="destructive"
                size="lg"
                className="min-w-[180px]"
              >
                <MicOff className="mr-2 h-5 w-5" />
                Stop Recording
              </Button>
            </div>

            {/* Recording Status Indicator */}
            {isRecording && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                <span>Recording in progress...</span>
              </div>
            )}

            {/* Instructions */}
            <p className="text-center text-sm text-muted-foreground">
              Click "Start Recording" to begin transcription. Speak clearly into your microphone.
            </p>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Transcription Output */}
        <Card className="p-6">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Transcription</h2>
            <div className="min-h-[300px] max-h-[500px] overflow-y-auto rounded-md border border-border bg-muted/30 p-4">
              {transcript.length === 0 ? (
                <p className="text-center text-muted-foreground">Transcribed text will appear here...</p>
              ) : (
                <div className="space-y-2">
                  {transcript.map((text, index) => (
                    <p key={index} className="text-foreground leading-relaxed">
                      {text}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* API Key Notice */}
        {DEEPGRAM_API_KEY === "YOUR_DEEPGRAM_API_KEY_HERE" && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please set your Deepgram API key in the environment variable{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">NEXT_PUBLIC_DEEPGRAM_API_KEY</code>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </main>
  )
}
