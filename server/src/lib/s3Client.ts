import { S3Client } from "@aws-sdk/client-s3";
import { CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

export function createS3Client() {
  const endpoint = process.env.S3_ENDPOINT || undefined;
  const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";

  return new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    endpoint,
    forcePathStyle,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY || "",
      secretAccessKey: process.env.S3_SECRET_KEY || "",
    },
  });
}

export async function ensureBucketExists(s3: S3Client, bucket: string): Promise<void> {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    console.log(`[S3] Bucket "${bucket}" already exists.`);
  } catch (err: any) {
    const code = err?.name || err?.Code;
    if (code === "NotFound" || code === "NoSuchBucket" || err?.$metadata?.httpStatusCode === 404) {
      await s3.send(new CreateBucketCommand({ Bucket: bucket }));
      console.log(`[S3] Bucket "${bucket}" created.`);
    } else {
      console.error("[S3] Could not verify/create bucket:", err?.message || err);
    }
  }
}
