export interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  direction: 'ltr' | 'rtl'
}

export interface LanguageSettings {
  currentLanguage: string
  fallbackLanguage: string
  autoDetect: boolean
}

class LanguageService {
  private settings: LanguageSettings = {
    currentLanguage: 'en',
    fallbackLanguage: 'en',
    autoDetect: true,
  }

  // Supported languages
  private supportedLanguages: Language[] = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      direction: 'ltr'
    },
    {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      flag: '🇪🇸',
      direction: 'ltr'
    },
    {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      flag: '🇫🇷',
      direction: 'ltr'
    },
    {
      code: 'de',
      name: 'German',
      nativeName: 'Deutsch',
      flag: '🇩🇪',
      direction: 'ltr'
    },
    {
      code: 'it',
      name: 'Italian',
      nativeName: 'Italiano',
      flag: '🇮🇹',
      direction: 'ltr'
    },
    {
      code: 'pt',
      name: 'Portuguese',
      nativeName: 'Português',
      flag: '🇵🇹',
      direction: 'ltr'
    },
    {
      code: 'ru',
      name: 'Russian',
      nativeName: 'Русский',
      flag: '🇷🇺',
      direction: 'ltr'
    },
    {
      code: 'zh',
      name: 'Chinese (Simplified)',
      nativeName: '中文 (简体)',
      flag: '🇨🇳',
      direction: 'ltr'
    },
    {
      code: 'ja',
      name: 'Japanese',
      nativeName: '日本語',
      flag: '🇯🇵',
      direction: 'ltr'
    },
    {
      code: 'ko',
      name: 'Korean',
      nativeName: '한국어',
      flag: '🇰🇷',
      direction: 'ltr'
    },
    {
      code: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      flag: '🇸🇦',
      direction: 'rtl'
    },
    {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      flag: '🇮🇳',
      direction: 'ltr'
    },
    {
      code: 'tr',
      name: 'Turkish',
      nativeName: 'Türkçe',
      flag: '🇹🇷',
      direction: 'ltr'
    },
    {
      code: 'nl',
      name: 'Dutch',
      nativeName: 'Nederlands',
      flag: '🇳🇱',
      direction: 'ltr'
    },
    {
      code: 'pl',
      name: 'Polish',
      nativeName: 'Polski',
      flag: '🇵🇱',
      direction: 'ltr'
    },
    {
      code: 'sv',
      name: 'Swedish',
      nativeName: 'Svenska',
      flag: '🇸🇪',
      direction: 'ltr'
    }
  ]

  constructor() {
    this.loadSettings()
    this.initializeLanguage()
  }

  private loadSettings() {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('languageSettings')
        if (saved) {
          this.settings = { ...this.settings, ...JSON.parse(saved) }
        }
      }
    } catch (error) {
      console.warn('Failed to load language settings:', error)
    }
  }

  private saveSettings() {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        localStorage.setItem('languageSettings', JSON.stringify(this.settings))
      }
    } catch (error) {
      console.warn('Failed to save language settings:', error)
    }
  }

  private initializeLanguage() {
    // Only run in browser environment
    if (typeof window === 'undefined') return
    
    if (this.settings.autoDetect) {
      const browserLanguage = navigator.language.split('-')[0]
      const supportedLanguage = this.supportedLanguages.find(lang => lang.code === browserLanguage)
      if (supportedLanguage) {
        this.settings.currentLanguage = browserLanguage
      }
    }
  }

  getSupportedLanguages(): Language[] {
    return this.supportedLanguages
  }

  getCurrentLanguage(): string {
    return this.settings.currentLanguage
  }

  getLanguageSettings(): LanguageSettings {
    return { ...this.settings }
  }

  getLanguageByCode(code: string): Language | undefined {
    return this.supportedLanguages.find(lang => lang.code === code)
  }

  setLanguage(languageCode: string): boolean {
    const language = this.supportedLanguages.find(lang => lang.code === languageCode)
    if (!language) {
      return false
    }

    this.settings.currentLanguage = languageCode
    this.saveSettings()
    
    // Update document direction for RTL languages
    document.documentElement.dir = language.direction
    document.documentElement.lang = languageCode
    
    // Dispatch custom event for language change
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: languageCode } 
    }))
    
    return true
  }

  updateSettings(settings: Partial<LanguageSettings>): void {
    this.settings = { ...this.settings, ...settings }
    this.saveSettings()
    
    if (settings.currentLanguage) {
      this.setLanguage(settings.currentLanguage)
    }
  }

  // Translation function (placeholder for future i18n implementation)
  t(key: string, params?: Record<string, string>): string {
    // This is a placeholder. In a real implementation, you would use a proper i18n library
    // like react-i18next, next-intl, or similar
    const translations: Record<string, Record<string, string>> = {
      en: {
        // Settings
        'settings.language.title': 'App Language',
        'settings.language.subtitle': 'Choose your preferred language',
        'settings.language.autoDetect': 'Auto-detect language',
        'settings.language.autoDetect.description': 'Automatically detect language from your browser',
        'settings.language.save': 'Save Language Settings',
        'settings.language.cancel': 'Cancel',
        'settings.language.search': 'Search languages...',
        'settings.language.recent': 'Recently Used',
        'settings.language.all': 'All Languages',
        'settings.language.success': 'Language updated successfully',
        'settings.language.error': 'Failed to update language',
        
        // Common
        'common.loading': 'Loading...',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.search': 'Search',
        'common.close': 'Close',
        'common.back': 'Back',
        'common.next': 'Next',
        'common.previous': 'Previous',
        'common.done': 'Done',
        'common.edit': 'Edit',
        'common.delete': 'Delete',
        'common.add': 'Add',
        'common.remove': 'Remove',
        'common.yes': 'Yes',
        'common.no': 'No',
        'common.ok': 'OK',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.warning': 'Warning',
        'common.info': 'Information',
        
        // Navigation
        'nav.home': 'Home',
        'nav.chats': 'Chats',
        'nav.contacts': 'Contacts',
        'nav.settings': 'Settings',
        'nav.profile': 'Profile',
        'nav.logout': 'Logout',
        
        // Chat
        'chat.new': 'New Chat',
        'chat.search': 'Search conversations...',
        'chat.noConversations': 'No conversations yet',
        'chat.startChat': 'Start a new chat to begin messaging',
        'chat.typeMessage': 'Type a message...',
        'chat.send': 'Send',
        'chat.attach': 'Attach file',
        'chat.emoji': 'Add emoji',
        'chat.voice': 'Voice message',
        'chat.online': 'Online',
        'chat.offline': 'Offline',
        'chat.typing': 'typing...',
        'chat.lastSeen': 'Last seen',
        'chat.members': 'members',
        'chat.admin': 'Admin',
        
        // Auth
        'auth.signIn': 'Sign In',
        'auth.signUp': 'Sign Up',
        'auth.signOut': 'Sign Out',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.confirmPassword': 'Confirm Password',
        'auth.name': 'Full Name',
        'auth.forgotPassword': 'Forgot password?',
        'auth.rememberMe': 'Remember me',
        'auth.signInWithGoogle': 'Sign in with Google',
        'auth.signUpWithGoogle': 'Sign up with Google',
        'auth.noAccount': "Don't have an account?",
        'auth.hasAccount': 'Already have an account?',
        'auth.createAccount': 'Create account',
        'auth.welcomeBack': 'Welcome back',
        'auth.createYourAccount': 'Create your account',
        
        // Messages
        'message.sent': 'Sent',
        'message.delivered': 'Delivered',
        'message.read': 'Read',
        'message.edited': 'edited',
        'message.replyingTo': 'Replying to',
        'message.reply': 'Reply',
        'message.edit': 'Edit',
        'message.delete': 'Delete',
        'message.copy': 'Copy',
        'message.forward': 'Forward',
        'message.pin': 'Pin',
        'message.unpin': 'Unpin',
        
        // Profile
        'profile.edit': 'Edit Profile',
        'profile.displayName': 'Display Name',
        'profile.bio': 'Bio',
        'profile.phone': 'Phone Number',
        'profile.photo': 'Profile Photo',
        'profile.saveChanges': 'Save Changes',
        'profile.cancel': 'Cancel',
        'profile.about': 'About',
        'profile.status': 'Status',
        'profile.lastSeen': 'Last seen',
        
        // Notifications
        'notifications.title': 'Notifications',
        'notifications.enabled': 'Enabled',
        'notifications.disabled': 'Disabled',
        'notifications.messageNotifications': 'Message Notifications',
        'notifications.callNotifications': 'Call Notifications',
        'notifications.groupNotifications': 'Group Notifications',
        'notifications.sound': 'Sound',
        'notifications.vibration': 'Vibration',
        'notifications.quietHours': 'Quiet Hours',
        
        // Privacy
        'privacy.title': 'Privacy Settings',
        'privacy.onlineStatus': 'Online Status',
        'privacy.lastSeen': 'Last Seen',
        'privacy.readReceipts': 'Read Receipts',
        'privacy.profileVisibility': 'Profile Visibility',
        'privacy.messagePrivacy': 'Message Privacy',
        'privacy.blockedUsers': 'Blocked Users',
        
        // Welcome
        'welcome.title': 'Welcome to Nex Chat',
        'welcome.subtitle': 'Modern messaging for everyone',
        'welcome.getStarted': 'Get Started',
        'welcome.tryDemo': 'Try Demo',
        'welcome.features': 'Features',
        'welcome.realTimeMessaging': 'Real-time Messaging',
        'welcome.groupChats': 'Group Chats',
        'welcome.privacyFirst': 'Privacy First',
        
        // Errors
        'error.general': 'Something went wrong',
        'error.network': 'Network error',
        'error.unauthorized': 'Unauthorized',
        'error.notFound': 'Not found',
        'error.validation': 'Validation error',
        'error.server': 'Server error',
      },
      es: {
        // Settings
        'settings.language.title': 'Idioma de la Aplicación',
        'settings.language.subtitle': 'Elige tu idioma preferido',
        'settings.language.autoDetect': 'Detectar idioma automáticamente',
        'settings.language.autoDetect.description': 'Detectar automáticamente el idioma de tu navegador',
        'settings.language.save': 'Guardar Configuración de Idioma',
        'settings.language.cancel': 'Cancelar',
        'settings.language.search': 'Buscar idiomas...',
        'settings.language.recent': 'Usados Recientemente',
        'settings.language.all': 'Todos los Idiomas',
        'settings.language.success': 'Idioma actualizado exitosamente',
        'settings.language.error': 'Error al actualizar el idioma',
        
        // Common
        'common.loading': 'Cargando...',
        'common.save': 'Guardar',
        'common.cancel': 'Cancelar',
        'common.search': 'Buscar',
        'common.close': 'Cerrar',
        'common.back': 'Atrás',
        'common.next': 'Siguiente',
        'common.previous': 'Anterior',
        'common.done': 'Hecho',
        'common.edit': 'Editar',
        'common.delete': 'Eliminar',
        'common.add': 'Agregar',
        'common.remove': 'Quitar',
        'common.yes': 'Sí',
        'common.no': 'No',
        'common.ok': 'OK',
        'common.error': 'Error',
        'common.success': 'Éxito',
        'common.warning': 'Advertencia',
        'common.info': 'Información',
        
        // Navigation
        'nav.home': 'Inicio',
        'nav.chats': 'Chats',
        'nav.contacts': 'Contactos',
        'nav.settings': 'Configuración',
        'nav.profile': 'Perfil',
        'nav.logout': 'Cerrar Sesión',
        
        // Chat
        'chat.new': 'Nuevo Chat',
        'chat.search': 'Buscar conversaciones...',
        'chat.noConversations': 'No hay conversaciones aún',
        'chat.startChat': 'Inicia un nuevo chat para comenzar a mensajear',
        'chat.typeMessage': 'Escribe un mensaje...',
        'chat.send': 'Enviar',
        'chat.attach': 'Adjuntar archivo',
        'chat.emoji': 'Agregar emoji',
        'chat.voice': 'Mensaje de voz',
        'chat.online': 'En línea',
        'chat.offline': 'Desconectado',
        'chat.typing': 'escribiendo...',
        'chat.lastSeen': 'Visto por última vez',
        'chat.members': 'miembros',
        'chat.admin': 'Administrador',
        
        // Auth
        'auth.signIn': 'Iniciar Sesión',
        'auth.signUp': 'Registrarse',
        'auth.signOut': 'Cerrar Sesión',
        'auth.email': 'Correo Electrónico',
        'auth.password': 'Contraseña',
        'auth.confirmPassword': 'Confirmar Contraseña',
        'auth.name': 'Nombre Completo',
        'auth.forgotPassword': '¿Olvidaste tu contraseña?',
        'auth.rememberMe': 'Recordarme',
        'auth.signInWithGoogle': 'Iniciar sesión con Google',
        'auth.signUpWithGoogle': 'Registrarse con Google',
        'auth.noAccount': '¿No tienes una cuenta?',
        'auth.hasAccount': '¿Ya tienes una cuenta?',
        'auth.createAccount': 'Crear cuenta',
        'auth.welcomeBack': 'Bienvenido de vuelta',
        'auth.createYourAccount': 'Crea tu cuenta',
        
        // Welcome
        'welcome.title': 'Bienvenido a Nex Chat',
        'welcome.subtitle': 'Mensajería moderna para todos',
        'welcome.getStarted': 'Comenzar',
        'welcome.tryDemo': 'Probar Demo',
        'welcome.features': 'Características',
        'welcome.realTimeMessaging': 'Mensajería en Tiempo Real',
        'welcome.groupChats': 'Chats Grupales',
        'welcome.privacyFirst': 'Privacidad Primero',
      },
      fr: {
        // Settings
        'settings.language.title': 'Langue de l\'Application',
        'settings.language.subtitle': 'Choisissez votre langue préférée',
        'settings.language.autoDetect': 'Détecter automatiquement la langue',
        'settings.language.autoDetect.description': 'Détecter automatiquement la langue de votre navigateur',
        'settings.language.save': 'Enregistrer les Paramètres de Langue',
        'settings.language.cancel': 'Annuler',
        'settings.language.search': 'Rechercher des langues...',
        'settings.language.recent': 'Utilisés Récemment',
        'settings.language.all': 'Toutes les Langues',
        'settings.language.success': 'Langue mise à jour avec succès',
        'settings.language.error': 'Échec de la mise à jour de la langue',
        
        // Common
        'common.loading': 'Chargement...',
        'common.save': 'Enregistrer',
        'common.cancel': 'Annuler',
        'common.search': 'Rechercher',
        'common.close': 'Fermer',
        'common.back': 'Retour',
        'common.next': 'Suivant',
        'common.previous': 'Précédent',
        'common.done': 'Terminé',
        'common.edit': 'Modifier',
        'common.delete': 'Supprimer',
        'common.add': 'Ajouter',
        'common.remove': 'Retirer',
        'common.yes': 'Oui',
        'common.no': 'Non',
        'common.ok': 'OK',
        'common.error': 'Erreur',
        'common.success': 'Succès',
        'common.warning': 'Avertissement',
        'common.info': 'Information',
        
        // Navigation
        'nav.home': 'Accueil',
        'nav.chats': 'Chats',
        'nav.contacts': 'Contacts',
        'nav.settings': 'Paramètres',
        'nav.profile': 'Profil',
        'nav.logout': 'Déconnexion',
        
        // Chat
        'chat.new': 'Nouveau Chat',
        'chat.search': 'Rechercher des conversations...',
        'chat.noConversations': 'Aucune conversation pour le moment',
        'chat.startChat': 'Commencez une nouvelle conversation pour commencer à discuter',
        'chat.typeMessage': 'Tapez un message...',
        'chat.send': 'Envoyer',
        'chat.attach': 'Joindre un fichier',
        'chat.emoji': 'Ajouter un emoji',
        'chat.voice': 'Message vocal',
        'chat.online': 'En ligne',
        'chat.offline': 'Hors ligne',
        'chat.typing': 'écrit...',
        'chat.lastSeen': 'Vu pour la dernière fois',
        'chat.members': 'membres',
        'chat.admin': 'Administrateur',
        
        // Welcome
        'welcome.title': 'Bienvenue sur Nex Chat',
        'welcome.subtitle': 'Messagerie moderne pour tous',
        'welcome.getStarted': 'Commencer',
        'welcome.tryDemo': 'Essayer la démo',
        'welcome.features': 'Fonctionnalités',
        'welcome.realTimeMessaging': 'Messagerie en Temps Réel',
        'welcome.groupChats': 'Chats de Groupe',
        'welcome.privacyFirst': 'Confidentialité d\'Abord',
      }
    }

    const currentLang = this.settings.currentLanguage
    const fallbackLang = this.settings.fallbackLanguage
    
    let translation = translations[currentLang]?.[key] || 
                     translations[fallbackLang]?.[key] || 
                     key

    // Replace parameters if provided
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, value)
      })
    }

    return translation
  }
}

// Export singleton instance
export const languageService = new LanguageService() 