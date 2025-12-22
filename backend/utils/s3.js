import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const BUCKET_REGION = process.env.AWS_REGION || 'us-east-1';

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - File name with path
 * @param {string} contentType - MIME type (e.g., 'image/jpeg', 'application/epub+zip')
 * @returns {Promise<string>} S3 URL of the uploaded file
 */
export async function uploadToS3(fileBuffer, fileName, contentType) {
  try {
    if (!BUCKET_NAME) {
      throw new Error('AWS_S3_BUCKET_NAME is not configured');
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
      // Make files publicly readable
      ACL: 'public-read', // Files are publicly accessible
    });

    await s3Client.send(command);

    // Return the S3 URL
    const url = `https://${BUCKET_NAME}.s3.${BUCKET_REGION}.amazonaws.com/${fileName}`;
    return url;
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
}

/**
 * Delete a file from S3
 * @param {string} fileName - File name with path
 * @returns {Promise<void>}
 */
export async function deleteFromS3(fileName) {
  try {
    if (!BUCKET_NAME) {
      throw new Error('AWS_S3_BUCKET_NAME is not configured');
    }

    // Extract key from URL if full URL is provided
    let key = fileName;
    if (fileName.includes('amazonaws.com/')) {
      key = fileName.split('amazonaws.com/')[1];
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('S3 Delete Error:', error);
    throw new Error(`Failed to delete file from S3: ${error.message}`);
  }
}

/**
 * Generate a presigned URL for temporary access to a private file
 * @param {string} fileName - File name with path
 * @param {number} expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns {Promise<string>} Presigned URL
 */
export async function getPresignedUrl(fileName, expiresIn = 3600) {
  try {
    if (!BUCKET_NAME) {
      throw new Error('AWS_S3_BUCKET_NAME is not configured');
    }

    // Extract key from URL if full URL is provided
    let key = fileName;
    if (fileName.includes('amazonaws.com/')) {
      key = fileName.split('amazonaws.com/')[1];
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('S3 Presigned URL Error:', error);
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }
}

/**
 * Generate a unique file name for S3 upload with user-based folder structure
 * 
 * IMPORTANT: Files are organized by the authenticated user's ID (userId), not by book author name.
 * This ensures:
 * - All books uploaded by the same author/user go in the same folder
 * - When an author uploads multiple books, they all go in: users/{user-id}/books/
 * - Easy to fetch all files for a specific user/author
 * - No conflicts with author name variations (e.g., "J.K. Rowling" vs "JK Rowling")
 * 
 * Folder Structure Example:
 *   users/
 *     └── {user-id}/          (e.g., 550e8400-e29b-41d4-a716-446655440000)
 *         ├── books/          (all EPUB files for this author)
 *         │   ├── book1.epub
 *         │   ├── book2.epub
 *         │   └── book3.epub
 *         └── covers/         (all cover images for this author)
 *             ├── cover1.jpg
 *             ├── cover2.jpg
 *             └── cover3.jpg
 * 
 * @param {string} originalName - Original file name
 * @param {string} userId - User ID (UUID) of the authenticated user uploading the book
 * @param {string} fileType - Type of file: 'book' or 'cover'
 * @returns {string} Unique file name with path: users/{user-id}/{books|covers}/{filename}
 */
export function generateS3FileName(originalName, userId, fileType = 'book') {
  if (!originalName || !userId) {
    throw new Error('Original name and user ID are required');
  }

  // Validate userId is a valid UUID format (basic check)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    throw new Error(`Invalid user ID format: ${userId}. Expected UUID format.`);
  }

  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const sanitizedName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .toLowerCase();
  const baseName = sanitizedName.replace(`.${extension}`, '');
  
  // Determine subfolder based on file type
  const subFolder = fileType === 'cover' ? 'covers' : 'books';
  
  // Structure: users/{user-id}/{books|covers}/{filename}
  // All books uploaded by the same user/author will go in the same user folder
  const filePath = `users/${userId}/${subFolder}/${baseName}_${timestamp}_${randomString}.${extension}`;
  
  return filePath;
}

/**
 * Validate file type
 * @param {string} mimeType - MIME type
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean}
 */
export function isValidFileType(mimeType, allowedTypes) {
  return allowedTypes.includes(mimeType);
}

/**
 * Validate file size
 * @param {number} fileSize - File size in bytes
 * @param {number} maxSize - Maximum size in bytes
 * @returns {boolean}
 */
export function isValidFileSize(fileSize, maxSize) {
  return fileSize <= maxSize;
}

