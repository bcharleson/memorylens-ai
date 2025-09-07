import { NextRequest, NextResponse } from 'next/server'
import type { APIResponse, UploadResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'No file provided'
      }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.'
      }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'File size too large. Maximum size is 10MB.'
      }, { status: 400 })
    }

    // Convert file to buffer for processing
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // In a real implementation, you might:
    // 1. Upload to cloud storage (AWS S3, Google Cloud Storage, etc.)
    // 2. Generate thumbnails
    // 3. Extract EXIF data
    // 4. Store metadata in database

    // For demo purposes, we'll create a mock photo metadata object
    const photoMetadata = {
      id: Math.random().toString(36).substring(2),
      filename: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      // In production, this would be the actual storage URL
      uploadUrl: `data:${file.type};base64,${buffer.toString('base64')}`
    }

    return NextResponse.json<UploadResponse>({
      success: true,
      data: {
        photo: photoMetadata,
        uploadUrl: photoMetadata.uploadUrl
      },
      message: 'Photo uploaded successfully'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json<APIResponse>({
      success: false,
      error: 'Failed to upload photo'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json<APIResponse>({
    success: false,
    error: 'Method not allowed'
  }, { status: 405 })
}
