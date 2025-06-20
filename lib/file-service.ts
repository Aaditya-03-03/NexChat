import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { createShortLink } from './utils';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;

export interface UploadResult {
  success: boolean;
  url?: string;
  shortUrl?: string;
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
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/zip',
      'application/x-zip-compressed',
      'application/vnd.rar',
      'application/x-rar-compressed',
      'application/octet-stream',
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

  // Upload image with Cloudinary
  static async uploadImage(file: File, chatId: string, signal?: AbortSignal): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Optionally, you can append chatId if you want to use it in the API
      // formData.append('chatId', chatId);
      const res = await fetch('/api/cloudinary-test', {
        method: 'POST',
        body: formData,
        signal,
      });
      const data = await res.json();
      if (data.success && data.url) {
        const shortUrl = createShortLink(data.url, file.name);
        return { success: true, url: data.url, shortUrl };
      } else {
        return { success: false, error: data.error || 'Cloudinary upload failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Upload document with Cloudinary
  static async uploadDocument(file: File, chatId: string, signal?: AbortSignal): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/cloudinary-test', {
        method: 'POST',
        body: formData,
        signal,
      });
      const data = await res.json();
      if (data.success && data.url) {
        const shortUrl = createShortLink(data.url, file.name);
        return { success: true, url: data.url, shortUrl };
      } else {
        return { success: false, error: data.error || 'Cloudinary upload failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Upload voice note/audio with Cloudinary
  static async uploadVoiceNote(file: File, chatId: string, signal?: AbortSignal): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/cloudinary-test', {
        method: 'POST',
        body: formData,
        signal,
      });
      const data = await res.json();
      if (data.success && data.url) {
        const shortUrl = createShortLink(data.url, file.name);
        return { success: true, url: data.url, shortUrl };
      } else {
        return { success: false, error: data.error || 'Cloudinary upload failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Upload video with Cloudinary
  static async uploadVideo(file: File, chatId: string, signal?: AbortSignal): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/cloudinary-test', {
        method: 'POST',
        body: formData,
        signal,
      });
      const data = await res.json();
      if (data.success && data.url) {
        const shortUrl = createShortLink(data.url, file.name);
        return { success: true, url: data.url, shortUrl };
      } else {
        return { success: false, error: data.error || 'Cloudinary upload failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Upload profile picture with Cloudinary
  static async uploadProfilePicture(file: File, userId: string): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/cloudinary-test', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        const shortUrl = createShortLink(data.url, file.name);
        return { success: true, url: data.url, shortUrl };
      } else {
        return { success: false, error: data.error || 'Cloudinary upload failed' };
      }
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