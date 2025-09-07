import { useState } from 'react'
import axios from 'axios'
import type { VoiceResponse, PhotoAnalysis, ConversationMessage, VoiceAgent } from '@/types'

interface UseVoiceGenerationReturn {
  generateVoiceResponse: (
    photoAnalysis: PhotoAnalysis,
    conversationHistory: ConversationMessage[],
    voiceAgent: VoiceAgent,
    apiKey: string
  ) => Promise<{ text: string; audioUrl: string; duration: number }>
  generateNarration: (
    photoAnalysis: PhotoAnalysis,
    conversationHistory: ConversationMessage[],
    voiceAgent: VoiceAgent,
    apiKey: string
  ) => Promise<{ text: string; audioUrl: string; duration: number }>
  generateSpeech: (
    text: string,
    voiceSettings: VoiceAgent['voiceSettings'],
    apiKey: string
  ) => Promise<{ text: string; audioUrl: string; duration: number }>
  isGenerating: boolean
  error: string | null
}

export function useVoiceGeneration(): UseVoiceGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const makeVoiceRequest = async (requestData: any): Promise<{ text: string; audioUrl: string; duration: number }> => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await axios.post<VoiceResponse>('/api/voice', requestData)

      if (!response.data.success) {
        throw new Error(response.data.error || 'Voice generation failed')
      }

      return response.data.data
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.error || err.message
        : 'Failed to generate voice'
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateVoiceResponse = async (
    photoAnalysis: PhotoAnalysis,
    conversationHistory: ConversationMessage[],
    voiceAgent: VoiceAgent,
    apiKey: string
  ) => {
    return makeVoiceRequest({
      type: 'response',
      photoAnalysis,
      conversationHistory,
      voiceAgent,
      apiKey
    })
  }

  const generateNarration = async (
    photoAnalysis: PhotoAnalysis,
    conversationHistory: ConversationMessage[],
    voiceAgent: VoiceAgent,
    apiKey: string
  ) => {
    return makeVoiceRequest({
      type: 'narration',
      photoAnalysis,
      conversationHistory,
      voiceAgent,
      apiKey
    })
  }

  const generateSpeech = async (
    text: string,
    voiceSettings: VoiceAgent['voiceSettings'],
    apiKey: string
  ) => {
    return makeVoiceRequest({
      text,
      voiceSettings,
      apiKey
    })
  }

  return {
    generateVoiceResponse,
    generateNarration,
    generateSpeech,
    isGenerating,
    error
  }
}
