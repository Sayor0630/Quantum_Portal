import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

// Configure Cloudinary with environment variables
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn(
    'Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not fully set. Image uploads will likely fail.'
  );
} else {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true, // Optional: Ensures HTTPS URLs are generated
  });
  console.log('Cloudinary configured successfully.'); // This will log at server start if variables are set
}

export const uploadToCloudinary = async (
  fileBuffer: Buffer, // Changed from filePath to Buffer for more flexibility with API routes
  folder: string,
  fileName?: string // Optional: specify a public_id (filename)
): Promise<UploadApiResponse | UploadApiErrorResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: fileName, // Cloudinary will generate a unique one if not provided
        resource_type: 'auto', // Automatically detect resource type (image, video, raw)
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          // Should not happen if error is also not present
          reject(new Error('Cloudinary upload resulted in no error and no result.'));
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// Export the configured cloudinary instance as well if needed elsewhere for other functionalities
// For example, for more advanced operations like deleting images, transformations, etc.
export default cloudinary;
