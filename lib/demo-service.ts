// Demo service for when Firebase is not available
export interface DemoUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface DemoMessage {
  id: string;
  content: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
}

export interface DemoChat {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  participants: string[];
  lastMessage?: DemoMessage;
  lastMessageTime?: Date;
}

class DemoService {
  private users: DemoUser[] = [
    {
      uid: 'demo-user-1',
      email: 'demo@example.com',
      displayName: 'Demo User',
      photoURL: '/placeholder-user.jpg'
    }
  ];

  private chats: DemoChat[] = [
    {
      id: 'demo-chat-1',
      name: 'Demo Chat',
      type: 'direct',
      participants: ['demo-user-1', 'demo-user-2'],
      lastMessage: {
        id: 'demo-msg-1',
        content: 'Hello! This is a demo message.',
        userId: 'demo-user-2',
        userDisplayName: 'Demo Friend',
        timestamp: new Date(),
        type: 'text'
      },
      lastMessageTime: new Date()
    }
  ];

  private messages: { [chatId: string]: DemoMessage[] } = {
    'demo-chat-1': [
      {
        id: 'demo-msg-1',
        content: 'Hello! This is a demo message.',
        userId: 'demo-user-2',
        userDisplayName: 'Demo Friend',
        timestamp: new Date(Date.now() - 60000),
        type: 'text'
      },
      {
        id: 'demo-msg-2',
        content: 'Hi there! How are you?',
        userId: 'demo-user-1',
        userDisplayName: 'Demo User',
        timestamp: new Date(Date.now() - 30000),
        type: 'text'
      }
    ]
  };

  // Auth methods
  async signInWithEmailAndPassword(email: string, password: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = this.users.find(u => u.email === email);
    if (user && password === 'demo123') {
      return { success: true, user };
    }
    return { success: false, error: 'Invalid credentials' };
  }

  async signUpWithEmailAndPassword(email: string, password: string, displayName: string) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: DemoUser = {
      uid: `demo-user-${Date.now()}`,
      email,
      displayName,
      photoURL: '/placeholder-user.jpg'
    };
    
    this.users.push(newUser);
    return { success: true, user: newUser };
  }

  async signOut() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }

  // Chat methods
  async getChats(userId: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, chats: this.chats };
  }

  async getMessages(chatId: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const messages = this.messages[chatId] || [];
    return { success: true, messages };
  }

  async sendMessage(chatId: string, messageData: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newMessage: DemoMessage = {
      id: `demo-msg-${Date.now()}`,
      content: messageData.content,
      userId: messageData.userId,
      userDisplayName: messageData.userDisplayName,
      userPhotoURL: messageData.userPhotoURL,
      timestamp: new Date(),
      type: messageData.type || 'text'
    };

    if (!this.messages[chatId]) {
      this.messages[chatId] = [];
    }
    this.messages[chatId].push(newMessage);

    // Update last message in chat
    const chat = this.chats.find(c => c.id === chatId);
    if (chat) {
      chat.lastMessage = newMessage;
      chat.lastMessageTime = newMessage.timestamp;
    }

    return { success: true, message: newMessage };
  }

  // User methods
  async getUserProfile(userId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = this.users.find(u => u.uid === userId);
    return { success: true, user };
  }

  async updateUserProfile(userId: string, updates: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = this.users.find(u => u.uid === userId);
    if (user) {
      Object.assign(user, updates);
      return { success: true, user };
    }
    return { success: false, error: 'User not found' };
  }

  // Demo notification
  async triggerDemoNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Demo Notification', {
        body: 'This is a demo notification from the demo service!',
        icon: '/placeholder-logo.png'
      });
    }
  }
}

export const demoService = new DemoService(); 