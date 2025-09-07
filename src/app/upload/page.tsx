'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore, useHasValidApiKeys, useApiKeys, useError } from '@/lib/store'
import { isValidImageFile, formatFileSize, createImagePreview, generateId } from '@/lib/utils'
import { GeminiClient } from '@/lib/gemini'
import type { PhotoMetadata } from '@/types'

export default function UploadPage() {
  const router = useRouter()
  const hasValidApiKeys = useHasValidApiKeys()
  const apiKeys = useApiKeys()
  const { addPhoto, addAnalysis, setLoadingState, setError, clearError } = useAppStore()
  const uploadError = useError('upload')
  const analysisError = useError('analysis')

  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = async (file: File) => {
    if (!isValidImageFile(file)) {
      setError('upload', 'Please select a valid image file (JPEG, PNG, or WebP)')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('upload', 'File size must be less than 10MB')
      return
    }

    clearError('upload')
    setSelectedFile(file)
    
    try {
      const previewUrl = await createImagePreview(file)
      setPreview(previewUrl)
    } catch (error) {
      setError('upload', 'Failed to create image preview')
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile || !hasValidApiKeys) return

    setIsAnalyzing(true)
    setLoadingState('analysis', 'loading')
    clearError('analysis')

    try {
      // Create photo metadata
      const photoMetadata: PhotoMetadata = {
        id: generateId(),
        filename: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        uploadedAt: new Date()
      }

      // Add photo to store
      addPhoto(photoMetadata)

      // Convert file to base64 for analysis
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const imageData = e.target?.result as string
          
          // Initialize Gemini client and analyze photo
          const geminiClient = new GeminiClient(apiKeys.gemini)
          const analysis = await geminiClient.analyzePhoto(imageData)
          
          // Set the photo ID in the analysis
          analysis.photoId = photoMetadata.id
          
          // Add analysis to store
          addAnalysis(analysis)
          
          setLoadingState('analysis', 'success')
          
          // Navigate to memory page
          router.push(`/memory/${photoMetadata.id}`)
        } catch (error) {
          console.error('Analysis error:', error)
          setError('analysis', 'Failed to analyze photo. Please check your API key and try again.')
          setLoadingState('analysis', 'error')
        }
      }
      
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error('Upload error:', error)
      setError('analysis', 'Failed to process photo')
      setLoadingState('analysis', 'error')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreview(null)
    clearError('upload')
  }

  if (!hasValidApiKeys) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
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

        <div className="container mx-auto px-4 py-16 text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>API Keys Required</CardTitle>
              <CardDescription>
                Please configure your API keys before uploading photos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings">
                <Button className="w-full">
                  Configure API Keys
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Photo</h2>
          <p className="text-gray-600">
            Choose a photo to begin your memory enhancement journey. Our AI will analyze the image and create an emotional story around it.
          </p>
        </div>

        {/* Error Display */}
        {(uploadError || analysisError) && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">
                  {uploadError || analysisError}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!selectedFile ? (
          <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
            <CardContent className="p-8">
              <div
                className={`text-center ${dragActive ? 'bg-blue-50' : ''} rounded-lg p-8 transition-colors`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Drop your photo here, or click to browse
                </h3>
                <p className="text-gray-600 mb-6">
                  Supports JPEG, PNG, and WebP files up to 10MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button asChild>
                    <span className="cursor-pointer">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Choose Photo
                    </span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Preview Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Selected Photo</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearSelection}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    {preview && (
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg border"
                      />
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Filename</label>
                      <p className="text-sm text-gray-900">{selectedFile.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Size</label>
                      <p className="text-sm text-gray-900">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Type</label>
                      <p className="text-sm text-gray-900">{selectedFile.type}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analyze Button */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ready to Analyze Your Photo?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Our AI will analyze the visual content, emotions, and create conversation starters about your memory.
                  </p>
                  <Button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Analyzing Photo...
                      </>
                    ) : (
                      <>
                        <Camera className="h-5 w-5 mr-2" />
                        Analyze Photo
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
