import cloudinary from "./cloudinary";
import { Readable } from 'stream';

// Uploads a file buffer to Cloudinary using a stream
const streamUpload = (buffer: Buffer, folder: string = 'orders', resource_type: 'image' | 'raw' | 'auto' = 'image', filename?: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const uploadOptions: any = {
            resource_type: resource_type,
            folder: folder
        };
        if (filename) {
            uploadOptions.public_id = filename;
            uploadOptions.use_filename = true;
            uploadOptions.unique_filename = false;
        }

        const stream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            });

        Readable.from(buffer).pipe(stream);
    });
};

export default streamUpload;