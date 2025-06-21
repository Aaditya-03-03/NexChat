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
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { notificationService } from './notification-service';

export interface Message {
  id: string;
  chatId: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'voice' | 'video' | 'location' | 'system';
  timestamp: Timestamp;
  readBy: string[];
  edited?: boolean;
  editedAt?: Timestamp;
  reactions?: {
    [emoji: string]: string[];
  };
  replyTo?: {
    messageId: string;
    content: string;
    userDisplayName: string;
  };
  // Additional metadata for different file types
  fileMetadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: number; // for voice/video
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
  };
  // URL fields for file sharing
  shortUrl?: string;
  originalUrl?: string;
  status: 'sent' | 'delivered' | 'read';
  deliveredTo: string[];
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
    status: 'sent' | 'delivered' | 'read';
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
  static subscribeToMessages(chatId: string, callback: (messages: Message[]) => void, currentUserId?: string) {
    console.log('ChatService: Subscribing to messages for chat:', chatId)
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(50));
    
    return onSnapshot(q, async (snapshot) => {
      console.log('ChatService: Received snapshot for chat:', chatId, 'docs count:', snapshot.docs.length)
      const messages: Message[] = [];
      
      // Process each message
      for (const doc of snapshot.docs) {
        const messageData = doc.data() as Message;
        messages.push({ id: doc.id, ...messageData });
        
        // If there's a current user and the message is not from them
        if (currentUserId && messageData.userId !== currentUserId) {
          // Mark as delivered if not already delivered to this user
          if (!messageData.deliveredTo?.includes(currentUserId)) {
            await this.markMessageAsDelivered(chatId, doc.id, currentUserId);
          }
          
          // Mark as read if the chat window is open and visible
          if (document.visibilityState === 'visible' && !messageData.readBy?.includes(currentUserId)) {
            await this.markMessageAsRead(chatId, doc.id, currentUserId);
          }

          // Check if this is a new message that needs notification
          const messageTime = messageData.timestamp?.toDate?.() || new Date(messageData.timestamp);
          const isNewMessage = Date.now() - messageTime.getTime() < 10000; // Within last 10 seconds
          
          if (isNewMessage) {
            await this.handleNewMessageNotification(messageData, chatId);
          }
        }
      }
      
      console.log('ChatService: Calling callback with messages:', messages.length)
      callback(messages.reverse());
    }, (error) => {
      console.error('ChatService: Error in message subscription for chat:', chatId, error)
    });
  }

  // Handle notifications for new messages
  private static async handleNewMessageNotification(message: Message, chatId: string) {
    try {
      // Don't notify if the document is visible and the chat window is open
      if (document.visibilityState === 'visible') {
        return;
      }

      // Get chat details to determine if it's a group chat
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      if (!chatDoc.exists()) return;
      
      const chatData = chatDoc.data();
      const isGroupChat = chatData.type === 'group';
      
      // Check if user is mentioned in group messages
      const isMentioned = isGroupChat && message.content.includes('@');
      
      // Truncate long messages for notification
      const truncatedContent = message.content.length > 100 
        ? message.content.substring(0, 97) + '...'
        : message.content;
      
      if (isMentioned) {
        await notificationService.notifyMention(
          message.userDisplayName,
          truncatedContent,
          chatData.name || 'Group'
        );
      } else {
        await notificationService.notifyNewMessage(
          message.userDisplayName,
          truncatedContent,
          isGroupChat
        );
      }
    } catch (error) {
      console.warn('Failed to handle message notification:', error);
    }
  }

  // Get real-time chats for a user
  static subscribeToUserChats(userId: string, callback: (chats: Chat[]) => void) {
    console.log('ChatService: Subscribing to user chats for user:', userId)
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      console.log('ChatService: Received user chats snapshot, docs count:', snapshot.docs.length)
      const chats: Chat[] = [];
      snapshot.forEach((doc) => {
        chats.push({ id: doc.id, ...doc.data() } as Chat);
      });
      console.log('ChatService: Calling user chats callback with chats:', chats.length)
      callback(chats);
    }, (error) => {
      console.error('ChatService: Error in user chats subscription for user:', userId, error)
    });
  }

  // Send a message
  static async sendMessage(
    chatId: string, 
    message: Omit<Message, 'id' | 'timestamp' | 'readBy' | 'deliveredTo' | 'status'>
  ) {
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      
      const messageData = {
        ...message,
        timestamp: serverTimestamp(),
        status: 'sent' as const,
        deliveredTo: [],
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
          status: 'sent'
        },
        updatedAt: serverTimestamp(),
      });
      
      return { success: true, messageId: docRef.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Mark message as delivered
  static async markMessageAsDelivered(chatId: string, messageId: string, userId: string) {
    try {
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
      await updateDoc(messageRef, {
        deliveredTo: arrayUnion(userId),
        status: 'delivered'
      });
      return { success: true };
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
        status: 'read'
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Create a direct chat between two users
  static async createDirectChat(userId1: string, userId2: string) {
    console.log('ChatService: Creating direct chat between users:', userId1, userId2);
    try {
      // Check if chat already exists
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('type', '==', 'direct'),
        where('participants', 'array-contains', userId1)
      );
      
      console.log('ChatService: Checking for existing chat...');
      const snapshot = await getDocs(q);
      console.log('ChatService: Found', snapshot.docs.length, 'existing chats for user', userId1);
      
      const existingChat = snapshot.docs.find(doc => {
        const data = doc.data();
        return data.participants.includes(userId2);
      });
      
      if (existingChat) {
        console.log('ChatService: Found existing chat:', existingChat.id);
        return { success: true, chatId: existingChat.id };
      }
      
      // Create new chat
      console.log('ChatService: Creating new direct chat...');
      const chatData: Omit<Chat, 'id'> = {
        type: 'direct',
        participants: [userId1, userId2],
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };
      
      console.log('ChatService: Chat data to create:', chatData);
      const docRef = await addDoc(chatsRef, chatData);
      console.log('ChatService: Successfully created chat with ID:', docRef.id);
      return { success: true, chatId: docRef.id };
    } catch (error: any) {
      console.error('ChatService: Error creating direct chat:', error);
      return { success: false, error: error.message };
    }
  }

  // Create a group chat
  static async createGroupChat(name: string, participants: string[], creatorId: string) {
    console.log('ChatService: Creating group chat:', { name, participants, creatorId });
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
      
      console.log('ChatService: Group chat data to create:', chatData);
      const docRef = await addDoc(chatsRef, chatData);
      console.log('ChatService: Successfully created group chat with ID:', docRef.id);
      return { success: true, chatId: docRef.id };
    } catch (error: any) {
      console.error('ChatService: Error creating group chat:', error);
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

  // Leave group chat (user leaves themselves)
  static async leaveGroup(chatId: string, userId: string) {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (!chatDoc.exists()) {
        return { success: false, error: 'Chat not found' };
      }
      
      const chatData = chatDoc.data() as Chat;
      
      // Check if it's a group chat
      if (chatData.type !== 'group') {
        return { success: false, error: 'This is not a group chat' };
      }
      
      // Check if user is a participant
      if (!chatData.participants.includes(userId)) {
        return { success: false, error: 'You are not a member of this group' };
      }
      
      // Check if user is the creator (first admin)
      const isCreator = chatData.admins?.[0] === userId;
      if (isCreator) {
        return { success: false, error: 'Group creator cannot leave the group. Please delete the group instead.' };
      }
      
      // Remove user from participants and admins
      await updateDoc(chatRef, {
        participants: arrayRemove(userId),
        admins: arrayRemove(userId),
        updatedAt: serverTimestamp(),
      });

      // Fetch user displayName
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      let displayName = 'A member';
      if (userDoc.exists()) {
        displayName = userDoc.data().displayName || userDoc.data().name || 'A member';
      }

      // Send system message to group chat
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        chatId,
        userId: 'system',
        userDisplayName: 'System',
        content: `${displayName} has left the group`,
        type: 'system',
        timestamp: serverTimestamp(),
        readBy: [],
      });
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Edit message
  static async editMessage(chatId: string, messageId: string, newContent: string, userId: string) {
    try {
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
      const messageDoc = await getDocs(query(collection(db, 'chats', chatId, 'messages'), where('__name__', '==', messageId)));
      
      if (!messageDoc.empty) {
        const messageData = messageDoc.docs[0].data();
        if (messageData.userId === userId) {
          await updateDoc(messageRef, {
            content: newContent,
            edited: true,
            editedAt: serverTimestamp(),
          });
          return { success: true };
        } else {
          return { success: false, error: 'You can only edit your own messages' };
        }
      }
      return { success: false, error: 'Message not found' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Add reaction to message
  static async addReaction(chatId: string, messageId: string, userId: string, reaction: string) {
    try {
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
      await updateDoc(messageRef, {
        [`reactions.${reaction}`]: arrayUnion(userId),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Remove reaction from message
  static async removeReaction(chatId: string, messageId: string, userId: string, reaction: string) {
    try {
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
      await updateDoc(messageRef, {
        [`reactions.${reaction}`]: arrayRemove(userId),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Search messages in chat
  static async searchMessages(chatId: string, searchQuery: string) {
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      
      // Get all messages and filter client-side for better search results
      const q = query(
        messagesRef,
        orderBy('timestamp', 'desc'),
        limit(100) // Limit to recent messages for performance
      );
      
      const snapshot = await getDocs(q);
      const messages: Message[] = [];
      const searchTerm = searchQuery.toLowerCase().trim();
      
      snapshot.forEach((doc) => {
        const messageData = { id: doc.id, ...doc.data() } as Message;
        
        // Filter messages that contain the search query in content or userDisplayName
        if (messageData.content.toLowerCase().includes(searchTerm) ||
            messageData.userDisplayName.toLowerCase().includes(searchTerm)) {
          messages.push(messageData);
        }
      });
      
      // Sort by timestamp (newest first) and limit results
      messages.sort((a, b) => {
        const timeA = a.timestamp.toDate ? a.timestamp.toDate().getTime() : new Date(a.timestamp).getTime();
        const timeB = b.timestamp.toDate ? b.timestamp.toDate().getTime() : new Date(b.timestamp).getTime();
        return timeB - timeA;
      });
      
      return { success: true, messages: messages.slice(0, 20) };
    } catch (error: any) {
      console.error('Search error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, profileData: { displayName?: string; photoURL?: string; bio?: string }) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get user profile
  static async getUserProfile(userId: string) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return { success: true, profile: { id: userDoc.id, ...userDoc.data() } };
      } else {
        return { success: false, error: 'User not found' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Archive chat
  static async archiveChat(chatId: string, userId: string) {
    try {
      const userChatRef = doc(db, 'userChats', `${userId}_${chatId}`);
      await updateDoc(userChatRef, {
        archived: true,
        archivedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Unarchive chat
  static async unarchiveChat(chatId: string, userId: string) {
    try {
      const userChatRef = doc(db, 'userChats', `${userId}_${chatId}`);
      await updateDoc(userChatRef, {
        archived: false,
        archivedAt: null,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Mute chat notifications
  static async muteChat(chatId: string, userId: string, muted: boolean) {
    try {
      const userChatRef = doc(db, 'userChats', `${userId}_${chatId}`);
      await updateDoc(userChatRef, {
        muted,
        mutedAt: muted ? serverTimestamp() : null,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Pin message
  static async pinMessage(chatId: string, messageId: string, userId: string) {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDocs(query(collection(db, 'chats'), where('__name__', '==', chatId)));
      
      if (!chatDoc.empty) {
        const chatData = chatDoc.docs[0].data();
        if (chatData.admins?.includes(userId) || chatData.type === 'direct') {
          await updateDoc(chatRef, {
            pinnedMessage: {
              messageId,
              pinnedBy: userId,
              pinnedAt: serverTimestamp(),
            },
          });
          return { success: true };
        } else {
          return { success: false, error: 'Only admins can pin messages' };
        }
      }
      return { success: false, error: 'Chat not found' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Unpin message
  static async unpinMessage(chatId: string, userId: string) {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDocs(query(collection(db, 'chats'), where('__name__', '==', chatId)));
      
      if (!chatDoc.empty) {
        const chatData = chatDoc.docs[0].data();
        if (chatData.admins?.includes(userId) || chatData.type === 'direct') {
          await updateDoc(chatRef, {
            pinnedMessage: null,
          });
          return { success: true };
        } else {
          return { success: false, error: 'Only admins can unpin messages' };
        }
      }
      return { success: false, error: 'Chat not found' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Delete chat (remove user from chat or delete entire chat for direct chats)
  static async deleteChat(chatId: string, userId: string) {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (!chatDoc.exists()) {
        return { success: false, error: 'Chat not found' };
      }
      
      const chatData = chatDoc.data() as Chat;
      
      // For direct chats, remove the user from participants
      if (chatData.type === 'direct') {
        const updatedParticipants = chatData.participants.filter(p => p !== userId);
        
        if (updatedParticipants.length === 0) {
          // If no participants left, delete the entire chat
          await deleteDoc(chatRef);
        } else {
          // Update participants list
          await updateDoc(chatRef, {
            participants: updatedParticipants,
            updatedAt: serverTimestamp(),
          });
        }
      } else {
        // For group chats, just remove the user from participants
        await updateDoc(chatRef, {
          participants: arrayRemove(userId),
          admins: arrayRemove(userId),
          updatedAt: serverTimestamp(),
        });
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Delete user account and all associated data
  static async deleteUserAccount(userId: string) {
    try {
      // Delete user profile
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);

      // Delete user status
      const statusRef = doc(db, 'userStatus', userId);
      await deleteDoc(statusRef);

      // Get all chats where user is a participant
      const chatsRef = collection(db, 'chats');
      const userChatsQuery = query(
        chatsRef,
        where('participants', 'array-contains', userId)
      );
      const userChatsSnapshot = await getDocs(userChatsQuery);

      // Process each chat
      for (const chatDoc of userChatsSnapshot.docs) {
        const chatData = chatDoc.data() as Chat;
        
        if (chatData.type === 'direct') {
          // For direct chats, remove user from participants
          const updatedParticipants = chatData.participants.filter(p => p !== userId);
          
          if (updatedParticipants.length === 0) {
            // If no participants left, delete the entire chat and its messages
            const messagesRef = collection(db, 'chats', chatDoc.id, 'messages');
            const messagesSnapshot = await getDocs(messagesRef);
            
            // Delete all messages
            const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            
            // Delete the chat
            await deleteDoc(chatDoc.ref);
          } else {
            // Update participants list
            await updateDoc(chatDoc.ref, {
              participants: updatedParticipants,
              updatedAt: serverTimestamp(),
            });
          }
        } else {
          // For group chats, remove user from participants and admins
          await updateDoc(chatDoc.ref, {
            participants: arrayRemove(userId),
            admins: arrayRemove(userId),
            updatedAt: serverTimestamp(),
          });
        }
      }

      // Delete user chat preferences (if they exist)
      const userChatsRef = collection(db, 'userChats');
      const userChatPrefsQuery = query(
        userChatsRef,
        where('userId', '==', userId)
      );
      const userChatPrefsSnapshot = await getDocs(userChatPrefsQuery);
      
      const deletePrefsPromises = userChatPrefsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePrefsPromises);

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting user account:', error);
      return { success: false, error: error.message };
    }
  }
} 