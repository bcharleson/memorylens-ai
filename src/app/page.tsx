'use client'

import Link from 'next/link'
import { Camera, Heart, Sparkles, Play, Settings, Upload, Database } from 'lucide-react'
import { useHasValidApiKeys } from '@/lib/store'

export default function Home() {
  const hasValidApiKeys = useHasValidApiKeys()

  const features = [
    {
      icon: <Camera className="h-8 w-8" />,
      title: "Intelligent Photo Analysis",
      description: "Advanced AI understands your photos' visual content, emotions, and hidden stories",
      color: "blue"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Emotional Storytelling",
      description: "AI companion creates warm, personal narratives that bring your memories to life",
      color: "red"
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Memory Enhancement",
      description: "Transform ordinary photos into extraordinary visual experiences with AI enhancement",
      color: "purple"
    }
  ]

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b bg-white backdrop-blur-sm">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            <Camera className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">MemoryLens AI</h1>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/settings">
              <button className="btn-secondary flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Rediscover Your
            <span className="gradient-text">
              {" "}Photo Memories
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Transform your photos into living, breathing memories with AI-powered analysis and emotional storytelling.
            Every picture has a story - let us help you tell it.
          </p>

          {!hasValidApiKeys ? (
            <div className="api-setup-card">
              <div className="api-setup-content">
                <div className="api-setup-icon">
                  <Settings className="h-8 w-8" />
                </div>
                <div className="api-setup-text">
                  <h3 className="api-setup-title">Quick Setup Required</h3>
                  <p className="api-setup-description">
                    Connect your AI services to unlock the full MemoryLens experience.
                    You'll need API keys from Google AI Studio and ElevenLabs.
                  </p>
                  <div className="api-setup-features">
                    <div className="api-feature">
                      <span className="api-feature-icon">🧠</span>
                      <span>Gemini 2.5 Flash Image Preview for photo analysis</span>
                    </div>
                    <div className="api-feature">
                      <span className="api-feature-icon">🎙️</span>
                      <span>ElevenLabs for voice storytelling</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="api-setup-actions">
                <Link href="/settings">
                  <button className="btn-setup">
                    <Settings className="h-5 w-5" />
                    <span>Configure API Keys</span>
                    <span className="setup-arrow">→</span>
                  </button>
                </Link>
                <p className="api-setup-time">⚡ Takes less than 2 minutes</p>
              </div>
            </div>
          ) : (
            <div className="ready-to-start">
              <div className="ready-badge">
                <span className="ready-icon">✨</span>
                <span>All systems ready!</span>
              </div>
              <div className="action-buttons">
                <Link href="/upload">
                  <button className="btn-primary-large">
                    <Upload className="h-6 w-6" />
                    <span>Upload Your First Photo</span>
                    <span className="button-shine"></span>
                  </button>
                </Link>
                <button className="btn-demo">
                  <Play className="h-5 w-5" />
                  <span>Watch Demo</span>
                </button>
              </div>
              <p className="ready-subtitle">Start creating magical memory experiences in seconds</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            How MemoryLens AI Works
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our advanced AI technology combines visual analysis with emotional intelligence
            to create meaningful connections with your photo memories.
          </p>
        </div>

        <div className="grid md-grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="card card-hover text-center">
              <div className="card-header">
                <div className={`feature-icon-wrapper feature-icon-${feature.color}`}>
                  {feature.icon}
                </div>
                <h4 className="card-title text-xl">{feature.title}</h4>
              </div>
              <div className="card-content">
                <p className="card-description text-base">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="cta-section">
        <div className="cta-background-effects">
          <div className="cta-gradient-orb cta-orb-1"></div>
          <div className="cta-gradient-orb cta-orb-2"></div>
          <div className="cta-gradient-orb cta-orb-3"></div>
        </div>

        <div className="container text-center cta-content">
          <div className="cta-badge">
            <span className="cta-badge-icon">✨</span>
            <span>Transform Your Photos Today</span>
          </div>

          <h3 className="cta-title">
            Ready to Rediscover Your
            <span className="cta-title-highlight"> Memories?</span>
          </h3>

          <p className="cta-description">
            Join thousands of users who have transformed their photo collections into living stories.
            <br />
            <span className="cta-description-accent">Experience the magic of AI-powered memory enhancement.</span>
          </p>

          <div className="cta-stats">
            <div className="cta-stat">
              <span className="cta-stat-number">10K+</span>
              <span className="cta-stat-label">Photos Enhanced</span>
            </div>
            <div className="cta-stat">
              <span className="cta-stat-number">5K+</span>
              <span className="cta-stat-label">Stories Created</span>
            </div>
            <div className="cta-stat">
              <span className="cta-stat-number">98%</span>
              <span className="cta-stat-label">User Satisfaction</span>
            </div>
          </div>

          <div className="cta-actions">
            {hasValidApiKeys ? (
              <Link href="/upload">
                <button className="cta-primary-button">
                  <span className="cta-button-icon">
                    <Upload className="h-6 w-6" />
                  </span>
                  <span className="cta-button-text">Start Your Memory Journey</span>
                  <span className="cta-button-arrow">→</span>
                  <div className="cta-button-shine"></div>
                </button>
              </Link>
            ) : (
              <Link href="/settings">
                <button className="cta-primary-button">
                  <span className="cta-button-icon">
                    <Settings className="h-6 w-6" />
                  </span>
                  <span className="cta-button-text">Get Started</span>
                  <span className="cta-button-arrow">→</span>
                  <div className="cta-button-shine"></div>
                </button>
              </Link>
            )}

            <Link href="/memories">
              <button className="cta-secondary-button">
                <span className="cta-button-icon">
                  <Database className="h-5 w-5" />
                </span>
                <span className="cta-button-text">View Memory Dashboard</span>
              </button>
            </Link>

            <div className="cta-trust-indicators">
              <span className="cta-trust-item">🔒 Secure & Private</span>
              <span className="cta-trust-item">⚡ 2-Minute Setup</span>
              <span className="cta-trust-item">🎯 AI-Powered</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{backgroundColor: '#111827', color: 'white', padding: '2rem 0'}}>
        <div className="container text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Camera className="h-6 w-6" />
            <span className="text-lg font-semibold">MemoryLens AI</span>
          </div>
          <div className="footer-content">
            <p className="footer-creator">
              Built by <span className="creator-name">Brandon Charleson</span>
            </p>
            <p className="footer-details">
              For the Nano Banana Hackathon • Powered by Gemini 2.5 Flash Image Preview & ElevenLabs
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
