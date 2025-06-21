import { useState } from 'react'

interface ProfilePhotoViewerState {
  isOpen: boolean
  photoURL: string
  userName: string
  userId?: string
}

export function useProfilePhotoViewer() {
  const [viewerState, setViewerState] = useState<ProfilePhotoViewerState>({
    isOpen: false,
    photoURL: '',
    userName: '',
    userId: undefined
  })

  const openViewer = (photoURL: string, userName: string, userId?: string) => {
    setViewerState({
      isOpen: true,
      photoURL,
      userName,
      userId
    })
  }

  const closeViewer = () => {
    setViewerState(prev => ({
      ...prev,
      isOpen: false
    }))
  }

  return {
    ...viewerState,
    openViewer,
    closeViewer
  }
} 