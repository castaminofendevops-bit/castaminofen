import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBase: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET || 'castaminofen-media';
    this.publicBase = process.env.S3_PUBLIC_URL || 'http://localhost:9000/castaminofen-media';
    this.client = new S3Client({
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      region: process.env.S3_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
      },
      forcePathStyle: true,
    });
  }

  buildMediaKey(creatorId: string, fileName: string) {
    const safeName = fileName.replace(/[^\w.\-()\u0600-\u06FF]/g, '_');
    return `public/uploads/${creatorId}/${Date.now()}-${safeName}`;
  }

  mediaUrlForKey(mediaKey: string) {
    return `${this.publicBase}/${mediaKey}`;
  }

  async uploadObject(mediaKey: string, body: Buffer, contentType: string) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: mediaKey,
        Body: body,
        ContentType: contentType,
      }),
    );
    return { mediaKey, mediaUrl: this.mediaUrlForKey(mediaKey) };
  }

  async createUploadUrl(creatorId: string, fileName: string, contentType: string) {
    const mediaKey = this.buildMediaKey(creatorId, fileName);
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: mediaKey,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 900 });

    return { uploadUrl, mediaUrl: this.mediaUrlForKey(mediaKey), mediaKey };
  }
}
