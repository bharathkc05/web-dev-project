import multer from 'multer';

import { ApiError } from '../utils/ApiError.js';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file?.mimetype?.startsWith('image/')) {
    return cb(null, true);
  }

  return cb(ApiError.badRequest('Only image uploads are allowed', [{
    field: 'image',
    message: 'File must be an image',
  }]));
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter,
});

const singleImageUpload = upload.single('image');

export default singleImageUpload;
export { upload, singleImageUpload };
