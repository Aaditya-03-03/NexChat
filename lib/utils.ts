import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// URL shortening utilities
export function shortenUrl(url: string, maxLength: number = 30): string {
  if (url.length <= maxLength) return url
  
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname
    const path = urlObj.pathname
    
    // If domain is already short enough, just truncate the path
    if (domain.length + 10 <= maxLength) {
      const remainingLength = maxLength - domain.length - 3 // 3 for "..."
      const truncatedPath = path.length > remainingLength 
        ? path.substring(0, remainingLength) + "..."
        : path
      return `${domain}${truncatedPath}`
    }
    
    // Otherwise truncate the whole URL
    return url.substring(0, maxLength - 3) + "..."
  } catch {
    // If URL parsing fails, just truncate the string
    return url.substring(0, maxLength - 3) + "..."
  }
}

export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 8)
}

export function createShortLink(url: string, fileName?: string): string {
  const shortId = generateShortId()
  const shortUrl = `${window.location.origin}/f/${shortId}`
  
  // Store the mapping in localStorage for demo purposes
  // In production, you'd want to store this in a database
  const linkMappings = JSON.parse(localStorage.getItem('shortLinks') || '{}')
  linkMappings[shortId] = { url, fileName, createdAt: Date.now() }
  localStorage.setItem('shortLinks', JSON.stringify(linkMappings))
  
  return shortUrl
}

export function getOriginalUrl(shortId: string): { url: string; fileName?: string } | null {
  const linkMappings = JSON.parse(localStorage.getItem('shortLinks') || '{}')
  return linkMappings[shortId] || null
}

export function formatFileDisplayName(fileName: string, maxLength: number = 20): string {
  if (fileName.length <= maxLength) return fileName
  
  const extension = fileName.split('.').pop()
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'))
  const maxNameLength = maxLength - (extension ? extension.length + 1 : 0) - 3 // 3 for "..."
  
  if (nameWithoutExt.length <= maxNameLength) {
    return fileName
  }
  
  return `${nameWithoutExt.substring(0, maxNameLength)}...${extension ? `.${extension}` : ''}`
}

export function makeShortUrlClickable(shortUrl: string): string {
  // Extract the short ID from the URL
  const shortId = shortUrl.split('/').pop()
  if (!shortId) return shortUrl
  
  // Return a clickable version that opens in a new tab
  return shortUrl
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    return Promise.resolve()
  }
}
