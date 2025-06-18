// Content Constants for NexChat Application
// This file centralizes all content configurations to ensure consistency across the application

import { ICONS } from './icon-constants'

// Content Categories
export const CONTENT_CATEGORIES = {
  // Landing Page Content
  LANDING_PAGE: {
    HERO: {
      title: 'Modern Messaging for Everyone',
      subtitle: 'Nex Chat brings a fresh, futuristic approach to messaging with a beautiful glassmorphism UI and powerful features.',
      cta_primary: 'Get Started',
      cta_secondary: 'Try Demo',
    },
    FEATURES: {
      REAL_TIME_MESSAGING: {
        title: 'Real-time Messaging',
        description: 'Send and receive messages instantly with read receipts and typing indicators.',
        icon: ICONS.CHAT.MESSAGE,
      },
      GROUP_CHATS: {
        title: 'Group Chats',
        description: 'Create and manage group conversations with friends, family, or colleagues.',
        icon: ICONS.USER.USERS,
      },
      PRIVACY_FIRST: {
        title: 'Privacy First',
        description: 'Control who sees your information with customizable privacy settings.',
        icon: ICONS.SECURITY.SHIELD,
      },
    },
    CTA_SECTION: {
      title: 'Ready to get started?',
      subtitle: 'Join thousands of users already enjoying Nex Chat\'s modern messaging experience.',
      cta_text: 'Create Account',
    },
  },

  // Authentication Content
  AUTHENTICATION: {
    SIGN_IN: {
      title: 'Welcome back',
      subtitle: 'Sign in to your Nex Chat account',
      form_title: 'Sign In',
      email_label: 'Email',
      email_placeholder: 'name@example.com',
      password_label: 'Password',
      password_placeholder: '••••••••',
      forgot_password: 'Forgot password?',
      submit_text: 'Sign in',
      loading_text: 'Signing in...',
      google_text: 'Sign in with Google',
      no_account: "Don't have an account?",
      sign_up_link: 'Sign up',
    },
    SIGN_UP: {
      title: 'Create your account',
      subtitle: 'Join Nex Chat and start messaging today',
      form_title: 'Sign Up',
      name_label: 'Full Name',
      name_placeholder: 'John Doe',
      email_label: 'Email',
      email_placeholder: 'name@example.com',
      password_label: 'Password',
      password_placeholder: '••••••••',
      confirm_password_label: 'Confirm Password',
      confirm_password_placeholder: '••••••••',
      submit_text: 'Create account',
      loading_text: 'Creating account...',
      google_text: 'Sign up with Google',
      has_account: 'Already have an account?',
      sign_in_link: 'Sign in',
    },
  },

  // Dashboard Content
  DASHBOARD: {
    HEADER: {
      title: 'Nex Chat',
      subtitle: 'Modern messaging platform',
    },
    SIDEBAR: {
      CHATS_TAB: 'Chats',
      CONTACTS_TAB: 'Contacts',
      SETTINGS_TAB: 'Settings',
      NEW_CHAT: 'New Chat',
      SEARCH_PLACEHOLDER: 'Search chats...',
    },
    CHAT_LIST: {
      EMPTY_STATE: {
        title: 'No conversations yet',
        subtitle: 'Start a new chat to begin messaging',
        cta_text: 'Start Chat',
      },
      LOADING: 'Loading chats...',
      ERROR: 'Failed to load chats',
    },
    CHAT_WINDOW: {
      EMPTY_STATE: {
        title: 'Select a chat',
        subtitle: 'Choose a conversation from the list to start messaging',
      },
      INPUT_PLACEHOLDER: 'Type a message...',
      SEND_BUTTON: 'Send',
      ATTACH_BUTTON: 'Attach file',
      EMOJI_BUTTON: 'Add emoji',
      VOICE_BUTTON: 'Voice message',
    },
  },

  // Chat Content
  CHAT: {
    HEADER: {
      ONLINE_STATUS: 'Online',
      OFFLINE_STATUS: 'Offline',
      TYPING_STATUS: 'typing...',
      LAST_SEEN: 'Last seen',
    },
    MESSAGES: {
      SENT_STATUS: 'Sent',
      DELIVERED_STATUS: 'Delivered',
      READ_STATUS: 'Read',
      EDITED_LABEL: 'edited',
      REPLY_LABEL: 'Replying to',
      REACTIONS: {
        ADD_REACTION: 'Add reaction',
        REMOVE_REACTION: 'Remove reaction',
      },
    },
    ACTIONS: {
      REPLY: 'Reply',
      EDIT: 'Edit',
      DELETE: 'Delete',
      COPY: 'Copy',
      FORWARD: 'Forward',
      PIN: 'Pin',
      UNPIN: 'Unpin',
    },
  },

  // File Sharing Content
  FILE_SHARING: {
    UPLOAD: {
      DRAG_DROP: 'Drag and drop files here',
      CLICK_UPLOAD: 'Click to upload',
      OR_TEXT: 'or',
      BROWSE_FILES: 'Browse files',
      SUPPORTED_FORMATS: 'Supported formats: Images, Documents, Videos, Audio',
      MAX_SIZE: 'Max file size: 50MB',
    },
    PREVIEW: {
      IMAGE_PREVIEW: 'Image preview',
      VIDEO_PREVIEW: 'Video preview',
      AUDIO_PREVIEW: 'Audio preview',
      DOCUMENT_PREVIEW: 'Document preview',
      FILE_INFO: 'File information',
      DOWNLOAD: 'Download',
      OPEN: 'Open',
      SHARE: 'Share',
    },
    SHORT_URL: {
      COPY_LINK: 'Copy link',
      LINK_COPIED: 'Link copied!',
      SHARE_LINK: 'Share this link',
      EXPIRES_IN: 'Expires in',
      NEVER_EXPIRES: 'Never expires',
    },
  },

  // Group Management Content
  GROUP_MANAGEMENT: {
    CREATE_GROUP: {
      title: 'Create New Group',
      subtitle: 'Start a group conversation',
      name_label: 'Group Name',
      name_placeholder: 'Enter group name',
      description_label: 'Description (optional)',
      description_placeholder: 'Enter group description',
      members_label: 'Add Members',
      members_placeholder: 'Search users...',
      create_button: 'Create Group',
      cancel_button: 'Cancel',
    },
    GROUP_SETTINGS: {
      title: 'Group Settings',
      subtitle: 'Manage group information and members',
      info_section: 'Group Information',
      members_section: 'Members',
      permissions_section: 'Permissions',
      danger_section: 'Danger Zone',
      leave_group: 'Leave Group',
      delete_group: 'Delete Group',
      leave_confirm: 'Are you sure you want to leave this group?',
      delete_confirm: 'Are you sure you want to delete this group? This action cannot be undone.',
    },
    MEMBER_ACTIONS: {
      ADD_MEMBER: 'Add Member',
      REMOVE_MEMBER: 'Remove Member',
      MAKE_ADMIN: 'Make Admin',
      REMOVE_ADMIN: 'Remove Admin',
      BLOCK_MEMBER: 'Block Member',
      UNBLOCK_MEMBER: 'Unblock Member',
    },
  },

  // Settings Content
  SETTINGS: {
    PROFILE: {
      title: 'Profile Settings',
      subtitle: 'Manage your personal information',
      avatar_section: 'Profile Picture',
      info_section: 'Personal Information',
      name_label: 'Display Name',
      name_placeholder: 'Enter your display name',
      bio_label: 'Bio',
      bio_placeholder: 'Tell us about yourself',
      email_label: 'Email',
      phone_label: 'Phone Number',
      save_button: 'Save Changes',
      cancel_button: 'Cancel',
    },
    PRIVACY: {
      title: 'Privacy Settings',
      subtitle: 'Control your privacy and security',
      online_status: 'Online Status',
      last_seen: 'Last Seen',
      read_receipts: 'Read Receipts',
      profile_visibility: 'Profile Visibility',
      message_privacy: 'Message Privacy',
      block_list: 'Blocked Users',
      data_usage: 'Data Usage',
    },
    NOTIFICATIONS: {
      title: 'Notification Settings',
      subtitle: 'Customize your notification preferences',
      push_notifications: 'Push Notifications',
      message_notifications: 'Message Notifications',
      call_notifications: 'Call Notifications',
      group_notifications: 'Group Notifications',
      sound_enabled: 'Sound',
      vibration_enabled: 'Vibration',
      quiet_hours: 'Quiet Hours',
    },
    THEME: {
      title: 'Theme Settings',
      subtitle: 'Customize your appearance',
      light_mode: 'Light Mode',
      dark_mode: 'Dark Mode',
      system_mode: 'System',
      accent_color: 'Accent Color',
      font_size: 'Font Size',
      animations: 'Animations',
    },
    ACCOUNT: {
      title: 'Account Settings',
      subtitle: 'Manage your account',
      change_password: 'Change Password',
      two_factor: 'Two-Factor Authentication',
      connected_devices: 'Connected Devices',
      data_export: 'Export Data',
      delete_account: 'Delete Account',
      logout: 'Logout',
    },
  },

  // Error Messages
  ERRORS: {
    AUTHENTICATION: {
      INVALID_EMAIL: 'Please enter a valid email address',
      INVALID_PASSWORD: 'Password must be at least 6 characters',
      PASSWORDS_DONT_MATCH: 'Passwords do not match',
      EMAIL_IN_USE: 'Email is already in use',
      INVALID_CREDENTIALS: 'Invalid email or password',
      WEAK_PASSWORD: 'Password is too weak',
      USER_NOT_FOUND: 'User not found',
      TOO_MANY_REQUESTS: 'Too many requests. Please try again later',
    },
    CHAT: {
      MESSAGE_TOO_LONG: 'Message is too long',
      MESSAGE_EMPTY: 'Message cannot be empty',
      CHAT_NOT_FOUND: 'Chat not found',
      UNAUTHORIZED: 'You are not authorized to perform this action',
      MESSAGE_SEND_FAILED: 'Failed to send message',
      MESSAGE_EDIT_FAILED: 'Failed to edit message',
      MESSAGE_DELETE_FAILED: 'Failed to delete message',
    },
    FILE: {
      FILE_TOO_LARGE: 'File is too large',
      UNSUPPORTED_FORMAT: 'File format not supported',
      UPLOAD_FAILED: 'Failed to upload file',
      DOWNLOAD_FAILED: 'Failed to download file',
      FILE_NOT_FOUND: 'File not found',
      PERMISSION_DENIED: 'Permission denied',
    },
    NETWORK: {
      CONNECTION_ERROR: 'Connection error. Please check your internet connection',
      TIMEOUT_ERROR: 'Request timed out. Please try again',
      SERVER_ERROR: 'Server error. Please try again later',
      UNKNOWN_ERROR: 'An unknown error occurred',
    },
  },

  // Success Messages
  SUCCESS: {
    AUTHENTICATION: {
      SIGN_IN: 'Signed in successfully!',
      SIGN_UP: 'Account created successfully!',
      SIGN_OUT: 'Signed out successfully!',
      PASSWORD_CHANGED: 'Password changed successfully!',
      PROFILE_UPDATED: 'Profile updated successfully!',
    },
    CHAT: {
      MESSAGE_SENT: 'Message sent',
      MESSAGE_EDITED: 'Message updated',
      MESSAGE_DELETED: 'Message deleted',
      REACTION_ADDED: 'Reaction added',
      REACTION_REMOVED: 'Reaction removed',
      CHAT_CREATED: 'Chat created successfully',
      GROUP_CREATED: 'Group created successfully',
    },
    FILE: {
      UPLOAD_SUCCESS: 'File uploaded successfully',
      DOWNLOAD_STARTED: 'Download started',
      LINK_COPIED: 'Link copied to clipboard',
      FILE_SHARED: 'File shared successfully',
    },
    SETTINGS: {
      SETTINGS_SAVED: 'Settings saved successfully',
      NOTIFICATIONS_UPDATED: 'Notification settings updated',
      PRIVACY_UPDATED: 'Privacy settings updated',
      THEME_UPDATED: 'Theme updated',
    },
  },

  // Loading States
  LOADING: {
    AUTHENTICATION: {
      SIGNING_IN: 'Signing in...',
      SIGNING_UP: 'Creating account...',
      SIGNING_OUT: 'Signing out...',
      UPDATING_PROFILE: 'Updating profile...',
    },
    CHAT: {
      LOADING_MESSAGES: 'Loading messages...',
      SENDING_MESSAGE: 'Sending...',
      EDITING_MESSAGE: 'Updating...',
      DELETING_MESSAGE: 'Deleting...',
      LOADING_CHATS: 'Loading chats...',
      CREATING_CHAT: 'Creating chat...',
    },
    FILE: {
      UPLOADING: 'Uploading...',
      DOWNLOADING: 'Downloading...',
      PROCESSING: 'Processing...',
      GENERATING_LINK: 'Generating link...',
    },
    SETTINGS: {
      SAVING: 'Saving...',
      UPDATING: 'Updating...',
      EXPORTING: 'Exporting...',
      DELETING: 'Deleting...',
    },
  },

  // Confirmation Dialogs
  CONFIRMATIONS: {
    DELETE_MESSAGE: {
      title: 'Delete Message',
      message: 'Are you sure you want to delete this message? This action cannot be undone.',
      confirm: 'Delete',
      cancel: 'Cancel',
    },
    DELETE_CHAT: {
      title: 'Delete Chat',
      message: 'Are you sure you want to delete this chat? All messages will be permanently removed.',
      confirm: 'Delete',
      cancel: 'Cancel',
    },
    LEAVE_GROUP: {
      title: 'Leave Group',
      message: 'Are you sure you want to leave this group? You will no longer receive messages from this group.',
      confirm: 'Leave',
      cancel: 'Cancel',
    },
    DELETE_ACCOUNT: {
      title: 'Delete Account',
      message: 'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      confirm: 'Delete Account',
      cancel: 'Cancel',
    },
    LOGOUT: {
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirm: 'Logout',
      cancel: 'Cancel',
    },
  },

  // Placeholder Content
  PLACEHOLDERS: {
    SEARCH: {
      CHATS: 'Search chats...',
      MESSAGES: 'Search messages...',
      CONTACTS: 'Search contacts...',
      USERS: 'Search users...',
    },
    INPUT: {
      MESSAGE: 'Type a message...',
      GROUP_NAME: 'Enter group name...',
      USER_EMAIL: 'Enter user email...',
      DISPLAY_NAME: 'Enter display name...',
      BIO: 'Tell us about yourself...',
    },
    EMPTY_STATES: {
      NO_CHATS: 'No conversations yet',
      NO_MESSAGES: 'No messages yet',
      NO_CONTACTS: 'No contacts yet',
      NO_FILES: 'No files shared yet',
      NO_SEARCH_RESULTS: 'No results found',
    },
  },
} as const

