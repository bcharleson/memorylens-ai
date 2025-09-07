import { NextRequest, NextResponse } from 'next/server'
import { GeminiClient } from '@/lib/gemini'
import type { APIResponse, AnalysisResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageData, apiKey, photoId } = body

    if (!imageData) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'No image data provided'
      }, { status: 400 })
    }

    if (!apiKey) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'Gemini API key is required'
      }, { status: 400 })
    }

    if (!photoId) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'Photo ID is required'
      }, { status: 400 })
    }

    // Validate API key format
    if (!apiKey.startsWith('AIza')) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'Invalid Gemini API key format'
      }, { status: 400 })
    }

    // Initialize Gemini client
    const geminiClient = new GeminiClient(apiKey)

    // Analyze the photo
    const analysis = await geminiClient.analyzePhoto(imageData)
    
    // Set the photo ID
    analysis.photoId = photoId

    return NextResponse.json<AnalysisResponse>({
      success: true,
      data: {
        analysis
      },
      message: 'Photo analyzed successfully'
    })

  } catch (error) {
    console.error('Analysis error:', error)
    
    // Handle specific Gemini API errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json<APIResponse>({
          success: false,
          error: 'Invalid or expired API key'
        }, { status: 401 })
      }
      
      if (error.message.includes('quota')) {
        return NextResponse.json<APIResponse>({
          success: false,
          error: 'API quota exceeded. Please try again later.'
        }, { status: 429 })
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json<APIResponse>({
          success: false,
          error: 'Rate limit exceeded. Please wait before trying again.'
        }, { status: 429 })
      }
    }

    return NextResponse.json<APIResponse>({
      success: false,
      error: 'Failed to analyze photo. Please check your API key and try again.'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json<APIResponse>({
    success: false,
    error: 'Method not allowed'
  }, { status: 405 })
}
