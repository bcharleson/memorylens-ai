import { useState } from 'react'
import axios from 'axios'
import type { PhotoAnalysis, APIResponse, AnalysisResponse } from '@/types'

interface UsePhotoAnalysisReturn {
  analyzePhoto: (imageData: string, apiKey: string, photoId: string) => Promise<PhotoAnalysis>
  isAnalyzing: boolean
  error: string | null
}

export function usePhotoAnalysis(): UsePhotoAnalysisReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzePhoto = async (imageData: string, apiKey: string, photoId: string): Promise<PhotoAnalysis> => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await axios.post<AnalysisResponse>('/api/analyze', {
        imageData,
        apiKey,
        photoId
      })

      if (!response.data.success) {
        throw new Error(response.data.error || 'Analysis failed')
      }

      return response.data.data.analysis
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.error || err.message
        : 'Failed to analyze photo'
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return {
    analyzePhoto,
    isAnalyzing,
    error
  }
}
