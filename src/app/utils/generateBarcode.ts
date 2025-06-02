import AppError from '../errors/AppError';

import bwipjs from 'bwip-js';
import { cloudinaryConfig } from './cloudinary';

async function generateAndUploadBarcode(product_id: string) {
  try {
    // Generate barcode as a PNG buffer
    const pngBuffer = await bwipjs.toBuffer({
      bcid: 'code128', // Barcode type
      text: product_id.toString(), // Text to encode
      scale: 3, // Barcode scale factor
      includetext: true, // Include human-readable text below the barcode
      textxalign: 'center', // Horizontal text alignment
    });

    // Upload the barcode image to Cloudinary
    return new Promise((resolve, reject) => {
      cloudinaryConfig.uploader
        .upload_stream(
          {
            folder: '/softypy/barcodes',
            public_id: `barcode_${product_id}_${Date.now()}`,
            resource_type: 'image',
            format: 'png',
            height: 306,
            width: 441,
            crop: 'fit',
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        )
        .end(pngBuffer);
    });
  } catch (error) {


    throw new AppError(500, 'Error generating barcode');
  }
}

export default generateAndUploadBarcode;
