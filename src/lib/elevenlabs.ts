import axios from 'axios'
import type { VoiceAgent, PhotoAnalysis, ConversationMessage } from '@/types'

export class ElevenLabsClient {
  private apiKey: string
  private baseUrl = 'https://api.elevenlabs.io/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateSpeech(text: string, voiceSettings: VoiceAgent['voiceSettings']): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceSettings.voiceId}`,
        {
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: voiceSettings.stability,
            similarity_boost: voiceSettings.similarityBoost,
            style: voiceSettings.style,
            use_speaker_boost: true
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          responseType: 'arraybuffer'
        }
      )

      // Convert audio data to base64 URL
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      return audioUrl
    } catch (error) {
      console.error('Error generating speech:', error)
      throw new Error('Failed to generate speech')
    }
  }

  async getAvailableVoices(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      })

      return response.data.voices
    } catch (error) {
      console.error('Error fetching voices:', error)
      return []
    }
  }

  async generateConversationResponse(
    photoAnalysis: PhotoAnalysis,
    conversationHistory: ConversationMessage[],
    voiceAgent: VoiceAgent
  ): Promise<{ text: string; audioUrl: string }> {
    try {
      // Generate contextual response based on photo analysis and conversation
      const responseText = await this.generateContextualResponse(
        photoAnalysis,
        conversationHistory,
        voiceAgent
      )

      // Convert to speech
      const audioUrl = await this.generateSpeech(responseText, voiceAgent.voiceSettings)

      return {
        text: responseText,
        audioUrl
      }
    } catch (error) {
      console.error('Error generating conversation response:', error)
      throw new Error('Failed to generate conversation response')
    }
  }

  private async generateContextualResponse(
    photoAnalysis: PhotoAnalysis,
    conversationHistory: ConversationMessage[],
    voiceAgent: VoiceAgent
  ): Promise<string> {
    // This would typically use a language model to generate responses
    // For demo purposes, we'll create contextual responses based on the analysis
    
    const lastMessage = conversationHistory[conversationHistory.length - 1]
    const isFirstMessage = conversationHistory.length <= 1

    if (isFirstMessage) {
      return this.generateOpeningResponse(photoAnalysis, voiceAgent)
    }

    return this.generateFollowUpResponse(photoAnalysis, lastMessage, voiceAgent)
  }

  private generateOpeningResponse(photoAnalysis: PhotoAnalysis, voiceAgent: VoiceAgent): string {
    const { visualContent, story } = photoAnalysis
    const tone = this.getPersonalityTone(voiceAgent.personality)

    const responses = [
      `${tone.greeting} What a wonderful photo! I can see ${visualContent.objects.slice(0, 2).join(' and ')} here. The ${story.emotionalTone} feeling really comes through. ${story.suggestedQuestions[0]}`,
      
      `${tone.greeting} This image has such a ${story.emotionalTone} atmosphere. I notice it was taken during the ${visualContent.timeOfDay}. ${story.suggestedQuestions[1]}`,
      
      `${tone.greeting} There's something really special about this photo. The ${story.themes[0]} theme is so evident. ${story.suggestedQuestions[0]}`
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  private generateFollowUpResponse(
    photoAnalysis: PhotoAnalysis,
    lastMessage: ConversationMessage,
    voiceAgent: VoiceAgent
  ): string {
    const tone = this.getPersonalityTone(voiceAgent.personality)
    const { story } = photoAnalysis

    // Simple response generation based on keywords in user's message
    const userMessage = lastMessage.content.toLowerCase()

    if (userMessage.includes('family') || userMessage.includes('relative')) {
      return `${tone.acknowledgment} Family moments are so precious. ${story.suggestedQuestions.find(q => q.includes('who')) || 'Tell me more about the people in this photo.'}`
    }

    if (userMessage.includes('celebration') || userMessage.includes('party') || userMessage.includes('birthday')) {
      return `${tone.excitement} Celebrations create the most wonderful memories! What made this occasion so special?`
    }

    if (userMessage.includes('place') || userMessage.includes('location') || userMessage.includes('where')) {
      return `${tone.curiosity} Places hold such powerful memories. What do you remember most about being there?`
    }

    // Default follow-up
    const remainingQuestions = story.suggestedQuestions.filter(q => 
      !conversationHistory.some(msg => msg.content.includes(q.slice(0, 10)))
    )

    if (remainingQuestions.length > 0) {
      return `${tone.acknowledgment} ${remainingQuestions[0]}`
    }

    return `${tone.acknowledgment} That's a beautiful memory. What other details about this moment stand out to you?`
  }

  private getPersonalityTone(personality: VoiceAgent['personality']) {
    switch (personality) {
      case 'warm':
        return {
          greeting: 'Hello there!',
          acknowledgment: 'That sounds wonderful.',
          excitement: 'How lovely!',
          curiosity: 'I'm curious,'
        }
      case 'nostalgic':
        return {
          greeting: 'What a treasure this is.',
          acknowledgment: 'Those were special times.',
          excitement: 'What beautiful memories!',
          curiosity: 'I wonder,'
        }
      case 'excited':
        return {
          greeting: 'Oh wow, this is amazing!',
          acknowledgment: 'That sounds incredible!',
          excitement: 'How exciting!',
          curiosity: 'I have to know,'
        }
      case 'gentle':
        return {
          greeting: 'This is such a lovely photo.',
          acknowledgment: 'Thank you for sharing that.',
          excitement: 'How special.',
          curiosity: 'If you don\'t mind me asking,'
        }
      default:
        return {
          greeting: 'Hello!',
          acknowledgment: 'I see.',
          excitement: 'That\'s wonderful!',
          curiosity: 'Tell me,'
        }
    }
  }

  async generateStoryNarration(
    photoAnalysis: PhotoAnalysis,
    conversationHistory: ConversationMessage[],
    voiceAgent: VoiceAgent
  ): Promise<{ text: string; audioUrl: string }> {
    try {
      // Generate a complete story narration based on the conversation
      const storyText = this.createStoryNarration(photoAnalysis, conversationHistory, voiceAgent)
      
      // Convert to speech with more dramatic voice settings for narration
      const narrationVoiceSettings = {
        ...voiceAgent.voiceSettings,
        stability: Math.min(voiceAgent.voiceSettings.stability + 0.2, 1.0),
        style: Math.min(voiceAgent.voiceSettings.style + 0.3, 1.0)
      }

      const audioUrl = await this.generateSpeech(storyText, narrationVoiceSettings)

      return {
        text: storyText,
        audioUrl
      }
    } catch (error) {
      console.error('Error generating story narration:', error)
      throw new Error('Failed to generate story narration')
    }
  }

  private createStoryNarration(
    photoAnalysis: PhotoAnalysis,
    conversationHistory: ConversationMessage[],
    voiceAgent: VoiceAgent
  ): string {
    const { visualContent, story } = photoAnalysis
    const userResponses = conversationHistory.filter(msg => msg.role === 'user')
    
    // Extract key details from conversation
    const storyElements = userResponses.map(msg => msg.content).join(' ')
    
    const tone = this.getPersonalityTone(voiceAgent.personality)
    
    return `
      This photograph captures a moment of ${story.emotionalTone}. 
      ${visualContent.setting} during the ${visualContent.timeOfDay}, 
      we see ${visualContent.objects.slice(0, 3).join(', ')}.
      
      ${storyElements ? `From what you've shared, ${storyElements.slice(0, 200)}...` : ''}
      
      The ${story.themes.join(' and ')} in this image remind us that 
      every photograph is more than just a picture - it's a doorway to our memories, 
      a keeper of moments that shaped who we are.
      
      This memory, like all precious memories, deserves to be cherished and shared.
    `.trim().replace(/\s+/g, ' ')
  }

  // Utility method to get default voice settings for different personalities
  static getDefaultVoiceSettings(personality: VoiceAgent['personality']): VoiceAgent['voiceSettings'] {
    const baseSettings = {
      voiceId: 'EXAVITQu4vr4xnSDxMaL', // Default voice ID
      stability: 0.5,
      similarityBoost: 0.5,
      style: 0.5
    }

    switch (personality) {
      case 'warm':
        return { ...baseSettings, stability: 0.7, style: 0.3 }
      case 'nostalgic':
        return { ...baseSettings, stability: 0.8, style: 0.6 }
      case 'excited':
        return { ...baseSettings, stability: 0.4, style: 0.8 }
      case 'gentle':
        return { ...baseSettings, stability: 0.9, style: 0.2 }
      default:
        return baseSettings
    }
  }
}
