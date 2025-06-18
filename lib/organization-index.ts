// Organization Index for NexChat Application
// This file provides a unified interface for accessing all organized content, features, icons, and buttons

export * from './icon-constants'
export * from './button-constants'
export * from './feature-constants'
export * from './content-constants'

// Re-export types for convenience
export type {
  IconCategory,
  IconName,
  IconSize,
  IconColor,
  IconVariant,
} from './icon-constants'

export type {
  ButtonCategory,
  ButtonName,
  ButtonSize,
  ButtonVariant,
  ButtonState,
} from './button-constants'

export type {
  FeatureCategory,
  FeatureName,
  FeatureStatus,
  FeaturePriority,
} from './feature-constants'

export type {
  ContentCategory,
  ContentName,
  ContentType,
  ContentStatus,
} from './content-constants'

// Organization Utilities
export class OrganizationManager {
  // Icon Management
  static getIcon = (category: IconCategory, name: string) => {
    const { getIcon } = require('./icon-constants')
    return getIcon(category, name)
  }

  static getIconWithProps = (category: IconCategory, name: string, size?: IconSize, color?: IconColor, className?: string) => {
    const { getIconWithProps } = require('./icon-constants')
    return getIconWithProps(category, name, size, color, className)
  }

  // Button Management
  static getButtonConfig = (category: ButtonCategory, name: string) => {
    const { getButtonConfig } = require('./button-constants')
    return getButtonConfig(category, name)
  }

  static getButtonWithConfig = (category: ButtonCategory, name: string, onClick?: () => void, disabled?: boolean, loading?: boolean, className?: string) => {
    const { getButtonWithConfig } = require('./button-constants')
    return getButtonWithConfig(category, name, onClick, disabled, loading, className)
  }

  // Feature Management
  static getFeatureConfig = (category: FeatureCategory, name: string) => {
    const { getFeatureConfig } = require('./feature-constants')
    return getFeatureConfig(category, name)
  }

  static isFeatureEnabled = (category: FeatureCategory, name: string) => {
    const { isFeatureEnabled } = require('./feature-constants')
    return isFeatureEnabled(category, name)
  }

  static getEnabledFeatures = () => {
    const { getEnabledFeatures } = require('./feature-constants')
    return getEnabledFeatures()
  }

  static getRequiredFeatures = () => {
    const { getRequiredFeatures } = require('./feature-constants')
    return getRequiredFeatures()
  }

  static getFeaturesByCategory = (category: FeatureCategory) => {
    const { getFeaturesByCategory } = require('./feature-constants')
    return getFeaturesByCategory(category)
  }

  // Content Management
  static getContentConfig = (category: ContentCategory, name: string) => {
    const { getContentConfig } = require('./content-constants')
    return getContentConfig(category, name)
  }

  static getContentByCategory = (category: ContentCategory) => {
    const { getContentByCategory } = require('./content-constants')
    return getContentByCategory(category)
  }

  static getAllContent = () => {
    const { getAllContent } = require('./content-constants')
    return getAllContent()
  }

  // Utility Methods
  static getFeatureSummary() {
    const enabledFeatures = this.getEnabledFeatures()
    const requiredFeatures = this.getRequiredFeatures()
    
    return {
      totalFeatures: enabledFeatures.length,
      requiredFeatures: requiredFeatures.length,
      optionalFeatures: enabledFeatures.length - requiredFeatures.length,
      categories: this.getFeatureCategories(),
    }
  }

  static getFeatureCategories() {
    const { FEATURE_CATEGORIES } = require('./feature-constants')
    return Object.keys(FEATURE_CATEGORIES)
  }

  static getContentCategories() {
    const { CONTENT_CATEGORIES } = require('./content-constants')
    return Object.keys(CONTENT_CATEGORIES)
  }

  static getButtonCategories() {
    const { BUTTON_CATEGORIES } = require('./button-constants')
    return Object.keys(BUTTON_CATEGORIES)
  }

  static getIconCategories() {
    const { ICONS } = require('./icon-constants')
    return Object.keys(ICONS)
  }

  // Validation Methods
  static validateFeature(category: FeatureCategory, name: string) {
    const config = this.getFeatureConfig(category, name)
    return {
      exists: !!config,
      enabled: config?.enabled || false,
      required: config?.required || false,
      config,
    }
  }

  static validateContent(category: ContentCategory, name: string) {
    const config = this.getContentConfig(category, name)
    return {
      exists: !!config,
      config,
    }
  }

  static validateButton(category: ButtonCategory, name: string) {
    const config = this.getButtonConfig(category, name)
    return {
      exists: !!config,
      config,
    }
  }

  static validateIcon(category: IconCategory, name: string) {
    const icon = this.getIcon(category, name)
    return {
      exists: !!icon,
      icon,
    }
  }

  // Search Methods
  static searchFeatures(query: string) {
    const enabledFeatures = this.getEnabledFeatures()
    const searchTerm = query.toLowerCase()
    
    return enabledFeatures.filter(feature => 
      feature.config.name.toLowerCase().includes(searchTerm) ||
      feature.config.description.toLowerCase().includes(searchTerm) ||
      feature.category.toLowerCase().includes(searchTerm)
    )
  }

  static searchContent(query: string) {
    const allContent = this.getAllContent()
    const searchTerm = query.toLowerCase()
    const results: Array<{ category: string; name: string; config: any }> = []
    
    Object.entries(allContent).forEach(([category, contentCategory]) => {
      Object.entries(contentCategory).forEach(([name, config]) => {
        if (typeof config === 'object' && config !== null) {
          const configString = JSON.stringify(config).toLowerCase()
          if (configString.includes(searchTerm)) {
            results.push({ category, name, config })
          }
        }
      })
    })
    
    return results
  }

  // Export Methods
  static exportOrganization() {
    return {
      icons: {
        categories: this.getIconCategories(),
        constants: require('./icon-constants').ICONS,
        sizes: require('./icon-constants').ICON_SIZES,
        colors: require('./icon-constants').ICON_COLORS,
      },
      buttons: {
        categories: this.getButtonCategories(),
        constants: require('./button-constants').BUTTON_CATEGORIES,
        sizes: require('./button-constants').BUTTON_SIZES,
        variants: require('./button-constants').BUTTON_VARIANTS,
      },
      features: {
        categories: this.getFeatureCategories(),
        constants: require('./feature-constants').FEATURE_CATEGORIES,
        summary: this.getFeatureSummary(),
      },
      content: {
        categories: this.getContentCategories(),
        constants: require('./content-constants').CONTENT_CATEGORIES,
      },
    }
  }

  // Import Methods
  static importOrganization(data: any) {
    // This method would be used to import organization data
    // Implementation would depend on the specific use case
    console.log('Importing organization data:', data)
    return true
  }

  // Migration Methods
  static migrateOrganization(fromVersion: string, toVersion: string) {
    // This method would handle organization schema migrations
    console.log(`Migrating organization from ${fromVersion} to ${toVersion}`)
    return true
  }

  // Backup Methods
  static backupOrganization() {
    const organization = this.exportOrganization()
    const timestamp = new Date().toISOString()
    const backup = {
      version: '1.0.0',
      timestamp,
      organization,
    }
    
    return backup
  }

  static restoreOrganization(backup: any) {
    // This method would restore organization from backup
    console.log('Restoring organization from backup:', backup)
    return true
  }
}

// Convenience exports
export const OrgManager = OrganizationManager

// Default export
export default OrganizationManager 