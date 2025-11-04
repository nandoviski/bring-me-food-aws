import { Request, Response } from "express";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { createS3Client } from "../lib/s3Client";

const s3 = createS3Client();
const bucket = process.env.S3_BUCKET as string;
const tmpPrefix = process.env.TMP_PREFIX || "uploads/tmp";
const expiresIn = Number(process.env.PRESIGN_EXPIRES || "60");

export async function presignUpload(req: Request, res: Response) {
  console.log(req.body);

  const { contentType, userId } = req.body as { contentType?: string; userId?: string };
  if (!contentType) return res.status(400).json({ message: "contentType required" });
  if (!userId) return res.status(400).json({ message: "userId required" });

  if (!bucket) {
    console.error("S3_BUCKET environment variable is not set");
    return res.status(500).json({ message: "Server misconfigured: S3_BUCKET not set" });
  }

  const key = `${tmpPrefix}/${userId}/${Date.now()}-${randomUUID()}`;
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });

  try {
    const signedUrl = await getSignedUrl(s3, cmd, { expiresIn });
    const publicUrl = process.env.S3_PUBLIC_URL
      ? `${process.env.S3_PUBLIC_URL}/${key}`
      : `https://${bucket}.s3.amazonaws.com/${key}`;
    return res.json({ url: signedUrl, key, publicUrl });
  } catch (err) {
    console.error("Failed to create presigned URL", err);
    return res.status(500).json({ message: "Failed to create presigned URL", error: String(err) });
  }
}

export async function deleteUpload(req: Request, res: Response) {
  const { key } = req.body as { key?: string };
  if (!key) return res.status(400).json({ message: "key required" });

  if (!bucket) {
    console.error("S3_BUCKET environment variable is not set");
    return res.status(500).json({ message: "Server misconfigured: S3_BUCKET not set" });
  }

  try {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    return res.json({ ok: true });
  } catch (err) {
    console.error("Failed to delete object", err);
    return res.status(500).json({ message: "Failed to delete object", error: String(err) });
  }
}
