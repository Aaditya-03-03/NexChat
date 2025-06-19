// Button Constants for NexChat Application
// This file centralizes all button configurations to ensure consistency across the application

import { ICONS, ICON_SIZES, ICON_COLORS } from './icon-constants'
import { 
  MessageSquare, 
  Users, 
  Settings, 
  Search, 
  Plus,
  Phone, 
  Video,
  MoreHorizontal,
  UserPlus,
  Shield,
  Bell,
  HelpCircle,
  Star,
  Archive,
  Trash2,
  User,
  Edit2,
  Languages,
  Database,
  Send,
  Image,
  File,
  Mic,
  MapPin,
  Smile,
  Reply,
  Copy,
  Download,
  Share2,
  Crown,
  LogOut
} from 'lucide-react'

// Button Categories
export const BUTTON_CATEGORIES = {
  // Primary Action Buttons
  PRIMARY_ACTIONS: {
    SEND_MESSAGE: {
      label: 'Send Message',
      icon: ICONS.COMMUNICATION.SEND,
      variant: 'default',
      size: 'default',
      className: 'bg-primary hover:bg-primary/90 text-white',
    },
    CREATE_CHAT: {
      label: 'Create Chat',
      icon: ICONS.CHAT.MESSAGE,
      variant: 'default',
      size: 'default',
      className: 'bg-primary hover:bg-primary/90 text-white',
    },
    UPLOAD_FILE: {
      label: 'Upload File',
      icon: ICONS.FILE.UPLOAD,
      variant: 'outline',
      size: 'default',
      className: 'border-primary text-primary hover:bg-primary/10',
    },
    SIGN_IN: {
      label: 'Sign In',
      icon: null,
      variant: 'default',
      size: 'default',
      className: 'bg-primary hover:bg-primary/90 text-white',
    },
    SIGN_UP: {
      label: 'Sign Up',
      icon: null,
      variant: 'default',
      size: 'default',
      className: 'bg-primary hover:bg-primary/90 text-white',
    },
  },

  // Secondary Action Buttons
  SECONDARY_ACTIONS: {
    SEARCH: {
      label: 'Search',
      icon: ICONS.CHAT.SEARCH,
      variant: 'ghost',
      size: 'icon',
      className: 'hover:bg-primary/10',
    },
    SETTINGS: {
      label: 'Settings',
      icon: ICONS.USER.SETTINGS,
      variant: 'ghost',
      size: 'icon',
      className: 'hover:bg-primary/10',
    },
    PROFILE: {
      label: 'Profile',
      icon: ICONS.USER.USER,
      variant: 'ghost',
      size: 'icon',
      className: 'hover:bg-primary/10',
    },
    LOGOUT: {
      label: 'Logout',
      icon: ICONS.UTILITY.LOGOUT,
      variant: 'ghost',
      size: 'default',
      className: 'hover:bg-destructive/10 text-destructive',
    },
  },

  // Chat Action Buttons
  CHAT_ACTIONS: {
    VOICE_CALL: {
      label: 'Voice Call',
      icon: ICONS.CHAT.PHONE,
      variant: 'ghost',
      size: 'icon',
      className: 'hover:bg-primary/10',
    },
    VIDEO_CALL: {
      label: 'Video Call',
      icon: ICONS.CHAT.VIDEO,
      variant: 'ghost',
      size: 'icon',
      className: 'hover:bg-primary/10',
    },
    MORE_OPTIONS: {
      label: 'More Options',
      icon: ICONS.CHAT.MORE_VERTICAL,
      variant: 'ghost',
      size: 'icon',
      className: 'hover:bg-primary/10',
    },
    BACK_TO_CHAT_LIST: {
      label: 'Back to Chat List',
      icon: ICONS.NAVIGATION.BACK,
      variant: 'ghost',
      size: 'icon',
      className: 'hover:bg-primary/10',
    },
  },

  // Message Action Buttons
  MESSAGE_ACTIONS: {
    REPLY: {
      label: 'Reply',
      icon: ICONS.ACTION.REPLY,
      variant: 'ghost',
      size: 'sm',
      className: 'hover:bg-primary/10',
    },
    EDIT: {
      label: 'Edit',
      icon: ICONS.ACTION.EDIT,
      variant: 'ghost',
      size: 'sm',
      className: 'hover:bg-primary/10',
    },
    DELETE: {
      label: 'Delete',
      icon: ICONS.ACTION.DELETE,
      variant: 'ghost',
      size: 'sm',
      className: 'hover:bg-destructive/10 text-destructive',
    },
    REACT: {
      label: 'React',
      icon: ICONS.COMMUNICATION.SMILE,
      variant: 'ghost',
      size: 'sm',
      className: 'hover:bg-primary/10',
    },
  },

  // File Action Buttons
  FILE_ACTIONS: {
    DOWNLOAD: {
      label: 'Download',
      icon: ICONS.FILE.DOWNLOAD,
      variant: 'outline',
      size: 'default',
      className: 'border-primary text-primary hover:bg-primary/10',
    },
    COPY_LINK: {
      label: 'Copy Link',
      icon: ICONS.ACTION.COPY,
      variant: 'outline',
      size: 'icon',
      className: 'border-primary text-primary hover:bg-primary/10',
    },
    PREVIEW: {
      label: 'Preview',
      icon: ICONS.UTILITY.EYE,
      variant: 'outline',
      size: 'default',
      className: 'border-primary text-primary hover:bg-primary/10',
    },
    REMOVE: {
      label: 'Remove',
      icon: ICONS.ACTION.DELETE,
      variant: 'ghost',
      size: 'sm',
      className: 'hover:bg-destructive/10 text-destructive',
    },
  },

  // Group Management Buttons
  GROUP_ACTIONS: {
    ADD_MEMBER: {
      label: 'Add Member',
      icon: ICONS.USER.USER_PLUS,
      variant: 'outline',
      size: 'default',
      className: 'border-primary text-primary hover:bg-primary/10',
    },
    REMOVE_MEMBER: {
      label: 'Remove Member',
      icon: ICONS.ACTION.DELETE,
      variant: 'outline',
      size: 'default',
      className: 'border-destructive text-destructive hover:bg-destructive/10',
    },
    LEAVE_GROUP: {
      label: 'Leave Group',
      icon: ICONS.UTILITY.LOGOUT,
      variant: 'outline',
      size: 'default',
      className: 'border-destructive text-destructive hover:bg-destructive/10',
    },
    DELETE_GROUP: {
      label: 'Delete Group',
      icon: ICONS.ACTION.DELETE,
      variant: 'destructive',
      size: 'default',
      className: 'bg-destructive hover:bg-destructive/90 text-white',
    },
  },

  // Settings Action Buttons
  SETTINGS_ACTIONS: {
    SAVE_CHANGES: {
      label: 'Save Changes',
      icon: ICONS.UTILITY.SAVE,
      variant: 'default',
      size: 'default',
      className: 'bg-primary hover:bg-primary/90 text-white',
    },
    RESET_DEFAULT: {
      label: 'Reset to Default',
      icon: ICONS.UTILITY.REFRESH,
      variant: 'outline',
      size: 'default',
      className: 'border-muted-foreground text-muted-foreground hover:bg-muted',
    },
    EXPORT_DATA: {
      label: 'Export Data',
      icon: ICONS.FILE.DOWNLOAD,
      variant: 'outline',
      size: 'default',
      className: 'border-primary text-primary hover:bg-primary/10',
    },
    DELETE_ACCOUNT: {
      label: 'Delete Account',
      icon: ICONS.ACTION.DELETE,
      variant: 'destructive',
      size: 'default',
      className: 'bg-destructive hover:bg-destructive/90 text-white',
    },
  },

  // Navigation Buttons
  NAVIGATION: {
    HOME: {
      label: 'Home',
      icon: ICONS.NAVIGATION.HOME,
      variant: 'ghost',
      size: 'icon',
      className: 'hover:bg-primary/10',
    },
    BACK: {
      label: 'Back',
      icon: ICONS.NAVIGATION.BACK,
      variant: 'ghost',
      size: 'icon',
      className: 'hover:bg-primary/10',
    },
    CLOSE: {
      label: 'Close',
      icon: ICONS.NAVIGATION.CLOSE,
      variant: 'ghost',
      size: 'icon',
      className: 'hover:bg-primary/10',
    },
    MENU: {
      label: 'Menu',
      icon: ICONS.NAVIGATION.MENU,
      variant: 'ghost',
      size: 'icon',
      className: 'hover:bg-primary/10',
    },
  },

  // Form Buttons
  FORM_ACTIONS: {
    SUBMIT: {
      label: 'Submit',
      icon: null,
      variant: 'default',
      size: 'default',
      className: 'bg-primary hover:bg-primary/90 text-white',
    },
    CANCEL: {
      label: 'Cancel',
      icon: null,
      variant: 'outline',
      size: 'default',
      className: 'border-muted-foreground text-muted-foreground hover:bg-muted',
    },
    CONFIRM: {
      label: 'Confirm',
      icon: ICONS.UTILITY.CHECK,
      variant: 'default',
      size: 'default',
      className: 'bg-primary hover:bg-primary/90 text-white',
    },
    RESET: {
      label: 'Reset',
      icon: ICONS.UTILITY.REFRESH,
      variant: 'outline',
      size: 'default',
      className: 'border-muted-foreground text-muted-foreground hover:bg-muted',
    },
  },

  // Media Control Buttons
  MEDIA_CONTROLS: {
    PLAY: {
      label: 'Play',
      icon: ICONS.MEDIA.PLAY,
      variant: 'ghost',
      size: 'icon',
      className: 'hover:bg-primary/10',
    },
    PAUSE: {
      label: 'Pause',
      icon: ICONS.MEDIA.PAUSE,
      variant: 'ghost',
      size: 'icon',
      className: 'hover:bg-primary/10',
    },
    STOP: {
      label: 'Stop',
      icon: ICONS.MEDIA.STOP,
      variant: 'ghost',
      size: 'icon',
      className: 'hover:bg-primary/10',
    },
    RECORD: {
      label: 'Record',
      icon: ICONS.COMMUNICATION.MIC,
      variant: 'ghost',
      size: 'icon',
      className: 'hover:bg-destructive/10 text-destructive',
    },
  },

  // Theme Buttons
  THEME_ACTIONS: {
    LIGHT_MODE: {
      label: 'Light Mode',
      icon: ICONS.THEME.SUN,
      variant: 'ghost',
      size: 'icon',
      className: 'hover:bg-primary/10',
    },
    DARK_MODE: {
      label: 'Dark Mode',
      icon: ICONS.THEME.MOON,
      variant: 'ghost',
      size: 'icon',
      className: 'hover:bg-primary/10',
    },
    SYSTEM_MODE: {
      label: 'System Mode',
      icon: ICONS.THEME.MONITOR,
      variant: 'ghost',
      size: 'icon',
      className: 'hover:bg-primary/10',
    },
  },

  // Notification Buttons
  NOTIFICATION_ACTIONS: {
    ENABLE_NOTIFICATIONS: {
      label: 'Enable Notifications',
      icon: ICONS.NOTIFICATION.BELL,
      variant: 'outline',
      size: 'default',
      className: 'border-primary text-primary hover:bg-primary/10',
    },
    DISABLE_NOTIFICATIONS: {
      label: 'Disable Notifications',
      icon: ICONS.NOTIFICATION.BELL_OFF,
      variant: 'outline',
      size: 'default',
      className: 'border-muted-foreground text-muted-foreground hover:bg-muted',
    },
    ENABLE_SOUND: {
      label: 'Enable Sound',
      icon: ICONS.NOTIFICATION.VOLUME,
      variant: 'outline',
      size: 'default',
      className: 'border-primary text-primary hover:bg-primary/10',
    },
    DISABLE_SOUND: {
      label: 'Disable Sound',
      icon: ICONS.NOTIFICATION.VOLUME_OFF,
      variant: 'outline',
      size: 'default',
      className: 'border-muted-foreground text-muted-foreground hover:bg-muted',
    },
  },
} as const

