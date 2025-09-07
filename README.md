# MemoryLens AI 📸✨

> Transform your photos into living, breathing memories with AI-powered analysis and emotional storytelling.

Built by **Brandon Charleson** for the **Nano Banana Hackathon** - A revolutionary application that combines **Gemini 2.5 Flash** image analysis with **ElevenLabs** voice AI to create deeply personal and emotional photo memory experiences.

## 🎯 Project Overview

MemoryLens AI is an innovative conversational photo memory enhancement platform that rediscovers photo memories through AI-powered conversation, creating enhanced visual narratives and filling story gaps with emotional intelligence.

### 🏆 Competition Alignment

**Judging Criteria Focus:**
- **Innovation/Wow Factor (40%)**: Novel memory-enhancement use case with conversational AI
- **Technical Execution (30%)**: Advanced Gemini 2.5 Flash + ElevenLabs integration  
- **Potential Impact (20%)**: Digital heritage preservation, therapeutic applications
- **Presentation Quality (10%)**: Emotional storytelling demo potential

## ✨ Key Features

### 🔍 Intelligent Photo Analysis
- **Visual Content Recognition**: Advanced AI understands objects, people, emotions, and settings
- **Metadata Extraction**: Automatic detection of time, location, and contextual information
- **Quality Assessment**: Comprehensive analysis of photo quality metrics
- **Enhancement Suggestions**: AI-powered recommendations for visual improvements

### 💬 Conversational Memory Discovery
- **Natural Dialogue**: Engage in meaningful conversations about your photos
- **Emotional Intelligence**: AI adapts conversation style based on photo content and user responses
- **Story Gap Filling**: Generate missing narrative elements to complete memory stories
- **Personalized Questions**: Dynamic question generation based on photo analysis

### 🎙️ Emotional Voice Storytelling
- **Voice Personality Options**: Choose from warm, nostalgic, excited, or gentle AI companions
- **Adaptive Responses**: Voice modulation based on emotional context and conversation flow
- **Story Narration**: Complete audio narratives that bring your memories to life
- **Real-time Generation**: Instant voice responses during conversations

### 🎨 Memory Enhancement Pipeline
- **Visual Quality Improvement**: AI-powered photo enhancement and restoration
- **Emotional Style Transfer**: Apply mood-based visual filters and effects
- **Consistency Maintenance**: Ensure visual coherence across related photos
- **Interactive Editing**: Voice-controlled image adjustments and modifications

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- **Gemini 2.5 Flash API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **ElevenLabs API Key** from [ElevenLabs Dashboard](https://elevenlabs.io/app/speech-synthesis)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bcharleson/memorylens-ai.git
   cd memorylens-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Configuration

1. **Navigate to Settings** (`/settings`)
2. **Enter your API keys**:
   - **Gemini API Key**: Get from Google AI Studio
   - **ElevenLabs API Key**: Get from ElevenLabs Dashboard
3. **Configure voice preferences** (optional)
4. **Start uploading photos!**

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand with persistence
- **AI Integration**: Gemini 2.5 Flash + ElevenLabs APIs
- **File Handling**: Next.js API routes with client-side processing

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── upload/            # Photo upload interface
│   ├── settings/          # API key management
│   ├── memory/[id]/       # Memory enhancement view
│   └── api/               # Backend API routes
├── components/            # Reusable UI components
├── lib/                   # Utilities and API clients
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript definitions
```

### API Integration

#### Gemini 2.5 Flash Features
- **Photo Analysis**: Deep visual content understanding
- **Metadata Extraction**: Automatic context detection
- **Enhancement Pipeline**: Quality improvement suggestions
- **Story Generation**: Narrative element creation

#### ElevenLabs Features
- **Voice Synthesis**: High-quality speech generation
- **Personality Voices**: Multiple character options
- **Emotional Modulation**: Context-aware voice adaptation
- **Real-time Processing**: Instant audio generation

## 🔐 Privacy & Security

### Data Protection
- **Local Storage**: API keys encrypted and stored locally in browser
- **No Server Storage**: Photos processed directly through APIs
- **Session-based**: Voice interactions not retained after session
- **User Control**: Complete data ownership and control

### Security Features
- **API Key Obfuscation**: Display only last 4 characters
- **Client-side Encryption**: Secure local storage implementation
- **Validation**: Comprehensive API key format validation
- **Error Handling**: Graceful failure with informative messages

## 🎨 User Experience Flow

1. **Landing Page**: Introduction and feature overview
2. **Settings Configuration**: Secure API key setup
3. **Photo Upload**: Drag-and-drop or click-to-upload
4. **AI Analysis**: Automatic photo content analysis
5. **Memory Conversation**: Interactive dialogue about memories
6. **Story Enhancement**: Voice narration and visual improvements
7. **Memory Sharing**: Export and share enhanced memories

## 🏆 Competitive Advantages

### Innovation
- **First-of-its-kind**: Unique combination of visual and voice AI for memory enhancement
- **Emotional Intelligence**: Deep understanding of photo sentiment and context
- **Conversational Interface**: Natural dialogue for memory exploration

### Technical Excellence
- **Advanced AI Integration**: Cutting-edge Gemini 2.5 Flash capabilities
- **Real-time Processing**: Instant analysis and voice generation
- **Professional UI/UX**: Polished, intuitive user interface

### Market Impact
- **Digital Heritage**: Preserve and enhance family memories
- **Therapeutic Applications**: Memory therapy and emotional wellness
- **Educational Use**: Interactive storytelling and history preservation
- **Commercial Viability**: Clear path to monetization and scaling

## 📈 Future Roadmap

### Phase 1 (Post-Hackathon)
- Multi-photo story creation
- Family collaboration features
- Advanced emotion recognition
- Mobile application development

### Phase 2 (Commercial)
- Cloud storage integration
- Subscription model implementation
- Enterprise heritage solutions
- API marketplace integration

### Phase 3 (Scale)
- Therapeutic application partnerships
- Educational institution integrations
- International language support
- Advanced AI model training

## 🤝 Contributing

This project was built for the Nano Banana Hackathon. Contributions, issues, and feature requests are welcome!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Nano Banana Hackathon** for the inspiration and opportunity
- **Google** for Gemini 2.5 Flash API access
- **ElevenLabs** for voice AI technology partnership
- **Next.js** and **Tailwind CSS** for the development framework
- **shadcn/ui** for beautiful UI components

---

**Built with ❤️ by Brandon Charleson for the Nano Banana Hackathon**

*Transform your memories. Rediscover your stories. Experience the future of photo interaction.*
