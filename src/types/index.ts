// Core type definitions for MemoryLens AI

export interface PhotoMetadata {
  id: string;
  filename: string;
  size: number;
  type: string;
  uploadedAt: Date;
  exif?: {
    date?: string;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    camera?: string;
    settings?: {
      aperture?: string;
      shutter?: string;
      iso?: string;
    };
  };
}

export interface PersonDetection {
  id: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  estimatedAge?: string;
  gender?: string;
  emotions?: EmotionScore[];
}

export interface EmotionScore {
  emotion: 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust' | 'neutral';
  confidence: number;
}

export interface QualityMetrics {
  overall: number; // 0-100
  sharpness: number;
  brightness: number;
  contrast: number;
  saturation: number;
  noise: number;
}

export interface Enhancement {
  type: 'brightness' | 'contrast' | 'saturation' | 'sharpness' | 'noise_reduction' | 'style_transfer';
  intensity: number; // 0-100
  description: string;
}

export interface PhotoAnalysis {
  id: string;
  photoId: string;
  visualContent: {
    objects: string[];
    people: PersonDetection[];
    emotions: EmotionScore[];
    setting: string;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | 'unknown';
    weather?: string;
    activity?: string;
  };
  metadata: PhotoMetadata['exif'];
  quality: QualityMetrics;
  enhancement: {
    suggestions: Enhancement[];
    priority: 'low' | 'medium' | 'high';
  };
  story: {
    suggestedQuestions: string[];
    themes: string[];
    emotionalTone: string;
  };
}

export interface VoiceAgent {
  personality: 'warm' | 'nostalgic' | 'excited' | 'gentle';
  emotionalRange: EmotionProfile;
  conversationStyle: 'guided' | 'exploratory' | 'therapeutic';
  voiceSettings: {
    voiceId: string;
    stability: number;
    similarityBoost: number;
    style: number;
  };
}

export interface EmotionProfile {
  warmth: number; // 0-100
  enthusiasm: number;
  empathy: number;
  curiosity: number;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  relatedPhotoId?: string;
  emotions?: EmotionScore[];
}

export interface MemorySession {
  id: string;
  userId: string;
  photos: PhotoMetadata[];
  analysis: PhotoAnalysis[];
  conversation: ConversationMessage[];
  voiceAgent: VoiceAgent;
  createdAt: Date;
  updatedAt: Date;
  status: 'analyzing' | 'ready' | 'conversing' | 'enhancing' | 'complete';
}

export interface APIKeys {
  gemini?: string;
  elevenlabs?: string;
}

export interface UserSettings {
  apiKeys: APIKeys;
  preferences: {
    voicePersonality: VoiceAgent['personality'];
    conversationStyle: VoiceAgent['conversationStyle'];
    autoEnhance: boolean;
    privacyMode: boolean;
  };
}

export interface EnhancementResult {
  originalUrl: string;
  enhancedUrl: string;
  appliedEnhancements: Enhancement[];
  processingTime: number;
  quality: {
    before: QualityMetrics;
    after: QualityMetrics;
  };
}

export interface StoryNarration {
  id: string;
  photoId: string;
  text: string;
  audioUrl: string;
  duration: number;
  emotionalTone: string;
  generatedAt: Date;
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadResponse extends APIResponse {
  data: {
    photo: PhotoMetadata;
    uploadUrl: string;
  };
}

export interface AnalysisResponse extends APIResponse {
  data: {
    analysis: PhotoAnalysis;
  };
}

export interface EnhancementResponse extends APIResponse {
  data: {
    result: EnhancementResult;
  };
}

export interface VoiceResponse extends APIResponse {
  data: {
    audioUrl: string;
    text: string;
    duration: number;
  };
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
