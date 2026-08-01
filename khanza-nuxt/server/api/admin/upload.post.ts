import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event);
    
    if (!formData || formData.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No file uploaded' });
    }

    const file = formData.find((field) => field.name === 'file');
    
    if (!file || !file.data) {
      throw createError({ statusCode: 400, statusMessage: 'File not found in form data' });
    }
    
    const base64Data = Buffer.from(file.data).toString('base64');
    const mimeType = file.type || 'image/jpeg';
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: 'khanza_services',
    });
    
    return { url: uploadResult.secure_url };
  } catch (error: any) {
    console.error('Cloudinary Upload Error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to upload file to Cloudinary',
    });
  }
});
