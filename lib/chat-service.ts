import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Message {
  id: string;
  chatId: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: Timestamp;
  readBy: string[];
  replyTo?: {
    messageId: string;
    content: string;
    userDisplayName: string;
  };
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  photoURL?: string;
  participants: string[];
  admins?: string[];
  lastMessage?: {
    content: string;
    timestamp: Timestamp;
    userId: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserStatus {
  uid: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Timestamp;
}

export class ChatService {
  // Get real-time messages for a chat
  static subscribeToMessages(chatId: string, callback: (messages: Message[]) => void) {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(50));
    
    return onSnapshot(q, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as Message);
      });
      callback(messages.reverse());
    });
  }

  // Get real-time chats for a user
  static subscribeToUserChats(userId: string, callback: (chats: Chat[]) => void) {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const chats: Chat[] = [];
      snapshot.forEach((doc) => {
        chats.push({ id: doc.id, ...doc.data() } as Chat);
      });
      callback(chats);
    });
  }

  // Send a message
  static async sendMessage(chatId: string, message: Omit<Message, 'id' | 'timestamp' | 'readBy'>) {
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const messageData = {
        ...message,
        timestamp: serverTimestamp(),
        readBy: [message.userId],
      };
      
      const docRef = await addDoc(messagesRef, messageData);
      
      // Update chat's last message
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: {
          content: message.content,
          timestamp: serverTimestamp(),
          userId: message.userId,
        },
        updatedAt: serverTimestamp(),
      });
      
      return { success: true, messageId: docRef.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Create a direct chat between two users
  static async createDirectChat(userId1: string, userId2: string) {
    try {
      // Check if chat already exists
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('type', '==', 'direct'),
        where('participants', 'array-contains', userId1)
      );
      
      const snapshot = await getDocs(q);
      const existingChat = snapshot.docs.find(doc => {
        const data = doc.data();
        return data.participants.includes(userId2);
      });
      
      if (existingChat) {
        return { success: true, chatId: existingChat.id };
      }
      
      // Create new chat
      const chatData: Omit<Chat, 'id'> = {
        type: 'direct',
        participants: [userId1, userId2],
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };
      
      const docRef = await addDoc(chatsRef, chatData);
      return { success: true, chatId: docRef.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Create a group chat
  static async createGroupChat(name: string, participants: string[], creatorId: string) {
    try {
      const chatsRef = collection(db, 'chats');
      const chatData: Omit<Chat, 'id'> = {
        type: 'group',
        name,
        participants: [...participants, creatorId],
        admins: [creatorId],
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };
      
      const docRef = await addDoc(chatsRef, chatData);
      return { success: true, chatId: docRef.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Mark message as read
  static async markMessageAsRead(chatId: string, messageId: string, userId: string) {
    try {
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
      await updateDoc(messageRef, {
        readBy: arrayUnion(userId),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get all users (for adding to chats)
  static async getAllUsers(currentUserId: string) {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const users = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.id !== currentUserId);
      return { success: true, users };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Update user status
  static async updateUserStatus(userId: string, status: 'online' | 'offline' | 'away') {
    try {
      const statusRef = doc(db, 'userStatus', userId);
      await updateDoc(statusRef, {
        status,
        lastSeen: serverTimestamp(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Subscribe to user status
  static subscribeToUserStatus(userId: string, callback: (status: UserStatus | null) => void) {
    const statusRef = doc(db, 'userStatus', userId);
    
    return onSnapshot(statusRef, (doc) => {
      if (doc.exists()) {
        callback({ uid: doc.id, ...doc.data() } as UserStatus);
      } else {
        callback(null);
      }
    });
  }

  // Delete message
  static async deleteMessage(chatId: string, messageId: string, userId: string) {
    try {
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
      const messageDoc = await getDocs(query(collection(db, 'chats', chatId, 'messages'), where('__name__', '==', messageId)));
      
      if (!messageDoc.empty) {
        const messageData = messageDoc.docs[0].data();
        if (messageData.userId === userId) {
          await deleteDoc(messageRef);
          return { success: true };
        } else {
          return { success: false, error: 'You can only delete your own messages' };
        }
      }
      return { success: false, error: 'Message not found' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Add user to group chat
  static async addUserToGroup(chatId: string, userId: string, adminId: string) {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDocs(query(collection(db, 'chats'), where('__name__', '==', chatId)));
      
      if (!chatDoc.empty) {
        const chatData = chatDoc.docs[0].data();
        if (chatData.admins?.includes(adminId)) {
          await updateDoc(chatRef, {
            participants: arrayUnion(userId),
          });
          return { success: true };
        } else {
          return { success: false, error: 'Only admins can add users' };
        }
      }
      return { success: false, error: 'Chat not found' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Remove user from group chat
  static async removeUserFromGroup(chatId: string, userId: string, adminId: string) {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDocs(query(collection(db, 'chats'), where('__name__', '==', chatId)));
      
      if (!chatDoc.empty) {
        const chatData = chatDoc.docs[0].data();
        if (chatData.admins?.includes(adminId)) {
          await updateDoc(chatRef, {
            participants: arrayRemove(userId),
            admins: arrayRemove(userId),
          });
          return { success: true };
        } else {
          return { success: false, error: 'Only admins can remove users' };
        }
      }
      return { success: false, error: 'Chat not found' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
} 