// Button Size Constants
export const BUTTON_SIZES = {
  XS: 'h-6 px-2 text-xs',
  SM: 'h-8 px-3 text-sm',
  MD: 'h-10 px-4 text-sm',
  LG: 'h-11 px-8 text-base',
  XL: 'h-12 px-10 text-lg',
  ICON_SM: 'h-8 w-8',
  ICON_MD: 'h-10 w-10',
  ICON_LG: 'h-12 w-12',
} as const

// Button Variant Constants
export const BUTTON_VARIANTS = {
  DEFAULT: 'bg-primary text-primary-foreground hover:bg-primary/90',
  DESTRUCTIVE: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  OUTLINE: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  SECONDARY: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  GHOST: 'hover:bg-accent hover:text-accent-foreground',
  LINK: 'text-primary underline-offset-4 hover:underline',
} as const

// Button State Constants
export const BUTTON_STATES = {
  DEFAULT: '',
  LOADING: 'opacity-50 cursor-not-allowed',
  DISABLED: 'opacity-50 cursor-not-allowed pointer-events-none',
  ACTIVE: 'bg-primary/20 text-primary',
  SELECTED: 'bg-primary text-white',
} as const

// Helper function to get button configuration
export function getButtonConfig(category: keyof typeof BUTTON_CATEGORIES, name: string) {
  const buttonCategory = BUTTON_CATEGORIES[category]
  if (!buttonCategory) {
    console.warn(`Button category "${category}" not found`)
    return null
  }
  
  const buttonConfig = buttonCategory[name as keyof typeof buttonCategory]
  if (!buttonConfig) {
    console.warn(`Button "${name}" not found in category "${category}"`)
    return null
  }
  
  return buttonConfig
}

