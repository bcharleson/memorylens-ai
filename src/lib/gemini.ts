import { GoogleGenerativeAI } from '@google/generative-ai'
import type { PhotoAnalysis, Enhancement, QualityMetrics } from '@/types'

export class GeminiClient {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor(apiKey: string) {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('Gemini API key is required')
    }

    this.genAI = new GoogleGenerativeAI(apiKey)
    // Using the Nano Banana Hackathon specific model for state-of-the-art image generation and editing
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' })
  }

  async analyzePhoto(imageData: string): Promise<PhotoAnalysis> {
    try {
      // Extract MIME type from data URL
      const mimeTypeMatch = imageData.match(/data:([^;]+);base64,/)
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg'
      const base64Data = imageData.split(',')[1]

      if (!base64Data) {
        throw new Error('Invalid image data format')
      }

      const prompt = `
        Analyze this photo in detail and provide a comprehensive analysis in JSON format.

        Please analyze:
        1. Visual content (objects, people, emotions, setting, time of day, weather, activities)
        2. Photo quality metrics (sharpness, brightness, contrast, saturation, noise level)
        3. Enhancement suggestions with priorities
        4. Story elements (suggested questions, themes, emotional tone)

        Return a JSON object with this structure:
        {
          "visualContent": {
            "objects": ["object1", "object2"],
            "people": [{"confidence": 0.95, "estimatedAge": "adult", "emotions": [{"emotion": "joy", "confidence": 0.8}]}],
            "emotions": [{"emotion": "joy", "confidence": 0.8}],
            "setting": "indoor/outdoor description",
            "timeOfDay": "morning/afternoon/evening/night",
            "weather": "sunny/cloudy/rainy/etc",
            "activity": "description of what's happening"
          },
          "quality": {
            "overall": 85,
            "sharpness": 90,
            "brightness": 80,
            "contrast": 85,
            "saturation": 75,
            "noise": 10
          },
          "enhancement": {
            "suggestions": [
              {"type": "brightness", "intensity": 15, "description": "Slightly brighten the image"},
              {"type": "contrast", "intensity": 10, "description": "Enhance contrast for better definition"}
            ],
            "priority": "medium"
          },
          "story": {
            "suggestedQuestions": [
              "What was the occasion for this photo?",
              "Who are the people in this image?",
              "What memories does this bring back?"
            ],
            "themes": ["family", "celebration", "happiness"],
            "emotionalTone": "joyful and warm"
          }
        }

        Be specific and detailed in your analysis. Focus on elements that would help create meaningful conversations about memories.
      `

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ])

      const response = await result.response
      const text = response.text()

      // Clean up the response text to ensure it's valid JSON
      let cleanText = text.trim()
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }

      // Parse JSON response
      const analysisData = JSON.parse(cleanText)

      // Create PhotoAnalysis object with generated ID
      const analysis: PhotoAnalysis = {
        id: Math.random().toString(36).substring(2),
        photoId: '', // Will be set by caller
        ...analysisData
      }

      return analysis
    } catch (error) {
      console.error('Error analyzing photo with Gemini:', error)

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID')) {
          throw new Error('Invalid Gemini API key. Please check your API key in Settings.')
        } else if (error.message.includes('QUOTA_EXCEEDED')) {
          throw new Error('Gemini API quota exceeded. Please try again later.')
        } else if (error.message.includes('JSON')) {
          throw new Error('Failed to parse AI response. Please try again.')
        }
      }

      throw new Error('Failed to analyze photo. Please check your API key and try again.')
    }
  }

  async enhancePhoto(imageData: string, enhancements: Enhancement[]): Promise<string> {
    try {
      // For demo purposes, we'll simulate enhancement by returning the original image
      // In a real implementation, you would use Gemini's image editing capabilities
      
      const enhancementPrompt = `
        Apply the following enhancements to this image:
        ${enhancements.map(e => `- ${e.type}: ${e.intensity}% (${e.description})`).join('\n')}
        
        Return an enhanced version of the image that applies these improvements.
      `

      // Note: This is a simplified implementation
      // Gemini 2.0 Flash would handle actual image enhancement
      console.log('Enhancement request:', enhancementPrompt)
      
      // For now, return the original image
      // In production, this would return the enhanced image data
      return imageData
    } catch (error) {
      console.error('Error enhancing photo with Gemini:', error)
      throw new Error('Failed to enhance photo')
    }
  }

  async generateStoryQuestions(analysis: PhotoAnalysis): Promise<string[]> {
    try {
      const prompt = `
        Based on this photo analysis, generate 5-7 thoughtful questions that would help someone share memories and stories about this photo:
        
        Visual Content: ${JSON.stringify(analysis.visualContent)}
        Themes: ${analysis.story.themes.join(', ')}
        Emotional Tone: ${analysis.story.emotionalTone}
        
        Generate questions that are:
        - Personal and memory-focused
        - Emotionally engaging
        - Open-ended to encourage storytelling
        - Specific to the content of the photo
        
        Return as a JSON array of strings.
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return JSON.parse(text)
    } catch (error) {
      console.error('Error generating story questions:', error)
      return analysis.story.suggestedQuestions
    }
  }

  async extractMetadata(imageData: string): Promise<any> {
    try {
      const prompt = `
        Extract and analyze any visible metadata or contextual information from this image:
        - Any visible dates, locations, or text
        - Architectural or environmental clues about location
        - Clothing or objects that might indicate time period
        - Any other contextual information
        
        Return as JSON with extracted information.
      `

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageData.split(',')[1],
            mimeType: 'image/jpeg'
          }
        }
      ])

      const response = await result.response
      const text = response.text()
      
      return JSON.parse(text)
    } catch (error) {
      console.error('Error extracting metadata:', error)
      return {}
    }
  }

  async generateImageDescription(imageData: string): Promise<string> {
    try {
      const prompt = `
        Provide a detailed, emotional description of this photo that captures:
        - The visual elements and composition
        - The mood and atmosphere
        - The story it seems to tell
        - The emotions it evokes
        
        Write in a warm, narrative style as if describing a cherished memory.
      `

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageData.split(',')[1],
            mimeType: 'image/jpeg'
          }
        }
      ])

      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Error generating image description:', error)
      throw new Error('Failed to generate image description')
    }
  }
}
