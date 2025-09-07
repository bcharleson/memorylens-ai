import type { ConversationMessage, PhotoMetadata, PhotoAnalysis } from '@/types'

/**
 * Memory Manager - Enhanced local storage and conversation management
 * Provides utilities for managing photo memories and conversations
 */

export interface MemoryStats {
  totalPhotos: number
  totalConversations: number
  totalMessages: number
  oldestMemory?: Date
  newestMemory?: Date
  storageUsed: number // in bytes
}

export interface ConversationSummary {
  photoId: string
  photoName?: string
  messageCount: number
  lastActivity: Date
  firstMessage?: string
  hasAudio: boolean
}

/**
 * Get comprehensive memory statistics
 */
export function getMemoryStats(
  photos: PhotoMetadata[],
  conversations: Record<string, ConversationMessage[]>
): MemoryStats {
  const totalMessages = Object.values(conversations).reduce(
    (sum, messages) => sum + messages.length,
    0
  )

  const allMessages = Object.values(conversations).flat()
  const dates = allMessages.map(m => new Date(m.timestamp)).filter(d => !isNaN(d.getTime()))
  
  // Estimate storage usage (rough calculation)
  const storageUsed = JSON.stringify({ photos, conversations }).length * 2 // UTF-16 encoding

  return {
    totalPhotos: photos.length,
    totalConversations: Object.keys(conversations).length,
    totalMessages,
    oldestMemory: dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : undefined,
    newestMemory: dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : undefined,
    storageUsed
  }
}

/**
 * Get conversation summaries for all photos
 */
export function getConversationSummaries(
  photos: PhotoMetadata[],
  conversations: Record<string, ConversationMessage[]>
): ConversationSummary[] {
  return photos.map(photo => {
    const messages = conversations[photo.id] || []
    const lastActivity = messages.length > 0 
      ? new Date(Math.max(...messages.map(m => new Date(m.timestamp).getTime())))
      : photo.uploadedAt

    return {
      photoId: photo.id,
      photoName: photo.name,
      messageCount: messages.length,
      lastActivity,
      firstMessage: messages.find(m => m.role === 'assistant')?.content?.substring(0, 100),
      hasAudio: messages.some(m => m.audioUrl)
    }
  }).sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
}

/**
 * Export conversation data for backup
 */
export function exportConversationData(
  photos: PhotoMetadata[],
  analyses: PhotoAnalysis[],
  conversations: Record<string, ConversationMessage[]>
) {
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    photos: photos.map(photo => ({
      ...photo,
      // Remove the actual image data for smaller export size
      dataUrl: undefined,
      size: photo.size
    })),
    analyses,
    conversations,
    stats: getMemoryStats(photos, conversations)
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `memorylens-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Import conversation data from backup
 */
export function importConversationData(file: File): Promise<{
  photos: PhotoMetadata[]
  analyses: PhotoAnalysis[]
  conversations: Record<string, ConversationMessage[]>
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        
        // Validate the data structure
        if (!data.photos || !data.analyses || !data.conversations) {
          throw new Error('Invalid backup file format')
        }

        resolve({
          photos: data.photos,
          analyses: data.analyses,
          conversations: data.conversations
        })
      } catch (error) {
        reject(new Error('Failed to parse backup file: ' + (error as Error).message))
      }
    }

    reader.onerror = () => reject(new Error('Failed to read backup file'))
    reader.readAsText(file)
  })
}

/**
 * Clear old conversations to free up storage
 */
export function clearOldConversations(
  conversations: Record<string, ConversationMessage[]>,
  daysToKeep: number = 30
): Record<string, ConversationMessage[]> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  const filtered: Record<string, ConversationMessage[]> = {}

  Object.entries(conversations).forEach(([photoId, messages]) => {
    const recentMessages = messages.filter(
      message => new Date(message.timestamp) > cutoffDate
    )
    
    if (recentMessages.length > 0) {
      filtered[photoId] = recentMessages
    }
  })

  return filtered
}

/**
 * Search through conversation history
 */
export function searchConversations(
  conversations: Record<string, ConversationMessage[]>,
  query: string
): Array<{
  photoId: string
  message: ConversationMessage
  context: ConversationMessage[]
}> {
  const results: Array<{
    photoId: string
    message: ConversationMessage
    context: ConversationMessage[]
  }> = []

  const searchTerm = query.toLowerCase()

  Object.entries(conversations).forEach(([photoId, messages]) => {
    messages.forEach((message, index) => {
      if (message.content.toLowerCase().includes(searchTerm)) {
        // Include 2 messages before and after for context
        const contextStart = Math.max(0, index - 2)
        const contextEnd = Math.min(messages.length, index + 3)
        const context = messages.slice(contextStart, contextEnd)

        results.push({
          photoId,
          message,
          context
        })
      }
    })
  })

  return results.sort((a, b) => 
    new Date(b.message.timestamp).getTime() - new Date(a.message.timestamp).getTime()
  )
}

/**
 * Format storage size for display
 */
export function formatStorageSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}
