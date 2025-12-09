import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

export interface TypingStatus {
    userId: string
    userName: string
    isTyping: boolean
    timestamp: Timestamp
}

export class TypingService {
    /**
     * Set typing status for a user in a chat
     */
    static async setTypingStatus(
        chatId: string,
        userId: string,
        userName: string,
        isTyping: boolean
    ): Promise<{ success: boolean; error?: string }> {
        try {
            if (!db) {
                return { success: false, error: 'Database not initialized' }
            }

            const typingRef = doc(db, 'chats', chatId, 'typing', userId)

            if (isTyping) {
                // Set typing status
                await setDoc(typingRef, {
                    userId,
                    userName,
                    isTyping: true,
                    timestamp: serverTimestamp()
                })
            } else {
                // Remove typing status
                await deleteDoc(typingRef)
            }

            return { success: true }
        } catch (error: any) {
            console.error('Error setting typing status:', error)
            return { success: false, error: error.message }
        }
    }

    /**
     * Subscribe to typing status in a chat (excludes current user)
     */
    static subscribeToTypingStatus(
        chatId: string,
        currentUserId: string,
        onTypingChange: (typingUsers: string[]) => void
    ): () => void {
        if (!db) {
            console.error('Database not initialized')
            return () => { }
        }

        const typingCollectionRef = collection(db, 'chats', chatId, 'typing')
        const q = query(typingCollectionRef, where('isTyping', '==', true))

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const typingUsers: string[] = []

            snapshot.forEach((doc) => {
                const data = doc.data() as TypingStatus

                // Exclude current user and check timestamp (remove stale entries)
                if (data.userId !== currentUserId) {
                    // Only include if timestamp is recent (within last 5 seconds)
                    const now = Date.now()
                    const typingTime = data.timestamp?.toMillis() || 0
                    if (now - typingTime < 5000) {
                        typingUsers.push(data.userName)
                    }
                }
            })

            onTypingChange(typingUsers)
        })

        return unsubscribe
    }

    /**
     * Cleanup typing status (call when leaving chat or component unmounts)
     */
    static async cleanupTypingStatus(
        chatId: string,
        userId: string
    ): Promise<void> {
        try {
            if (!db) return

            const typingRef = doc(db, 'chats', chatId, 'typing', userId)
            await deleteDoc(typingRef)
        } catch (error) {
            console.error('Error cleaning up typing status:', error)
        }
    }
}
