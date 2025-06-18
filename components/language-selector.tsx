"use client"

import { useState } from "react"
import { ChevronDown, Globe, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/components/language-provider"
import { languageService } from "@/lib/language-service"
import { cn } from "@/lib/utils"

interface LanguageSelectorProps {
  variant?: "default" | "compact"
  className?: string
}

export function LanguageSelector({ variant = "default", className }: LanguageSelectorProps) {
  const { currentLanguage, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguageData = languageService.getLanguageByCode(currentLanguage)
  const popularLanguages = languageService.getSupportedLanguages().slice(0, 6)

  const handleLanguageSelect = (languageCode: string) => {
    setLanguage(languageCode)
    setIsOpen(false)
  }

  if (variant === "compact") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={cn("h-8 w-8", className)}>
            <Globe className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {popularLanguages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              className="flex items-center gap-3"
            >
              <span className="text-lg">{language.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{language.name}</div>
                <div className="text-xs text-muted-foreground truncate">{language.nativeName}</div>
              </div>
              {language.code === currentLanguage && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("gap-2", className)}>
          {currentLanguageData && (
            <>
              <span className="text-lg">{currentLanguageData.flag}</span>
              <span className="hidden sm:inline">{currentLanguageData.name}</span>
            </>
          )}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-2">
          <div className="text-sm font-medium text-muted-foreground mb-2">Select Language</div>
          {popularLanguages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              className="flex items-center gap-3 p-2 rounded-lg"
            >
              <span className="text-xl">{language.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{language.name}</div>
                <div className="text-xs text-muted-foreground truncate">{language.nativeName}</div>
              </div>
              {language.code === currentLanguage && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 