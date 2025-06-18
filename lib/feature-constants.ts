// Feature Constants for NexChat Application
// This file centralizes all feature configurations to ensure consistency across the application

import { ICONS } from './icon-constants'

// Feature Categories
export const FEATURE_CATEGORIES = {
  // Authentication Features
  AUTHENTICATION: {
    EMAIL_PASSWORD_SIGN_IN: {
      name: 'Email/Password Sign In',
      description: 'Traditional email and password authentication',
      icon: ICONS.UTILITY.MAIL,
      enabled: true,
      required: true,
    },
    GOOGLE_SIGN_IN: {
      name: 'Google Sign In',
      description: 'OAuth authentication with Google',
      icon: ICONS.UTILITY.GLOBE,
      enabled: true,
      required: false,
    },
    ACCOUNT_CREATION: {
      name: 'Account Creation',
      description: 'User registration and account setup',
      icon: ICONS.USER.USER_PLUS,
      enabled: true,
      required: true,
    },
    PASSWORD_RESET: {
      name: 'Password Reset',
      description: 'Account recovery via email',
      icon: ICONS.UTILITY.REFRESH,
      enabled: true,
      required: false,
    },
    SESSION_MANAGEMENT: {
      name: 'Session Management',
      description: 'Persistent login state management',
      icon: ICONS.UTILITY.CLOCK,
      enabled: true,
      required: true,
    },
  },

  // Chat Features
  CHAT: {
    REAL_TIME_MESSAGING: {
      name: 'Real-time Messaging',
      description: 'Instant message delivery with Firebase',
      icon: ICONS.CHAT.MESSAGE,
      enabled: true,
      required: true,
    },
    DIRECT_CHATS: {
      name: 'Direct Chats',
      description: 'One-on-one conversations',
      icon: ICONS.USER.USER,
      enabled: true,
      required: true,
    },
    GROUP_CHATS: {
      name: 'Group Chats',
      description: 'Multi-participant conversations',
      icon: ICONS.USER.USERS,
      enabled: true,
      required: false,
    },
    MESSAGE_HISTORY: {
      name: 'Message History',
      description: 'Persistent message storage',
      icon: ICONS.UTILITY.ARCHIVE,
      enabled: true,
      required: true,
    },
    READ_RECEIPTS: {
      name: 'Read Receipts',
      description: 'Message status indicators',
      icon: ICONS.UTILITY.EYE,
      enabled: true,
      required: false,
    },
    TYPING_INDICATORS: {
      name: 'Typing Indicators',
      description: 'Real-time typing status',
      icon: ICONS.COMMUNICATION.MIC,
      enabled: true,
      required: false,
    },
  },

  // Message Features
  MESSAGE: {
    TEXT_MESSAGES: {
      name: 'Text Messages',
      description: 'Basic text communication',
      icon: ICONS.CREATIVE.TYPE,
      enabled: true,
      required: true,
    },
    RICH_TEXT: {
      name: 'Rich Text',
      description: 'Formatted text messages',
      icon: ICONS.CREATIVE.BOLD,
      enabled: true,
      required: false,
    },
    MESSAGE_REACTIONS: {
      name: 'Message Reactions',
      description: 'Emoji reactions to messages',
      icon: ICONS.COMMUNICATION.SMILE,
      enabled: true,
      required: false,
    },
    MESSAGE_REPLIES: {
      name: 'Message Replies',
      description: 'Reply to specific messages',
      icon: ICONS.ACTION.REPLY,
      enabled: true,
      required: false,
    },
    MESSAGE_EDITING: {
      name: 'Message Editing',
      description: 'Edit sent messages',
      icon: ICONS.ACTION.EDIT,
      enabled: true,
      required: false,
    },
    MESSAGE_DELETION: {
      name: 'Message Deletion',
      description: 'Remove messages',
      icon: ICONS.ACTION.DELETE,
      enabled: true,
      required: false,
    },
    MESSAGE_SEARCH: {
      name: 'Message Search',
      description: 'Find specific messages',
      icon: ICONS.CHAT.SEARCH,
      enabled: true,
      required: false,
    },
  },

  // File Sharing Features
  FILE_SHARING: {
    FILE_UPLOAD: {
      name: 'File Upload',
      description: 'Drag & drop file sharing',
      icon: ICONS.FILE.UPLOAD,
      enabled: true,
      required: false,
    },
    IMAGE_SHARING: {
      name: 'Image Sharing',
      description: 'Direct image uploads with preview',
      icon: ICONS.FILE.IMAGE,
      enabled: true,
      required: false,
    },
    DOCUMENT_SHARING: {
      name: 'Document Sharing',
      description: 'PDF, Word, text files',
      icon: ICONS.FILE.DOCUMENT,
      enabled: true,
      required: false,
    },
    VIDEO_SHARING: {
      name: 'Video Sharing',
      description: 'Video file uploads with player',
      icon: ICONS.FILE.VIDEO,
      enabled: true,
      required: false,
    },
    AUDIO_SHARING: {
      name: 'Audio Sharing',
      description: 'Voice notes and audio files',
      icon: ICONS.FILE.AUDIO,
      enabled: true,
      required: false,
    },
    FILE_PREVIEW: {
      name: 'File Preview',
      description: 'Preview shared files',
      icon: ICONS.UTILITY.EYE,
      enabled: true,
      required: false,
    },
    SHORT_URLS: {
      name: 'Short URLs',
      description: 'Shareable file links',
      icon: ICONS.UTILITY.LINK,
      enabled: true,
      required: false,
    },
  },

  // Communication Features
  COMMUNICATION: {
    VOICE_CALLS: {
      name: 'Voice Calls',
      description: 'Audio communication',
      icon: ICONS.CHAT.PHONE,
      enabled: false,
      required: false,
    },
    VIDEO_CALLS: {
      name: 'Video Calls',
      description: 'Video communication',
      icon: ICONS.CHAT.VIDEO,
      enabled: false,
      required: false,
    },
    VOICE_MESSAGES: {
      name: 'Voice Messages',
      description: 'Audio message recording',
      icon: ICONS.COMMUNICATION.MIC,
      enabled: true,
      required: false,
    },
    LOCATION_SHARING: {
      name: 'Location Sharing',
      description: 'Share current location',
      icon: ICONS.UTILITY.LOCATION,
      enabled: true,
      required: false,
    },
    CONTACT_SHARING: {
      name: 'Contact Sharing',
      description: 'Share contact information',
      icon: ICONS.USER.USER,
      enabled: true,
      required: false,
    },
  },

  // Group Management Features
  GROUP_MANAGEMENT: {
    CREATE_GROUPS: {
      name: 'Create Groups',
      description: 'Start group conversations',
      icon: ICONS.USER.USERS,
      enabled: true,
      required: false,
    },
    ADD_MEMBERS: {
      name: 'Add Members',
      description: 'Invite users to groups',
      icon: ICONS.USER.USER_PLUS,
      enabled: true,
      required: false,
    },
    REMOVE_MEMBERS: {
      name: 'Remove Members',
      description: 'Remove users from groups',
      icon: ICONS.ACTION.DELETE,
      enabled: true,
      required: false,
    },
    GROUP_SETTINGS: {
      name: 'Group Settings',
      description: 'Manage group information',
      icon: ICONS.USER.SETTINGS,
      enabled: true,
      required: false,
    },
    ADMIN_CONTROLS: {
      name: 'Admin Controls',
      description: 'Group administration',
      icon: ICONS.USER.CROWN,
      enabled: true,
      required: false,
    },
    GROUP_PERMISSIONS: {
      name: 'Group Permissions',
      description: 'Member permissions management',
      icon: ICONS.SECURITY.SHIELD,
      enabled: true,
      required: false,
    },
  },

  // Contact Management Features
  CONTACT_MANAGEMENT: {
    ADD_CONTACTS: {
      name: 'Add Contacts',
      description: 'Find and add users',
      icon: ICONS.USER.USER_PLUS,
      enabled: true,
      required: false,
    },
    CONTACT_LIST: {
      name: 'Contact List',
      description: 'Manage contacts',
      icon: ICONS.USER.USERS,
      enabled: true,
      required: false,
    },
    USER_DISCOVERY: {
      name: 'User Discovery',
      description: 'Find new users',
      icon: ICONS.CHAT.SEARCH,
      enabled: true,
      required: false,
    },
    CONTACT_ACTIONS: {
      name: 'Contact Actions',
      description: 'Message, call, block contacts',
      icon: ICONS.ACTION.MORE_VERTICAL,
      enabled: true,
      required: false,
    },
    CONTACT_SEARCH: {
      name: 'Contact Search',
      description: 'Find specific contacts',
      icon: ICONS.CHAT.SEARCH,
      enabled: true,
      required: false,
    },
  },

  // Privacy & Security Features
  PRIVACY_SECURITY: {
    PRIVACY_SETTINGS: {
      name: 'Privacy Settings',
      description: 'Control information visibility',
      icon: ICONS.SECURITY.SHIELD,
      enabled: true,
      required: false,
    },
    ONLINE_STATUS: {
      name: 'Online Status',
      description: 'Show/hide online status',
      icon: ICONS.STATUS.ONLINE,
      enabled: true,
      required: false,
    },
    READ_RECEIPTS_PRIVACY: {
      name: 'Read Receipts Privacy',
      description: 'Control read receipt visibility',
      icon: ICONS.UTILITY.EYE,
      enabled: true,
      required: false,
    },
    PROFILE_PRIVACY: {
      name: 'Profile Privacy',
      description: 'Control profile visibility',
      icon: ICONS.USER.USER,
      enabled: true,
      required: false,
    },
    MESSAGE_PRIVACY: {
      name: 'Message Privacy',
      description: 'Control message visibility',
      icon: ICONS.CHAT.MESSAGE,
      enabled: true,
      required: false,
    },
    BLOCK_USERS: {
      name: 'Block Users',
      description: 'Block unwanted users',
      icon: ICONS.SECURITY.LOCK,
      enabled: true,
      required: false,
    },
  },

  // Notification Features
  NOTIFICATIONS: {
    PUSH_NOTIFICATIONS: {
      name: 'Push Notifications',
      description: 'Real-time alerts',
      icon: ICONS.NOTIFICATION.BELL,
      enabled: true,
      required: false,
    },
    MESSAGE_NOTIFICATIONS: {
      name: 'Message Notifications',
      description: 'New message alerts',
      icon: ICONS.CHAT.MESSAGE,
      enabled: true,
      required: false,
    },
    CALL_NOTIFICATIONS: {
      name: 'Call Notifications',
      description: 'Incoming call alerts',
      icon: ICONS.CHAT.PHONE,
      enabled: true,
      required: false,
    },
    GROUP_NOTIFICATIONS: {
      name: 'Group Notifications',
      description: 'Group activity alerts',
      icon: ICONS.USER.USERS,
      enabled: true,
      required: false,
    },
    SOUND_SETTINGS: {
      name: 'Sound Settings',
      description: 'Notification sounds',
      icon: ICONS.NOTIFICATION.VOLUME,
      enabled: true,
      required: false,
    },
    VIBRATION_SETTINGS: {
      name: 'Vibration Settings',
      description: 'Notification vibration',
      icon: ICONS.UTILITY.ZAP,
      enabled: true,
      required: false,
    },
  },

  // Search & Discovery Features
  SEARCH_DISCOVERY: {
    MESSAGE_SEARCH: {
      name: 'Message Search',
      description: 'Find specific messages',
      icon: ICONS.CHAT.SEARCH,
      enabled: true,
      required: false,
    },
    CONTACT_SEARCH: {
      name: 'Contact Search',
      description: 'Find users',
      icon: ICONS.USER.USER,
      enabled: true,
      required: false,
    },
    CHAT_SEARCH: {
      name: 'Chat Search',
      description: 'Find conversations',
      icon: ICONS.CHAT.MESSAGE,
      enabled: true,
      required: false,
    },
    FILE_SEARCH: {
      name: 'File Search',
      description: 'Find shared files',
      icon: ICONS.FILE.FILE,
      enabled: true,
      required: false,
    },
    GLOBAL_SEARCH: {
      name: 'Global Search',
      description: 'Search across all content',
      icon: ICONS.CHAT.SEARCH,
      enabled: true,
      required: false,
    },
  },

  // Settings & Preferences Features
  SETTINGS_PREFERENCES: {
    PROFILE_SETTINGS: {
      name: 'Profile Settings',
      description: 'Edit personal information',
      icon: ICONS.USER.USER,
      enabled: true,
      required: false,
    },
    ACCOUNT_SETTINGS: {
      name: 'Account Settings',
      description: 'Manage account details',
      icon: ICONS.USER.SETTINGS,
      enabled: true,
      required: false,
    },
    PRIVACY_SETTINGS: {
      name: 'Privacy Settings',
      description: 'Control privacy options',
      icon: ICONS.SECURITY.SHIELD,
      enabled: true,
      required: false,
    },
    NOTIFICATION_SETTINGS: {
      name: 'Notification Settings',
      description: 'Manage notifications',
      icon: ICONS.NOTIFICATION.BELL,
      enabled: true,
      required: false,
    },
    THEME_SETTINGS: {
      name: 'Theme Settings',
      description: 'Choose appearance',
      icon: ICONS.THEME.SUN,
      enabled: true,
      required: false,
    },
    LANGUAGE_SETTINGS: {
      name: 'Language Settings',
      description: 'Select language',
      icon: ICONS.UTILITY.GLOBE,
      enabled: true,
      required: false,
    },
    ACCESSIBILITY_SETTINGS: {
      name: 'Accessibility Settings',
      description: 'Accessibility options',
      icon: ICONS.UTILITY.HELP,
      enabled: false,
      required: false,
    },
  },
} as const

