// Organization Examples for NexChat Application
// This file demonstrates how to use the organized system for icons, buttons, features, and content

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ICONS, 
  ICON_SIZES, 
  ICON_COLORS,
  BUTTON_CATEGORIES,
  FEATURE_CATEGORIES,
  CONTENT_CATEGORIES,
  OrganizationManager,
  getIcon,
  getButtonConfig,
  getFeatureConfig,
  getContentConfig,
} from './organization-index'

// Example 1: Using Icons with Organization
export function IconUsageExample() {
  const MessageIcon = getIcon('CHAT', 'MESSAGE')
  const SearchIcon = getIcon('CHAT', 'SEARCH')
  const SettingsIcon = getIcon('USER', 'SETTINGS')

  return (
    <div className="flex gap-4 items-center">
      <MessageIcon className={`${ICON_SIZES.MD} ${ICON_COLORS.PRIMARY}`} />
      <SearchIcon className={`${ICON_SIZES.SM} ${ICON_COLORS.MUTED}`} />
      <SettingsIcon className={`${ICON_SIZES.LG} ${ICON_COLORS.SECONDARY}`} />
    </div>
  )
}

// Example 2: Using Buttons with Organization
export function ButtonUsageExample() {
  const sendButtonConfig = getButtonConfig('PRIMARY_ACTIONS', 'SEND_MESSAGE')
  const searchButtonConfig = getButtonConfig('SECONDARY_ACTIONS', 'SEARCH')
  const settingsButtonConfig = getButtonConfig('SECONDARY_ACTIONS', 'SETTINGS')

  return (
    <div className="flex gap-4">
      {sendButtonConfig && (
        <Button
          variant={sendButtonConfig.variant as any}
          size={sendButtonConfig.size as any}
          className={sendButtonConfig.className}
        >
          {sendButtonConfig.icon && <sendButtonConfig.icon />}
          {sendButtonConfig.label}
        </Button>
      )}
      
      {searchButtonConfig && (
        <Button
          variant={searchButtonConfig.variant as any}
          size={searchButtonConfig.size as any}
          className={searchButtonConfig.className}
        >
          {searchButtonConfig.icon && <searchButtonConfig.icon />}
          <span className="sr-only">{searchButtonConfig.label}</span>
        </Button>
      )}
      
      {settingsButtonConfig && (
        <Button
          variant={settingsButtonConfig.variant as any}
          size={settingsButtonConfig.size as any}
          className={settingsButtonConfig.className}
        >
          {settingsButtonConfig.icon && <settingsButtonConfig.icon />}
          <span className="sr-only">{settingsButtonConfig.label}</span>
        </Button>
      )}
    </div>
  )
}

