'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Camera, Send, Mic, MicOff, Volume2, VolumeX, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAppStore, useApiKeys } from '@/lib/store'
import { ElevenLabsClient } from '@/lib/elevenlabs'
import type { ConversationMessage } from '@/types'

interface MemoryPageProps {
  params: {
    id: string
  }
}

export default function MemoryPage({ params }: MemoryPageProps) {
  const { photos, analyses, conversation, addMessage, voiceAgent } = useAppStore()
  const apiKeys = useApiKeys()
  
  const [message, setMessage] = useState('')
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Find the photo and analysis for this memory
  const photo = photos.find(p => p.id === params.id)
  const analysis = analyses.find(a => a.photoId === params.id)

  useEffect(() => {
    // Initialize conversation if this is the first visit
    if (analysis && conversation.length === 0) {
      initializeConversation()
    }
  }, [analysis])

  const initializeConversation = async () => {
    if (!analysis || !apiKeys.elevenlabs) return

    try {
      const elevenLabsClient = new ElevenLabsClient(apiKeys.elevenlabs)
      const response = await elevenLabsClient.generateConversationResponse(
        analysis,
        [],
        voiceAgent
      )

      const welcomeMessage: ConversationMessage = {
        id: Math.random().toString(36).substring(2),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        audioUrl: response.audioUrl,
        relatedPhotoId: params.id
      }

      addMessage(welcomeMessage)
    } catch (error) {
      console.error('Failed to initialize conversation:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !analysis || !apiKeys.elevenlabs) return

    const userMessage: ConversationMessage = {
      id: Math.random().toString(36).substring(2),
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
      relatedPhotoId: params.id
    }

    addMessage(userMessage)
    setMessage('')
    setIsGeneratingResponse(true)

    try {
      const elevenLabsClient = new ElevenLabsClient(apiKeys.elevenlabs)
      const response = await elevenLabsClient.generateConversationResponse(
        analysis,
        [...conversation, userMessage],
        voiceAgent
      )

      const assistantMessage: ConversationMessage = {
        id: Math.random().toString(36).substring(2),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        audioUrl: response.audioUrl,
        relatedPhotoId: params.id
      }

      addMessage(assistantMessage)
    } catch (error) {
      console.error('Failed to generate response:', error)
      const errorMessage: ConversationMessage = {
        id: Math.random().toString(36).substring(2),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date(),
        relatedPhotoId: params.id
      }
      addMessage(errorMessage)
    } finally {
      setIsGeneratingResponse(false)
    }
  }

  const playAudio = (audioUrl: string) => {
    if (currentAudio) {
      currentAudio.pause()
      setCurrentAudio(null)
      setIsPlaying(false)
    }

    const audio = new Audio(audioUrl)
    audio.onplay = () => setIsPlaying(true)
    audio.onended = () => {
      setIsPlaying(false)
      setCurrentAudio(null)
    }
    audio.onerror = () => {
      setIsPlaying(false)
      setCurrentAudio(null)
    }

    setCurrentAudio(audio)
    audio.play()
  }

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause()
      setCurrentAudio(null)
      setIsPlaying(false)
    }
  }

  if (!photo || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Memory Not Found</CardTitle>
            <CardDescription>
              The requested memory could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>Return Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/upload">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Camera className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">MemoryLens AI</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Photo and Analysis Panel */}
          <div className="space-y-6">
            {/* Photo Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                  Your Memory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {/* In a real implementation, you'd display the actual photo here */}
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <Camera className="h-16 w-16" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900">{photo.filename}</h3>
                  <p className="text-sm text-gray-600">
                    Uploaded {photo.uploadedAt.toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
                <CardDescription>
                  What our AI discovered about your photo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Visual Content</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.visualContent.objects.slice(0, 5).map((object, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {object}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Emotional Tone</h4>
                  <p className="text-sm text-gray-700 capitalize">
                    {analysis.story.emotionalTone}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Themes</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.story.themes.map((theme, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Setting</h4>
                  <p className="text-sm text-gray-700">
                    {analysis.visualContent.setting} • {analysis.visualContent.timeOfDay}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversation Panel */}
          <div className="space-y-6">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Memory Conversation</CardTitle>
                <CardDescription>
                  Share your memories and stories about this photo
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {conversation
                    .filter(msg => msg.relatedPhotoId === params.id)
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          {msg.audioUrl && msg.role === 'assistant' && (
                            <div className="mt-2 flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant={msg.role === 'user' ? 'secondary' : 'outline'}
                                onClick={() => playAudio(msg.audioUrl!)}
                                disabled={isPlaying}
                              >
                                {isPlaying ? (
                                  <VolumeX className="h-3 w-3" />
                                ) : (
                                  <Volume2 className="h-3 w-3" />
                                )}
                              </Button>
                              {isPlaying && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={stopAudio}
                                >
                                  Stop
                                </Button>
                              )}
                            </div>
                          )}
                          <p className="text-xs opacity-70 mt-1">
                            {msg.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  
                  {isGeneratingResponse && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-pulse">Thinking...</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share a memory about this photo..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isGeneratingResponse}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isGeneratingResponse}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