// Feature Status Constants
export const FEATURE_STATUS = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  BETA: 'beta',
  COMING_SOON: 'coming_soon',
  DEPRECATED: 'deprecated',
} as const

// Feature Priority Constants
export const FEATURE_PRIORITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  OPTIONAL: 'optional',
} as const

// Helper function to get feature configuration
export function getFeatureConfig(category: keyof typeof FEATURE_CATEGORIES, name: string) {
  const featureCategory = FEATURE_CATEGORIES[category]
  if (!featureCategory) {
    console.warn(`Feature category "${category}" not found`)
    return null
  }
  
  const featureConfig = featureCategory[name as keyof typeof featureCategory]
  if (!featureConfig) {
    console.warn(`Feature "${name}" not found in category "${category}"`)
    return null
  }
  
  return featureConfig
}

// Helper function to check if feature is enabled
export function isFeatureEnabled(category: keyof typeof FEATURE_CATEGORIES, name: string): boolean {
  const config = getFeatureConfig(category, name)
  return config?.enabled || false
}

// Helper function to get all enabled features
export function getEnabledFeatures() {
  const enabledFeatures: Array<{
    category: string
    name: string
    config: any
  }> = []
  
  Object.entries(FEATURE_CATEGORIES).forEach(([category, features]) => {
    Object.entries(features).forEach(([name, config]) => {
      if (config.enabled) {
        enabledFeatures.push({
          category,
          name,
          config,
        })
      }
    })
  })
  
  return enabledFeatures
}

// Helper function to get all required features
export function getRequiredFeatures() {
  const requiredFeatures: Array<{
    category: string
    name: string
    config: any
  }> = []
  
  Object.entries(FEATURE_CATEGORIES).forEach(([category, features]) => {
    Object.entries(features).forEach(([name, config]) => {
      if (config.required) {
        requiredFeatures.push({
          category,
          name,
          config,
        })
      }
    })
  })
  
  return requiredFeatures
}

// Helper function to get features by category
export function getFeaturesByCategory(category: keyof typeof FEATURE_CATEGORIES) {
  const featureCategory = FEATURE_CATEGORIES[category]
  if (!featureCategory) {
    console.warn(`Feature category "${category}" not found`)
    return []
  }
  
  return Object.entries(featureCategory).map(([name, config]) => ({
    name,
    config,
  }))
}

// Type definitions
export type FeatureCategory = keyof typeof FEATURE_CATEGORIES
export type FeatureName<T extends FeatureCategory> = keyof typeof FEATURE_CATEGORIES[T]
export type FeatureStatus = keyof typeof FEATURE_STATUS
export type FeaturePriority = keyof typeof FEATURE_PRIORITY 