// Example 3: Using Features with Organization
export function FeatureUsageExample() {
  const realTimeMessaging = getFeatureConfig('CHAT', 'REAL_TIME_MESSAGING')
  const fileSharing = getFeatureConfig('FILE_SHARING', 'FILE_UPLOAD')
  const groupChats = getFeatureConfig('CHAT', 'GROUP_CHATS')

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {realTimeMessaging && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {realTimeMessaging.icon && <realTimeMessaging.icon className="h-5 w-5" />}
              <CardTitle className="text-lg">{realTimeMessaging.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>{realTimeMessaging.description}</CardDescription>
            <div className="flex gap-2 mt-4">
              <Badge variant={realTimeMessaging.enabled ? 'default' : 'secondary'}>
                {realTimeMessaging.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
              {realTimeMessaging.required && (
                <Badge variant="destructive">Required</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {fileSharing && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {fileSharing.icon && <fileSharing.icon className="h-5 w-5" />}
              <CardTitle className="text-lg">{fileSharing.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>{fileSharing.description}</CardDescription>
            <div className="flex gap-2 mt-4">
              <Badge variant={fileSharing.enabled ? 'default' : 'secondary'}>
                {fileSharing.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
              {fileSharing.required && (
                <Badge variant="destructive">Required</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {groupChats && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {groupChats.icon && <groupChats.icon className="h-5 w-5" />}
              <CardTitle className="text-lg">{groupChats.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>{groupChats.description}</CardDescription>
            <div className="flex gap-2 mt-4">
              <Badge variant={groupChats.enabled ? 'default' : 'secondary'}>
                {groupChats.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
              {groupChats.required && (
                <Badge variant="destructive">Required</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Example 4: Using Content with Organization
export function ContentUsageExample() {
  const heroContent = getContentConfig('LANDING_PAGE', 'HERO')
  const signInContent = getContentConfig('AUTHENTICATION', 'SIGN_IN')
  const chatContent = getContentConfig('CHAT', 'MESSAGES')

  return (
    <div className="space-y-6">
      {heroContent && (
        <Card>
          <CardHeader>
            <CardTitle>{heroContent.title}</CardTitle>
            <CardDescription>{heroContent.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button>{heroContent.cta_primary}</Button>
              <Button variant="outline">{heroContent.cta_secondary}</Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {signInContent && (
        <Card>
          <CardHeader>
            <CardTitle>{signInContent.title}</CardTitle>
            <CardDescription>{signInContent.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{signInContent.email_label}</label>
                <input 
                  type="email" 
                  placeholder={signInContent.email_placeholder}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{signInContent.password_label}</label>
                <input 
                  type="password" 
                  placeholder={signInContent.password_placeholder}
                  className="w-full p-2 border rounded"
                />
              </div>
              <Button className="w-full">{signInContent.submit_text}</Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {chatContent && (
        <Card>
          <CardHeader>
            <CardTitle>Message Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sent:</span>
                <Badge variant="secondary">{chatContent.SENT_STATUS}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Delivered:</span>
                <Badge variant="secondary">{chatContent.DELIVERED_STATUS}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Read:</span>
                <Badge variant="default">{chatContent.READ_STATUS}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Example 5: Using OrganizationManager
export function OrganizationManagerExample() {
  const [featureSummary, setFeatureSummary] = React.useState<any>(null)
  const [enabledFeatures, setEnabledFeatures] = React.useState<any[]>([])
  const [searchResults, setSearchResults] = React.useState<any[]>([])

  React.useEffect(() => {
    // Get feature summary
    const summary = OrganizationManager.getFeatureSummary()
    setFeatureSummary(summary)

    // Get enabled features
    const features = OrganizationManager.getEnabledFeatures()
    setEnabledFeatures(features)

    // Search features
    const results = OrganizationManager.searchFeatures('message')
    setSearchResults(results)
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Feature Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {featureSummary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{featureSummary.totalFeatures}</div>
                <div className="text-sm text-muted-foreground">Total Features</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{featureSummary.requiredFeatures}</div>
                <div className="text-sm text-muted-foreground">Required</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{featureSummary.optionalFeatures}</div>
                <div className="text-sm text-muted-foreground">Optional</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{featureSummary.categories.length}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enabled Features ({enabledFeatures.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {enabledFeatures.slice(0, 10).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                {feature.config.icon && <feature.config.icon className="h-4 w-4" />}
                <span className="text-sm">{feature.config.name}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {feature.category}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search Results for "message" ({searchResults.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {searchResults.slice(0, 5).map((result, index) => (
              <div key={index} className="p-2 border rounded">
                <div className="font-medium">{result.config.name}</div>
                <div className="text-sm text-muted-foreground">{result.config.description}</div>
                <Badge variant="outline" className="mt-1 text-xs">
                  {result.category}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Example 6: Dynamic Feature Toggle
export function FeatureToggleExample() {
  const [features, setFeatures] = React.useState<any[]>([])

  React.useEffect(() => {
    const enabledFeatures = OrganizationManager.getEnabledFeatures()
    setFeatures(enabledFeatures)
  }, [])

  const toggleFeature = (category: string, name: string) => {
    // In a real application, this would update the feature configuration
    console.log(`Toggling feature: ${category}.${name}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Toggle</CardTitle>
        <CardDescription>Enable or disable features dynamically</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {features.slice(0, 5).map((feature, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                {feature.config.icon && <feature.config.icon className="h-5 w-5" />}
                <div>
                  <div className="font-medium">{feature.config.name}</div>
                  <div className="text-sm text-muted-foreground">{feature.config.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={feature.config.enabled ? 'default' : 'secondary'}>
                  {feature.config.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFeature(feature.category, feature.name)}
                >
                  Toggle
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Example 7: Content Management
export function ContentManagementExample() {
  const [contentCategories, setContentCategories] = React.useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = React.useState<string>('')
  const [categoryContent, setCategoryContent] = React.useState<any>({})

  React.useEffect(() => {
    const categories = OrganizationManager.getContentCategories()
    setContentCategories(categories)
    if (categories.length > 0) {
      setSelectedCategory(categories[0])
    }
  }, [])

  React.useEffect(() => {
    if (selectedCategory) {
      const content = OrganizationManager.getContentByCategory(selectedCategory as any)
      setCategoryContent(content)
    }
  }, [selectedCategory])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Content Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {contentCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full text-left p-2 rounded ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>{selectedCategory}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(categoryContent).map(([name, config]) => (
              <div key={name} className="p-3 border rounded">
                <div className="font-medium">{name}</div>
                <pre className="text-sm text-muted-foreground mt-2 overflow-auto">
                  {JSON.stringify(config, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Example Component
export function OrganizationExamples() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Organization System Examples</h1>
        <p className="text-muted-foreground">
          Examples of how to use the organized system for icons, buttons, features, and content
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Icon Usage</h2>
          <IconUsageExample />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Button Usage</h2>
          <ButtonUsageExample />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Feature Usage</h2>
          <FeatureUsageExample />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Content Usage</h2>
          <ContentUsageExample />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Organization Manager</h2>
          <OrganizationManagerExample />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Feature Toggle</h2>
          <FeatureToggleExample />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Content Management</h2>
          <ContentManagementExample />
        </section>
      </div>
    </div>
  )
}

export default OrganizationExamples 