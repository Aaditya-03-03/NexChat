"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { languageService, LanguageSettings } from '@/lib/language-service'

interface LanguageContextType {
  currentLanguage: string
  languageSettings: LanguageSettings
  setLanguage: (code: string) => boolean
  updateSettings: (settings: Partial<LanguageSettings>) => void
  t: (key: string, params?: Record<string, string>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState(languageService.getCurrentLanguage())
  const [languageSettings, setLanguageSettings] = useState(languageService.getLanguageSettings())

  useEffect(() => {
    // Listen for language changes
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail.language)
      setLanguageSettings(languageService.getLanguageSettings())
    }

    window.addEventListener('languageChanged', handleLanguageChange as EventListener)
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener)
    }
  }, [])

  const setLanguage = (code: string): boolean => {
    const success = languageService.setLanguage(code)
    if (success) {
      setCurrentLanguage(code)
      setLanguageSettings(languageService.getLanguageSettings())
    }
    return success
  }

  const updateSettings = (settings: Partial<LanguageSettings>) => {
    languageService.updateSettings(settings)
    setLanguageSettings(languageService.getLanguageSettings())
  }

  const t = (key: string, params?: Record<string, string>): string => {
    return languageService.t(key, params)
  }

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      languageSettings,
      setLanguage,
      updateSettings,
      t
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 