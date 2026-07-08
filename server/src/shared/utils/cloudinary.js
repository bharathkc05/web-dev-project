// server/src/shared/utils/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import config from '../../config/env.js';
import logger from './logger.js';

// Configure Cloudinary explicitly (parse from URL)
if (config.CLOUDINARY_URL) {
  const parsedUrl = new URL(config.CLOUDINARY_URL);
  cloudinary.config({
    cloud_name: parsedUrl.hostname,
    api_key: parsedUrl.username,
    api_secret: parsedUrl.password,
  });
}

/**
 * Uploads a Buffer (or Multer file object containing a buffer) to Cloudinary.
 * @param {Buffer|Object} fileOrBuffer - Buffer or Multer file object.
 * @param {string} folder - Destination folder on Cloudinary.
 * @returns {Promise<Object>} - Promise resolving to secure_url and public_id.
 */
export const uploadImage = (fileOrBuffer, folder = 'products') => {
  return new Promise((resolve, reject) => {
    const buffer = Buffer.isBuffer(fileOrBuffer) ? fileOrBuffer : fileOrBuffer?.buffer;
    
    if (!buffer) {
      return reject(new Error('Invalid image file: No buffer found'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload stream failed', { error: error.message || error });
          return reject(error);
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Deletes an image from Cloudinary using its publicId.
 * @param {string} publicId - Cloudinary asset public ID.
 * @returns {Promise<Object>} - Cloudinary destruction result.
 */
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`Cloudinary image deleted: publicId=${publicId}`);
    return result;
  } catch (error) {
    logger.error('Cloudinary image deletion failed', { publicId, error: error.message });
    throw error;
  }
};

export default {
  uploadImage,
  deleteImage,
};
