import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class FileService {
  // Check if file is an image
  static isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  // Check if file is a document
  static isDocument(file: File): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip',
      'application/x-zip-compressed'
    ];
    return documentTypes.includes(file.type);
  }

  // Check if file is audio/voice note
  static isAudio(file: File): boolean {
    return file.type.startsWith('audio/');
  }

  // Check if file is video
  static isVideo(file: File): boolean {
    return file.type.startsWith('video/');
  }

  // Upload image with quality preservation
  static async uploadImage(file: File, chatId: string, signal?: AbortSignal): Promise<UploadResult> {
    try {
      const timestamp = Date.now();
      const fileName = `images/${chatId}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      // Upload without compression to preserve quality
      await uploadBytes(storageRef, file);
      
      // Check if upload was cancelled
      if (signal?.aborted) {
        throw new Error('Upload cancelled');
      }
      
      const downloadURL = await getDownloadURL(storageRef);
      
      return { success: true, url: downloadURL };
    } catch (error: any) {
      if (error.message === 'Upload cancelled') {
        throw error;
      }
      return { success: false, error: error.message };
    }
  }

  // Upload document
  static async uploadDocument(file: File, chatId: string, signal?: AbortSignal): Promise<UploadResult> {
    try {
      const timestamp = Date.now();
      const fileName = `documents/${chatId}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      
      // Check if upload was cancelled
      if (signal?.aborted) {
        throw new Error('Upload cancelled');
      }
      
      const downloadURL = await getDownloadURL(storageRef);
      
      return { success: true, url: downloadURL };
    } catch (error: any) {
      if (error.message === 'Upload cancelled') {
        throw error;
      }
      return { success: false, error: error.message };
    }
  }

  // Upload voice note/audio
  static async uploadVoiceNote(file: File, chatId: string, signal?: AbortSignal): Promise<UploadResult> {
    try {
      const timestamp = Date.now();
      const fileName = `voice-notes/${chatId}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      
      // Check if upload was cancelled
      if (signal?.aborted) {
        throw new Error('Upload cancelled');
      }
      
      const downloadURL = await getDownloadURL(storageRef);
      
      return { success: true, url: downloadURL };
    } catch (error: any) {
      if (error.message === 'Upload cancelled') {
        throw error;
      }
      return { success: false, error: error.message };
    }
  }

  // Upload video
  static async uploadVideo(file: File, chatId: string, signal?: AbortSignal): Promise<UploadResult> {
    try {
      const timestamp = Date.now();
      const fileName = `videos/${chatId}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      
      // Check if upload was cancelled
      if (signal?.aborted) {
        throw new Error('Upload cancelled');
      }
      
      const downloadURL = await getDownloadURL(storageRef);
      
      return { success: true, url: downloadURL };
    } catch (error: any) {
      if (error.message === 'Upload cancelled') {
        throw error;
      }
      return { success: false, error: error.message };
    }
  }

  // Upload any file type
  static async uploadFile(file: File, chatId: string, signal?: AbortSignal): Promise<UploadResult> {
    try {
      const timestamp = Date.now();
      const fileName = `files/${chatId}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      
      // Check if upload was cancelled
      if (signal?.aborted) {
        throw new Error('Upload cancelled');
      }
      
      const downloadURL = await getDownloadURL(storageRef);
      
      return { success: true, url: downloadURL };
    } catch (error: any) {
      if (error.message === 'Upload cancelled') {
        throw error;
      }
      return { success: false, error: error.message };
    }
  }

  // Upload profile picture
  static async uploadProfilePicture(file: File, userId: string): Promise<UploadResult> {
    try {
      const timestamp = Date.now();
      const fileName = `profile-pictures/${userId}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      return { success: true, url: downloadURL };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get file size in readable format
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Validate file size (50MB limit for most files, 100MB for videos)
  static validateFileSize(file: File): { valid: boolean; error?: string } {
    const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File size must be less than ${this.formatFileSize(maxSize)}` 
      };
    }
    return { valid: true };
  }

  // Delete file
  static async deleteFile(url: string): Promise<UploadResult> {
    try {
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get file extension
  static getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }
} 