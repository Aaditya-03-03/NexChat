import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    onSnapshot,
    Timestamp,
    serverTimestamp,
    getDocs
} from 'firebase/firestore'
import { db as firebaseDb } from './firebase'

if (!firebaseDb) {
    throw new Error('Firebase database not initialized')
}

const db = firebaseDb

export interface CallInvitation {
    id: string
    chatId: string
    callerId: string
    callerName: string
    callerPhoto?: string
    calleeId: string
    callType: 'audio' | 'video'
    roomName: string
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired'
    createdAt: Timestamp
    expiresAt: Timestamp
}

const CALL_TIMEOUT_SECONDS = 60

export class JitsiCallService {
    /**
     * Create a call invitation
     */
    static async createCallInvitation(
        chatId: string,
        callerId: string,
        callerName: string,
        calleeId: string,
        callType: 'audio' | 'video',
        roomName: string,
        callerPhoto?: string
    ): Promise<{ success: boolean; invitationId?: string; error?: string }> {
        try {
            const now = new Date()
            const expiresAt = new Date(now.getTime() + CALL_TIMEOUT_SECONDS * 1000)

            const invitation = {
                chatId,
                callerId,
                callerName,
                callerPhoto: callerPhoto || null,
                calleeId,
                callType,
                roomName,
                status: 'pending',
                createdAt: serverTimestamp(),
                expiresAt: Timestamp.fromDate(expiresAt)
            }

            const docRef = await addDoc(collection(db, 'callInvitations'), invitation)

            return {
                success: true,
                invitationId: docRef.id
            }
        } catch (error: any) {
            console.error('Error creating call invitation:', error)
            return {
                success: false,
                error: error.message || 'Failed to create call invitation'
            }
        }
    }

    /**
     * Subscribe to incoming calls for a user
     */
    static subscribeToIncomingCalls(
        userId: string,
        onCallReceived: (invitation: CallInvitation) => void,
        onCallUpdated: (invitation: CallInvitation) => void
    ): () => void {
        const q = query(
            collection(db, 'callInvitations'),
            where('calleeId', '==', userId),
            where('status', '==', 'pending')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                const data = change.doc.data()
                const invitation: CallInvitation = {
                    id: change.doc.id,
                    ...data
                } as CallInvitation

                // Check if expired
                if (invitation.expiresAt.toMillis() < Date.now()) {
                    // Auto-expire
                    JitsiCallService.updateCallStatus(invitation.id, 'expired')
                    return
                }

                if (change.type === 'added') {
                    onCallReceived(invitation)
                } else if (change.type === 'modified') {
                    onCallUpdated(invitation)
                }
            })
        })

        return unsubscribe
    }

    /**
     * Subscribe to outgoing call status updates
     */
    static subscribeToOutgoingCall(
        invitationId: string,
        onStatusUpdate: (status: CallInvitation['status']) => void
    ): () => void {
        const docRef = doc(db, 'callInvitations', invitationId)

        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data() as CallInvitation
                onStatusUpdate(data.status)
            }
        })

        return unsubscribe
    }

    /**
     * Accept a call invitation
     */
    static async acceptCall(invitationId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const docRef = doc(db, 'callInvitations', invitationId)
            await updateDoc(docRef, {
                status: 'accepted'
            })
            return { success: true }
        } catch (error: any) {
            console.error('Error accepting call:', error)
            return {
                success: false,
                error: error.message || 'Failed to accept call'
            }
        }
    }

    /**
     * Reject a call invitation
     */
    static async rejectCall(invitationId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const docRef = doc(db, 'callInvitations', invitationId)
            await updateDoc(docRef, {
                status: 'rejected'
            })
            return { success: true }
        } catch (error: any) {
            console.error('Error rejecting call:', error)
            return {
                success: false,
                error: error.message || 'Failed to reject call'
            }
        }
    }

    /**
     * Cancel a call invitation (by caller)
     */
    static async cancelCall(invitationId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const docRef = doc(db, 'callInvitations', invitationId)
            await updateDoc(docRef, {
                status: 'cancelled'
            })
            return { success: true }
        } catch (error: any) {
            console.error('Error cancelling call:', error)
            return {
                success: false,
                error: error.message || 'Failed to cancel call'
            }
        }
    }

    /**
     * Update call status
     */
    static async updateCallStatus(
        invitationId: string,
        status: CallInvitation['status']
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const docRef = doc(db, 'callInvitations', invitationId)
            await updateDoc(docRef, { status })
            return { success: true }
        } catch (error: any) {
            console.error('Error updating call status:', error)
            return {
                success: false,
                error: error.message || 'Failed to update call status'
            }
        }
    }

    /**
     * Delete a call invitation
     */
    static async deleteCallInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const docRef = doc(db, 'callInvitations', invitationId)
            await deleteDoc(docRef)
            return { success: true }
        } catch (error: any) {
            console.error('Error deleting call invitation:', error)
            return {
                success: false,
                error: error.message || 'Failed to delete call invitation'
            }
        }
    }

    /**
     * Cleanup expired call invitations
     */
    static async cleanupExpiredCalls(): Promise<void> {
        try {
            const now = Timestamp.now()
            const q = query(
                collection(db, 'callInvitations'),
                where('expiresAt', '<', now)
            )

            const snapshot = await getDocs(q)
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
            await Promise.all(deletePromises)

            console.log(`Cleaned up ${snapshot.docs.length} expired call invitations`)
        } catch (error) {
            console.error('Error cleaning up expired calls:', error)
        }
    }
}