// Helper function to get button with configuration
export function getButtonWithConfig(
  category: keyof typeof BUTTON_CATEGORIES,
  name: string,
  onClick?: () => void,
  disabled?: boolean,
  loading?: boolean,
  className?: string
) {
  const config = getButtonConfig(category, name)
  if (!config) return null
  
  const IconComponent = config.icon
  
  return {
    label: config.label,
    icon: IconComponent,
    variant: config.variant,
    size: config.size,
    className: `${config.className} ${disabled ? BUTTON_STATES.DISABLED : ''} ${loading ? BUTTON_STATES.LOADING : ''} ${className || ''}`,
    onClick,
    disabled: disabled || loading,
  }
}

// Type definitions
export type ButtonCategory = keyof typeof BUTTON_CATEGORIES
export type ButtonName<T extends ButtonCategory> = keyof typeof BUTTON_CATEGORIES[T]
export type ButtonSize = keyof typeof BUTTON_SIZES
export type ButtonVariant = keyof typeof BUTTON_VARIANTS
export type ButtonState = keyof typeof BUTTON_STATES

export const CHAT_BUTTONS = {
  SEND: {
    icon: Send,
    label: 'Send Message',
    action: 'send',
    variant: 'primary'
  },
  ATTACH: {
    icon: File,
    label: 'Attach File',
    action: 'attach',
    variant: 'ghost'
  },
  EMOJI: {
    icon: Smile,
    label: 'Add Emoji',
    action: 'emoji',
    variant: 'ghost'
  },
  VOICE: {
    icon: Mic,
    label: 'Voice Message',
    action: 'voice',
    variant: 'ghost'
  },
  LOCATION: {
    icon: MapPin,
    label: 'Share Location',
    action: 'location',
    variant: 'ghost'
  }
}

