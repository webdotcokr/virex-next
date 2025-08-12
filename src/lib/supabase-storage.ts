import { supabase } from './supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
}

export interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
}

/**
 * Upload a file to Supabase Storage
 * @param file - File to upload
 * @param bucket - Storage bucket name (default: 'downloads')
 * @param folder - Folder path (default: 'files')
 * @returns Upload result with URL or error
 */
export async function uploadFile(
  file: File, 
  bucket: string = 'downloads',
  folder: string = 'files'
): Promise<UploadResult> {
  try {
    // Generate unique filename with timestamp
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `${folder}/${fileName}`;

    console.log('📤 Uploading file:', { fileName, filePath, size: file.size });

    // Upload file to Supabase Storage
    console.log('🔗 Supabase connection test:', {
      url: supabase.supabaseUrl,
      key: supabase.supabaseKey?.substring(0, 20) + '...'
    });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // Don't overwrite existing files
      });

    console.log('📊 Raw upload response:', { uploadData, uploadError });

    if (uploadError) {
      console.error('❌ Upload error details:', {
        message: uploadError.message,
        statusCode: uploadError.statusCode,
        error: uploadError.error,
        details: uploadError
      });
      return {
        success: false,
        error: uploadError.message,
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log('✅ Upload successful:', { publicUrl, fileName });

    return {
      success: true,
      url: publicUrl,
      fileName,
    };
  } catch (error) {
    console.error('❌ Upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * List files in a storage bucket
 * @param bucket - Storage bucket name
 * @param folder - Folder path (optional)
 * @returns Array of storage files
 */
export async function listFiles(
  bucket: string = 'downloads',
  folder?: string
): Promise<StorageFile[]> {
  try {
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('❌ List files error:', error);
      return [];
    }

    return files || [];
  } catch (error) {
    console.error('❌ List files failed:', error);
    return [];
  }
}

/**
 * Delete a file from storage
 * @param bucket - Storage bucket name
 * @param filePath - Full path to file
 * @returns Success boolean
 */
export async function deleteFile(
  bucket: string = 'downloads',
  filePath: string
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('❌ Delete file error:', error);
      return false;
    }

    console.log('✅ File deleted:', filePath);
    return true;
  } catch (error) {
    console.error('❌ Delete file failed:', error);
    return false;
  }
}

/**
 * Get public URL for a file
 * @param bucket - Storage bucket name
 * @param filePath - Full path to file
 * @returns Public URL
 */
export function getPublicUrl(
  bucket: string = 'downloads',
  filePath: string
): string {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
  
  return publicUrl;
}

/**
 * Validate file before upload
 * @param file - File to validate
 * @param options - Validation options
 * @returns Validation result
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = [] } = options; // Default 10MB

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(maxSize / 1024 / 1024).toFixed(2)}MB)`,
    };
  }

  // Check file type
  if (allowedTypes.length > 0) {
    const fileType = file.type;
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    const isValidType = allowedTypes.some(type => {
      if (type.startsWith('.')) {
        // Extension check
        return fileExt === type.substring(1);
      } else {
        // MIME type check
        return fileType === type || fileType.startsWith(type + '/');
      }
    });

    if (!isValidType) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Get file icon based on file type
 * @param fileName - Name of the file
 * @returns Icon name or emoji
 */
export function getFileIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'pdf':
      return '📄';
    case 'doc':
    case 'docx':
      return '📝';
    case 'xls':
    case 'xlsx':
      return '📊';
    case 'ppt':
    case 'pptx':
      return '📽️';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
      return '🖼️';
    case 'mp4':
    case 'avi':
    case 'mov':
      return '🎥';
    case 'mp3':
    case 'wav':
      return '🎵';
    case 'zip':
    case 'rar':
    case '7z':
      return '📦';
    default:
      return '📁';
  }
}

/**
 * Format file size for display
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}