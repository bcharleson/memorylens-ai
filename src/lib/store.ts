import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  UserSettings, 
  MemorySession, 
  PhotoMetadata, 
  PhotoAnalysis, 
  ConversationMessage,
  VoiceAgent,
  LoadingState 
} from '@/types'
import { encryptApiKey, decryptApiKey } from './utils'

interface AppState {
  // User settings
  settings: UserSettings
  updateSettings: (settings: Partial<UserSettings>) => void
  setApiKey: (type: 'gemini' | 'elevenlabs', key: string) => void
  
  // Current session
  currentSession: MemorySession | null
  setCurrentSession: (session: MemorySession | null) => void
  
  // Photos
  photos: PhotoMetadata[]
  addPhoto: (photo: PhotoMetadata) => void
  removePhoto: (photoId: string) => void
  
  // Analysis
  analyses: PhotoAnalysis[]
  addAnalysis: (analysis: PhotoAnalysis) => void
  getAnalysisForPhoto: (photoId: string) => PhotoAnalysis | undefined
  
  // Conversation (organized by photo ID for better memory management)
  conversations: Record<string, ConversationMessage[]>
  conversation: ConversationMessage[] // Current active conversation
  addMessage: (message: ConversationMessage) => void
  addMessageToPhoto: (photoId: string, message: ConversationMessage) => void
  getConversationForPhoto: (photoId: string) => ConversationMessage[]
  setActiveConversation: (photoId: string) => void
  clearConversation: () => void
  clearAllConversations: () => void
  
  // Loading states
  loadingStates: Record<string, LoadingState>
  setLoadingState: (key: string, state: LoadingState) => void
  
  // Voice agent
  voiceAgent: VoiceAgent
  updateVoiceAgent: (agent: Partial<VoiceAgent>) => void
  
  // UI state
  activeTab: 'upload' | 'analyze' | 'conversation' | 'settings'
  setActiveTab: (tab: 'upload' | 'analyze' | 'conversation' | 'settings') => void
  
  // Error handling
  errors: Record<string, string>
  setError: (key: string, error: string) => void
  clearError: (key: string) => void
  clearAllErrors: () => void
}

const defaultVoiceAgent: VoiceAgent = {
  personality: 'warm',
  emotionalRange: {
    warmth: 80,
    enthusiasm: 60,
    empathy: 90,
    curiosity: 70
  },
  conversationStyle: 'guided',
  voiceSettings: {
    voiceId: 'EXAVITQu4vr4xnSDxMaL',
    stability: 0.7,
    similarityBoost: 0.5,
    style: 0.3
  }
}

const defaultSettings: UserSettings = {
  apiKeys: {},
  preferences: {
    voicePersonality: 'warm',
    conversationStyle: 'guided',
    autoEnhance: true,
    privacyMode: false
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Settings
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        })),
      
      setApiKey: (type, key) =>
        set((state) => ({
          settings: {
            ...state.settings,
            apiKeys: {
              ...state.settings.apiKeys,
              [type]: encryptApiKey(key)
            }
          }
        })),

      // Session
      currentSession: null,
      setCurrentSession: (session) => set({ currentSession: session }),

      // Photos
      photos: [],
      addPhoto: (photo) =>
        set((state) => ({
          photos: [...state.photos, photo]
        })),
      
      removePhoto: (photoId) =>
        set((state) => ({
          photos: state.photos.filter(p => p.id !== photoId),
          analyses: state.analyses.filter(a => a.photoId !== photoId)
        })),

      // Analysis
      analyses: [],
      addAnalysis: (analysis) =>
        set((state) => ({
          analyses: [...state.analyses.filter(a => a.photoId !== analysis.photoId), analysis]
        })),
      
      getAnalysisForPhoto: (photoId) => {
        const state = get()
        return state.analyses.find(a => a.photoId === photoId)
      },

      // Conversation management
      conversations: {},
      conversation: [],

      addMessage: (message) =>
        set((state) => ({
          conversation: [...state.conversation, message]
        })),

      addMessageToPhoto: (photoId, message) =>
        set((state) => ({
          conversations: {
            ...state.conversations,
            [photoId]: [...(state.conversations[photoId] || []), message]
          }
        })),

      getConversationForPhoto: (photoId) => {
        const state = get()
        return state.conversations[photoId] || []
      },

      setActiveConversation: (photoId) =>
        set((state) => ({
          conversation: state.conversations[photoId] || []
        })),

      clearConversation: () => set({ conversation: [] }),

      clearAllConversations: () => set({ conversations: {}, conversation: [] }),

      // Loading states
      loadingStates: {},
      setLoadingState: (key, state) =>
        set((prevState) => ({
          loadingStates: { ...prevState.loadingStates, [key]: state }
        })),

      // Voice agent
      voiceAgent: defaultVoiceAgent,
      updateVoiceAgent: (agent) =>
        set((state) => ({
          voiceAgent: { ...state.voiceAgent, ...agent }
        })),

      // UI state
      activeTab: 'upload',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Error handling
      errors: {},
      setError: (key, error) =>
        set((state) => ({
          errors: { ...state.errors, [key]: error }
        })),
      
      clearError: (key) =>
        set((state) => {
          const { [key]: _, ...rest } = state.errors
          return { errors: rest }
        }),
      
      clearAllErrors: () => set({ errors: {} })
    }),
    {
      name: 'memorylens-storage',
      partialize: (state) => ({
        settings: state.settings,
        voiceAgent: state.voiceAgent,
        activeTab: state.activeTab,
        // Persist conversation and photo data for local memory
        photos: state.photos,
        analyses: state.analyses,
        conversations: state.conversations,
        conversation: state.conversation,
        currentSession: state.currentSession
      })
    }
  )
)

// Selectors for computed values
export const useApiKeys = () => {
  const settings = useAppStore(state => state.settings)
  return {
    gemini: settings.apiKeys.gemini ? decryptApiKey(settings.apiKeys.gemini) : '',
    elevenlabs: settings.apiKeys.elevenlabs ? decryptApiKey(settings.apiKeys.elevenlabs) : ''
  }
}

export const useHasValidApiKeys = () => {
  const apiKeys = useApiKeys()
  return Boolean(apiKeys.gemini && apiKeys.elevenlabs)
}

export const useCurrentPhoto = () => {
  const photos = useAppStore(state => state.photos)
  return photos[photos.length - 1] // Most recently uploaded photo
}

export const useCurrentAnalysis = () => {
  const currentPhoto = useCurrentPhoto()
  const getAnalysisForPhoto = useAppStore(state => state.getAnalysisForPhoto)
  return currentPhoto ? getAnalysisForPhoto(currentPhoto.id) : undefined
}

export const useIsLoading = (key: string) => {
  const loadingStates = useAppStore(state => state.loadingStates)
  return loadingStates[key] === 'loading'
}

export const useError = (key: string) => {
  const errors = useAppStore(state => state.errors)
  return errors[key]
}

// Action creators for complex operations
export const createMemorySession = (photos: PhotoMetadata[]): MemorySession => {
  const voiceAgent = useAppStore.getState().voiceAgent
  
  return {
    id: Math.random().toString(36).substring(2),
    userId: 'demo-user', // In production, this would be the actual user ID
    photos,
    analysis: [],
    conversation: [],
    voiceAgent,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'analyzing'
  }
}

export const updateSessionStatus = (status: MemorySession['status']) => {
  const { currentSession, setCurrentSession } = useAppStore.getState()
  if (currentSession) {
    setCurrentSession({
      ...currentSession,
      status,
      updatedAt: new Date()
    })
  }
}
