import { NextRequest, NextResponse } from 'next/server'
import { ElevenLabsClient } from '@/lib/elevenlabs'
import type { APIResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get('apiKey')

    if (!apiKey) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'ElevenLabs API key is required'
      }, { status: 400 })
    }

    // Initialize ElevenLabs client
    const elevenLabsClient = new ElevenLabsClient(apiKey)

    // Get available voices
    const voices = await elevenLabsClient.getAvailableVoices()

    return NextResponse.json<APIResponse>({
      success: true,
      data: { voices },
      message: 'Voices retrieved successfully'
    })

  } catch (error) {
    console.error('Voices retrieval error:', error)
    
    // Handle specific ElevenLabs API errors
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('401')) {
        return NextResponse.json<APIResponse>({
          success: false,
          error: 'Invalid or expired ElevenLabs API key'
        }, { status: 401 })
      }
    }

    return NextResponse.json<APIResponse>({
      success: false,
      error: 'Failed to retrieve voices'
    }, { status: 500 })
  }
}

export async function POST() {
  return NextResponse.json<APIResponse>({
    success: false,
    error: 'Method not allowed'
  }, { status: 405 })
}
