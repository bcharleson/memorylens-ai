'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Camera, Eye, EyeOff, Key, Save, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAppStore, useApiKeys } from '@/lib/store'
import { obfuscateApiKey, validateApiKey } from '@/lib/utils'

export default function SettingsPage() {
  const { settings, setApiKey, updateSettings } = useAppStore()
  const apiKeys = useApiKeys()
  
  const [showGeminiKey, setShowGeminiKey] = useState(false)
  const [showElevenLabsKey, setShowElevenLabsKey] = useState(false)
  const [geminiKey, setGeminiKey] = useState('')
  const [elevenLabsKey, setElevenLabsKey] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSaveApiKeys = () => {
    if (geminiKey && validateApiKey(geminiKey, 'gemini')) {
      setApiKey('gemini', geminiKey)
    }
    if (elevenLabsKey && validateApiKey(elevenLabsKey, 'elevenlabs')) {
      setApiKey('elevenlabs', elevenLabsKey)
    }
    
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    
    // Clear the input fields
    setGeminiKey('')
    setElevenLabsKey('')
  }

  const isGeminiValid = !geminiKey || validateApiKey(geminiKey, 'gemini')
  const isElevenLabsValid = !elevenLabsKey || validateApiKey(elevenLabsKey, 'elevenlabs')
  const canSave = (geminiKey && isGeminiValid) || (elevenLabsKey && isElevenLabsValid)

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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Settings</h2>
          <p className="text-gray-600">Configure your API keys and preferences for MemoryLens AI</p>
        </div>

        {/* API Keys Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2" />
              API Keys
            </CardTitle>
            <CardDescription>
              Configure your API keys for Gemini 2.5 Flash and ElevenLabs to enable all features.
              Your keys are encrypted and stored locally in your browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Gemini API Key */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Gemini 2.5 Flash API Key
              </label>
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Input
                    type={showGeminiKey ? 'text' : 'password'}
                    placeholder={apiKeys.gemini ? obfuscateApiKey(apiKeys.gemini) : 'Enter your Gemini API key'}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className={!isGeminiValid ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                  >
                    {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {!isGeminiValid && (
                <p className="text-sm text-red-600">
                  Please enter a valid Gemini API key (should start with 'AIza')
                </p>
              )}
              <p className="text-xs text-gray-500">
                Get your API key from{' '}
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            {/* ElevenLabs API Key */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                ElevenLabs API Key
              </label>
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Input
                    type={showElevenLabsKey ? 'text' : 'password'}
                    placeholder={apiKeys.elevenlabs ? obfuscateApiKey(apiKeys.elevenlabs) : 'Enter your ElevenLabs API key'}
                    value={elevenLabsKey}
                    onChange={(e) => setElevenLabsKey(e.target.value)}
                    className={!isElevenLabsValid ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setShowElevenLabsKey(!showElevenLabsKey)}
                  >
                    {showElevenLabsKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {!isElevenLabsValid && (
                <p className="text-sm text-red-600">
                  Please enter a valid ElevenLabs API key
                </p>
              )}
              <p className="text-xs text-gray-500">
                Get your API key from{' '}
                <a 
                  href="https://elevenlabs.io/app/speech-synthesis" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  ElevenLabs Dashboard
                </a>
              </p>
            </div>

            <Button 
              onClick={handleSaveApiKeys}
              disabled={!canSave}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {saved ? 'Saved!' : 'Save API Keys'}
            </Button>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Your privacy and data security are our top priorities.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">🔒 Local Storage</h4>
              <p className="text-sm text-green-700">
                Your API keys are encrypted and stored locally in your browser. They never leave your device.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">📸 Photo Processing</h4>
              <p className="text-sm text-blue-700">
                Photos are processed directly through the APIs. No images are stored on our servers.
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-800 mb-2">🎙️ Voice Data</h4>
              <p className="text-sm text-purple-700">
                Voice interactions are processed by ElevenLabs and not retained after the session.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Gemini 2.5 Flash</span>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  apiKeys.gemini 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {apiKeys.gemini ? 'Configured' : 'Not Configured'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ElevenLabs</span>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  apiKeys.elevenlabs 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {apiKeys.elevenlabs ? 'Configured' : 'Not Configured'}
                </span>
              </div>
            </div>
            
            {apiKeys.gemini && apiKeys.elevenlabs && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  ✅ All systems ready! You can now upload photos and start creating memory experiences.
                </p>
                <Link href="/upload" className="mt-2 inline-block">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Start Creating Memories
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
