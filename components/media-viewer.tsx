"use client"

import { AnimatePresence, motion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { getCloudinaryVideoThumbnail } from '@/lib/utils'
import Image from 'next/image'

interface MediaViewerProps {
  media: { fileUrl: string; type: 'image' | 'video' }[]
  currentIndex: number | null
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}

export function MediaViewer({ media, currentIndex, onClose, onNext, onPrev }: MediaViewerProps) {
  if (currentIndex === null) {
    return null
  }

  const currentItem = media[currentIndex]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        onClick={onClose}
      >
        {/* Main Content */}
        <div className="relative w-full h-full max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
          {currentItem.type === 'image' ? (
            <Image
              src={currentItem.fileUrl}
              alt="Full screen media"
              layout="fill"
              objectFit="contain"
            />
          ) : (
            <video
              src={currentItem.fileUrl}
              controls
              autoPlay
              className="w-full h-full"
            />
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Previous Button */}
        {media.length > 1 && (
            <button
            onClick={(e) => {
                e.stopPropagation();
                onPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
            >
            <ChevronLeft className="h-8 w-8" />
            </button>
        )}

        {/* Next Button */}
        {media.length > 1 && (
            <button
            onClick={(e) => {
                e.stopPropagation();
                onNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
            >
            <ChevronRight className="h-8 w-8" />
            </button>
        )}
      </motion.div>
    </AnimatePresence>
  )
} 