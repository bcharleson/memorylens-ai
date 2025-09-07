'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Upload, 
  Search, 
  Trash2, 
  MessageSquare, 
  Camera, 
  Clock,
  HardDrive,
  Volume2
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { 
  getMemoryStats, 
  getConversationSummaries, 
  exportConversationData,
  importConversationData,
  clearOldConversations,
  searchConversations,
  formatStorageSize
} from '@/lib/memory-manager'
import Link from 'next/link'

export function MemoryDashboard() {
  const { 
    photos, 
    analyses, 
    conversations, 
    clearAllConversations,
    // Add a method to update conversations in bulk
  } = useAppStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const stats = getMemoryStats(photos, conversations)
  const conversationSummaries = getConversationSummaries(photos, conversations)

  const handleExport = () => {
    exportConversationData(photos, analyses, conversations)
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const data = await importConversationData(file)
      // In a real implementation, you'd merge this data with the store
      console.log('Import successful:', data)
      alert('Backup imported successfully!')
    } catch (error) {
      console.error('Import failed:', error)
      alert('Failed to import backup: ' + (error as Error).message)
    }
  }

  const handleClearOld = () => {
    if (confirm('Clear conversations older than 30 days? This cannot be undone.')) {
      const filtered = clearOldConversations(conversations, 30)
      // In a real implementation, you'd update the store with filtered conversations
      console.log('Cleared old conversations:', filtered)
    }
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const results = searchConversations(conversations, searchQuery)
    setSearchResults(results)
    setIsSearching(false)
  }

  const handleClearAll = () => {
    if (confirm('Clear all conversations? This cannot be undone.')) {
      clearAllConversations()
      setSearchResults([])
    }
  }

  return (
    <div className="space-y-6">
      {/* Memory Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HardDrive className="h-5 w-5 mr-2" />
            Memory Statistics
          </CardTitle>
          <CardDescription>
            Overview of your stored memories and conversations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalPhotos}</div>
              <div className="text-sm text-gray-600">Photos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalConversations}</div>
              <div className="text-sm text-gray-600">Conversations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalMessages}</div>
              <div className="text-sm text-gray-600">Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatStorageSize(stats.storageUsed)}
              </div>
              <div className="text-sm text-gray-600">Storage Used</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Conversations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search Memories
          </CardTitle>
          <CardDescription>
            Search through your conversation history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">Search Results ({searchResults.length})</h4>
              {searchResults.slice(0, 5).map((result, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <Link href={`/memory/${result.photoId}`}>
                    <div className="text-sm font-medium text-blue-600 hover:underline">
                      Photo Memory
                    </div>
                  </Link>
                  <div className="text-sm text-gray-600 mt-1">
                    "{result.message.content.substring(0, 100)}..."
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(result.message.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Conversations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Recent Conversations
          </CardTitle>
          <CardDescription>
            Your most recent photo memory conversations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {conversationSummaries.slice(0, 5).map((summary) => (
              <div key={summary.photoId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Camera className="h-5 w-5 text-gray-400" />
                  <div>
                    <Link href={`/memory/${summary.photoId}`}>
                      <div className="font-medium text-blue-600 hover:underline">
                        {summary.photoName || 'Untitled Photo'}
                      </div>
                    </Link>
                    <div className="text-sm text-gray-600">
                      {summary.firstMessage || 'No messages yet'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {summary.hasAudio && <Volume2 className="h-4 w-4 text-green-600" />}
                  <Badge variant="secondary">
                    {summary.messageCount} messages
                  </Badge>
                  <div className="text-xs text-gray-400">
                    {summary.lastActivity.toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Memory Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Memory Management
          </CardTitle>
          <CardDescription>
            Backup, import, and manage your conversation data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={handleExport} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Backup
            </Button>
            
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <Button asChild variant="outline" className="w-full">
                <label htmlFor="import-file" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Backup
                </label>
              </Button>
            </div>
            
            <Button onClick={handleClearOld} variant="outline" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Old (30+ days)
            </Button>
            
            <Button onClick={handleClearAll} variant="destructive" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Conversations
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
