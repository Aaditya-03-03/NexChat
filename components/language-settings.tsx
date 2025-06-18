"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  X, 
  Check, 
  Search, 
  Globe, 
  Settings,
  Save,
  RotateCcw,
  Languages
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { languageService, Language, LanguageSettings } from "@/lib/language-service"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface LanguageSettingsProps {
  onClose: () => void
  onUpdate?: (settings: LanguageSettings) => void
}

export function LanguageSettings({ onClose, onUpdate }: LanguageSettingsProps) {
  const [settings, setSettings] = useState<LanguageSettings>({
    currentLanguage: 'en',
    fallbackLanguage: 'en',
    autoDetect: true,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Load current settings on mount
  useEffect(() => {
    const currentSettings = languageService.getLanguageSettings()
    setSettings(currentSettings)
  }, [])

  // Get all supported languages
  const allLanguages = useMemo(() => {
    return languageService.getSupportedLanguages()
  }, [])

  // Filter languages based on search query
  const filteredLanguages = useMemo(() => {
    if (!searchQuery) return allLanguages
    
    const query = searchQuery.toLowerCase()
    return allLanguages.filter(lang => 
      lang.name.toLowerCase().includes(query) ||
      lang.nativeName.toLowerCase().includes(query) ||
      lang.code.toLowerCase().includes(query)
    )
  }, [allLanguages, searchQuery])

  const handleLanguageSelect = (language: Language) => {
    setSettings(prev => ({
      ...prev,
      currentLanguage: language.code
    }))
  }

  const handleAutoDetectToggle = (enabled: boolean) => {
    const newSettings = { ...settings, autoDetect: enabled }
    setSettings(newSettings)
    languageService.updateSettings(newSettings)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const success = languageService.setLanguage(settings.currentLanguage)
      if (success) {
        toast.success(languageService.t('settings.language.success'))
        onUpdate?.(settings)
      } else {
        toast.error(languageService.t('settings.language.error'))
      }
    } catch (error) {
      toast.error(languageService.t('settings.language.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentLanguage = () => {
    return allLanguages.find(lang => lang.code === settings.currentLanguage)
  }

  const currentLanguage = getCurrentLanguage()

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-2xl lg:max-w-5xl h-[95vh] sm:max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-border/50 bg-gradient-to-r from-background to-muted/20 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm">
              <Languages className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg lg:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {languageService.t('settings.language.title')}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">
                {languageService.t('settings.language.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-full text-xs px-2 sm:px-3 h-8 sm:h-9"
            >
              {languageService.t('common.cancel')}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 rounded-full hover:bg-muted"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            </Button>
          </div>
        </div>

        {/* Content Area - Mobile: Stacked, Desktop: Side by side */}
        <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
          {/* Left Sidebar - Settings */}
          <div className="w-full lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r border-border/50 flex flex-col min-h-0">
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-3 sm:p-4 lg:p-6">
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                  {/* Current Language */}
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2">
                        <Globe className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-primary" />
                        Current Language
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentLanguage && (
                        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-4 rounded-lg bg-background border border-border/50">
                          <div className="text-xl sm:text-2xl lg:text-3xl">{currentLanguage.flag}</div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base lg:text-lg truncate">{currentLanguage.name}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{currentLanguage.nativeName}</p>
                          </div>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs flex-shrink-0">
                            Active
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Auto-detect Setting */}
                  <Card>
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2">
                        <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                        Auto-detection
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {languageService.t('settings.language.autoDetect.description')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div>
                            <Label htmlFor="auto-detect" className="font-medium text-xs sm:text-sm lg:text-base">
                              {languageService.t('settings.language.autoDetect')}
                            </Label>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Automatically detect language from your browser
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="auto-detect"
                          checked={settings.autoDetect}
                          onCheckedChange={handleAutoDetectToggle}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Search */}
                  <Card>
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2">
                        <Search className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                        Search Languages
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        <Input
                          placeholder={languageService.t('settings.language.search')}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 sm:pl-10 text-xs sm:text-sm lg:text-base h-9 sm:h-10"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </div>

            {/* Footer Actions - Fixed at bottom */}
            <div className="p-3 sm:p-4 lg:p-6 border-t border-border/50 bg-muted/20 flex-shrink-0">
              <Button onClick={handleSave} disabled={isLoading} className="w-full text-xs sm:text-sm lg:text-base h-9 sm:h-10">
                {isLoading ? (
                  <>
                    <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    {languageService.t('common.loading')}
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    {languageService.t('settings.language.save')}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Side - Language Selection */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-3 sm:p-4 lg:p-6 border-b border-border/50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm sm:text-base lg:text-lg flex items-center gap-2">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                  Available Languages
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {filteredLanguages.length} languages
                </Badge>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-3 sm:p-4 lg:p-6">
                {filteredLanguages.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2 sm:gap-3 pb-4">
                    {filteredLanguages.map((language) => (
                      <LanguageOption
                        key={language.code}
                        language={language}
                        isSelected={language.code === settings.currentLanguage}
                        onSelect={handleLanguageSelect}
                        isLoading={isLoading}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 lg:py-12 text-muted-foreground">
                    <Search className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                    <p className="text-xs sm:text-sm lg:text-base">No languages found</p>
                    <p className="text-xs sm:text-sm">Try a different search term</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const LanguageOption = ({ 
  language, 
  isSelected, 
  onSelect, 
  isLoading 
}: { 
  language: Language 
  isSelected: boolean 
  onSelect: (language: Language) => void 
  isLoading: boolean 
}) => {
  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98] min-h-[60px] sm:min-h-[70px]",
        isSelected 
          ? "border-primary bg-primary/5 shadow-sm" 
          : "border-border/50 hover:border-primary/30 hover:bg-muted/30",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
      onClick={() => !isLoading && onSelect(language)}
    >
      {/* Flag */}
      <div className="flex-shrink-0">
        <div className="text-xl sm:text-2xl lg:text-3xl filter drop-shadow-sm">
          {language.flag}
        </div>
      </div>

      {/* Language Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-xs sm:text-sm lg:text-base truncate">
            {language.name}
          </h3>
          {isSelected && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs flex-shrink-0">
              Active
            </Badge>
          )}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground truncate">
          {language.nativeName}
        </p>
        {language.region && (
          <p className="text-xs text-muted-foreground/70 mt-1">
            {language.region}
          </p>
        )}
      </div>

      {/* Selection Indicator */}
      <div className="flex-shrink-0">
        {isSelected ? (
          <div className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-primary-foreground" />
          </div>
        ) : (
          <div className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 rounded-full border-2 border-border/50 group-hover:border-primary/50 transition-colors" />
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 rounded-lg sm:rounded-xl flex items-center justify-center">
          <div className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  )
} 