import { NextRequest, NextResponse } from 'next/server'
import { ElevenLabsClient } from '@/lib/elevenlabs'
import type { APIResponse, VoiceResponse, PhotoAnalysis, ConversationMessage, VoiceAgent } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      text, 
      apiKey, 
      voiceSettings, 
      photoAnalysis, 
      conversationHistory, 
      voiceAgent,
      type = 'response' // 'response' or 'narration'
    } = body

    if (!apiKey) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'ElevenLabs API key is required'
      }, { status: 400 })
    }

    // Initialize ElevenLabs client
    const elevenLabsClient = new ElevenLabsClient(apiKey)

    let audioUrl: string
    let responseText: string

    if (type === 'response' && photoAnalysis && conversationHistory && voiceAgent) {
      // Generate conversational response
      const response = await elevenLabsClient.generateConversationResponse(
        photoAnalysis as PhotoAnalysis,
        conversationHistory as ConversationMessage[],
        voiceAgent as VoiceAgent
      )
      
      audioUrl = response.audioUrl
      responseText = response.text
    } else if (type === 'narration' && photoAnalysis && conversationHistory && voiceAgent) {
      // Generate story narration
      const response = await elevenLabsClient.generateStoryNarration(
        photoAnalysis as PhotoAnalysis,
        conversationHistory as ConversationMessage[],
        voiceAgent as VoiceAgent
      )
      
      audioUrl = response.audioUrl
      responseText = response.text
    } else if (text && voiceSettings) {
      // Generate speech from text
      audioUrl = await elevenLabsClient.generateSpeech(text, voiceSettings)
      responseText = text
    } else {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'Invalid request parameters'
      }, { status: 400 })
    }

    // Calculate approximate duration (rough estimate: 150 words per minute)
    const wordCount = responseText.split(' ').length
    const estimatedDuration = Math.max(1, Math.round((wordCount / 150) * 60))

    return NextResponse.json<VoiceResponse>({
      success: true,
      data: {
        audioUrl,
        text: responseText,
        duration: estimatedDuration
      },
      message: 'Voice generated successfully'
    })

  } catch (error) {
    console.error('Voice generation error:', error)
    
    // Handle specific ElevenLabs API errors
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('401')) {
        return NextResponse.json<APIResponse>({
          success: false,
          error: 'Invalid or expired ElevenLabs API key'
        }, { status: 401 })
      }
      
      if (error.message.includes('quota') || error.message.includes('402')) {
        return NextResponse.json<APIResponse>({
          success: false,
          error: 'ElevenLabs quota exceeded. Please check your subscription.'
        }, { status: 402 })
      }
      
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return NextResponse.json<APIResponse>({
          success: false,
          error: 'Rate limit exceeded. Please wait before trying again.'
        }, { status: 429 })
      }
    }

    return NextResponse.json<APIResponse>({
      success: false,
      error: 'Failed to generate voice. Please check your API key and try again.'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json<APIResponse>({
    success: false,
    error: 'Method not allowed'
  }, { status: 405 })
}