export const MESSAGE_ACTIONS = {
  REPLY: {
    icon: Reply,
    label: 'Reply',
    action: 'reply'
  },
  COPY: {
    icon: Copy,
    label: 'Copy',
    action: 'copy'
  },
  EDIT: {
    icon: Edit2,
    label: 'Edit',
    action: 'edit'
  },
  DELETE: {
    icon: Trash2,
    label: 'Delete',
    action: 'delete'
  }
}

export const FILE_ACTIONS = {
  DOWNLOAD: {
    icon: Download,
    label: 'Download',
    action: 'download'
  },
  SHARE: {
    icon: Share2,
    label: 'Share',
    action: 'share'
  },
  COPY_LINK: {
    icon: Copy,
    label: 'Copy Link',
    action: 'copyLink'
  }
}

export const GROUP_ACTIONS = {
  ADD_MEMBER: {
    icon: UserPlus,
    label: 'Add Member',
    action: 'addMember'
  },
  REMOVE_MEMBER: {
    icon: Users,
    label: 'Remove Member',
    action: 'removeMember'
  },
  MAKE_ADMIN: {
    icon: Crown,
    label: 'Make Admin',
    action: 'makeAdmin'
  },
  LEAVE_GROUP: {
    icon: LogOut,
    label: 'Leave Group',
    action: 'leaveGroup'
  }
}

export const NAVIGATION_BUTTONS = {
  CHATS: {
    icon: MessageSquare,
    label: 'Chats',
    action: 'chats'
  },
  CONTACTS: {
    icon: Users,
    label: 'Contacts',
    action: 'contacts'
  },
  SETTINGS: {
    icon: Settings,
    label: 'Settings',
    action: 'settings'
  },
  SEARCH: {
    icon: Search,
    label: 'Search',
    action: 'search'
  }
}

export const SETTINGS_BUTTONS = {
  PROFILE: {
    icon: User,
    label: 'Profile',
    action: 'profile'
  },
  PRIVACY: {
    icon: Shield,
    label: 'Privacy',
    action: 'privacy'
  },
  NOTIFICATIONS: {
    icon: Bell,
    label: 'Notifications',
    action: 'notifications'
  },
  LANGUAGE: {
    icon: Languages,
    label: 'Language',
    action: 'language'
  },
  HELP: {
    icon: HelpCircle,
    label: 'Help',
    action: 'help'
  }
} 