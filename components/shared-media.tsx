"use client"

import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ImageIcon, FileText, Link, Download } from 'lucide-react'
import { Message } from '@/lib/chat-service'
import { getCloudinaryVideoThumbnail } from '@/lib/utils'
import Image from 'next/image'
import { MediaViewer } from './media-viewer'

interface SharedMediaProps {
  messages: Message[]
}

export function SharedMedia({ messages }: SharedMediaProps) {
  const [activeTab, setActiveTab] = useState('media')
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  const { media, docs, links } = useMemo(() => {
    const media: Message[] = []
    const docs: Message[] = []
    const links: { url: string; messageId: string }[] = []
    const urlRegex = /(https?:\/\/[^\s]+)/g

    messages.forEach(msg => {
      if ((msg.type === 'image' || msg.type === 'video') && msg.fileUrl) {
        media.push(msg)
      } else if (msg.type === 'file' && msg.fileUrl) {
        docs.push(msg)
      }

      // Extract links from text messages
      if (msg.type === 'text' && msg.content) {
        const foundUrls = msg.content.match(urlRegex)
        if (foundUrls) {
          foundUrls.forEach(url => links.push({ url, messageId: msg.id }))
        }
      }
    })
    return { media, docs, links }
  }, [messages])

  const mediaForViewer = useMemo(() => 
    media.map(m => ({ fileUrl: m.fileUrl!, type: m.type as 'image' | 'video' }))
  , [media])

  const handleNext = () => {
    if (viewerIndex !== null) {
      setViewerIndex((viewerIndex + 1) % media.length)
    }
  }

  const handlePrev = () => {
    if (viewerIndex !== null) {
      setViewerIndex((viewerIndex - 1 + media.length) % media.length)
    }
  }

  const renderMediaGrid = () => (
    <div className="grid grid-cols-3 gap-1 p-2">
      {media.map((msg, index) => (
        <div
          key={msg.id}
          onClick={() => setViewerIndex(index)}
          className="relative aspect-square bg-muted rounded-md overflow-hidden group cursor-pointer"
        >
          {msg.type === 'image' && msg.fileUrl && (
            <Image src={msg.fileUrl} alt="Shared media" layout="fill" objectFit="cover" className="transition-transform group-hover:scale-110" />
          )}
          {msg.type === 'video' && msg.fileUrl && (
             <Image src={getCloudinaryVideoThumbnail(msg.fileUrl)} alt="Shared video" layout="fill" objectFit="cover" className="transition-transform group-hover:scale-110" />
          )}
        </div>
      ))}
    </div>
  )

  const renderDocsList = () => (
    <div className="p-2 space-y-2">
      {docs.map((msg) => (
        <a key={msg.id} href={msg.fileUrl} download target="_blank" rel="noopener noreferrer" className="flex items-center p-2 bg-muted rounded-md hover:bg-muted/80 transition-colors group">
          <FileText className="h-6 w-6 mr-3 text-primary" />
          <div className="flex-1 overflow-hidden">
            <p className="font-medium truncate">{msg.content}</p>
            <p className="text-xs text-muted-foreground">{new Date(msg.timestamp.seconds * 1000).toLocaleDateString()}</p>
          </div>
          <Download className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      ))}
    </div>
  )

  const renderLinksList = () => (
    <div className="p-2 space-y-2">
      {links.map((link, index) => (
        <a key={`${link.messageId}-${index}`} href={link.url} target="_blank" rel="noopener noreferrer" className="block p-2 bg-muted rounded-md hover:bg-muted/80 transition-colors">
          <div className="flex items-center">
            <Link className="h-5 w-5 mr-3 text-primary" />
            <p className="font-medium truncate text-blue-500 hover:underline">{link.url}</p>
          </div>
        </a>
      ))}
    </div>
  )

  return (
    <>
      <div className="my-4">
        <h3 className="text-lg font-semibold px-2 mb-2">Shared Media</h3>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="media"><ImageIcon className="h-4 w-4 mr-2" />Media ({media.length})</TabsTrigger>
            <TabsTrigger value="docs"><FileText className="h-4 w-4 mr-2" />Docs ({docs.length})</TabsTrigger>
            <TabsTrigger value="links"><Link className="h-4 w-4 mr-2" />Links ({links.length})</TabsTrigger>
          </TabsList>
          <ScrollArea className="h-60">
            <TabsContent value="media">
              {media.length > 0 ? renderMediaGrid() : <p className="p-4 text-center text-muted-foreground">No media shared yet.</p>}
            </TabsContent>
            <TabsContent value="docs">
              {docs.length > 0 ? renderDocsList() : <p className="p-4 text-center text-muted-foreground">No documents shared yet.</p>}
            </TabsContent>
            <TabsContent value="links">
              {links.length > 0 ? renderLinksList() : <p className="p-4 text-center text-muted-foreground">No links shared yet.</p>}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
      
      <MediaViewer 
        media={mediaForViewer}
        currentIndex={viewerIndex}
        onClose={() => setViewerIndex(null)}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </>
  )
} 