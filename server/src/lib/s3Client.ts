import { S3Client } from "@aws-sdk/client-s3";

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
