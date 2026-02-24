import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const bucketName = 'andresalmeida-portafolio.firebasestorage.app';

async function configureBucketCors() {
    const corsConfiguration = [
        {
            origin: ['*'],
            method: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS'],
            responseHeader: ['Content-Type', 'Authorization', 'Content-Length', 'User-Agent', 'x-goog-resumable'],
            maxAgeSeconds: 3600,
        },
    ];

    try {
        const [metadata] = await storage.bucket(bucketName).setCorsConfiguration(corsConfiguration);
        console.log(`Bucket ${bucketName} fue actualizado con éxito.`);
        console.log(`CORS config: ${JSON.stringify(metadata.cors, null, 2)}`);
    } catch (error) {
        console.error('Error configurando CORS:', error);
    }
}

configureBucketCors();
