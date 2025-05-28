import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: 'YOUR_CLOUD_NAME',
  api_key: 'YOUR_API_KEY',
  api_secret: 'YOUR_API_SECRET',
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'recipe_app',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

export { cloudinary, storage };