// Content Type Constants
export const CONTENT_TYPES = {
  TEXT: 'text',
  RICH_TEXT: 'rich_text',
  HTML: 'html',
  MARKDOWN: 'markdown',
  JSON: 'json',
} as const

// Content Status Constants
export const CONTENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  DELETED: 'deleted',
} as const

// Helper function to get content configuration
export function getContentConfig(category: keyof typeof CONTENT_CATEGORIES, name: string) {
  const contentCategory = CONTENT_CATEGORIES[category]
  if (!contentCategory) {
    console.warn(`Content category "${category}" not found`)
    return null
  }
  
  const contentConfig = contentCategory[name as keyof typeof contentCategory]
  if (!contentConfig) {
    console.warn(`Content "${name}" not found in category "${category}"`)
    return null
  }
  
  return contentConfig
}

// Helper function to get content by category
export function getContentByCategory(category: keyof typeof CONTENT_CATEGORIES) {
  const contentCategory = CONTENT_CATEGORIES[category]
  if (!contentCategory) {
    console.warn(`Content category "${category}" not found`)
    return {}
  }
  
  return contentCategory
}

// Helper function to get all content
export function getAllContent() {
  return CONTENT_CATEGORIES
}

// Type definitions
export type ContentCategory = keyof typeof CONTENT_CATEGORIES
export type ContentName<T extends ContentCategory> = keyof typeof CONTENT_CATEGORIES[T]
export type ContentType = keyof typeof CONTENT_TYPES
export type ContentStatus = keyof typeof CONTENT_STATUS 