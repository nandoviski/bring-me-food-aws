import { CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createS3Client } from "./s3Client";

const s3 = createS3Client();
const bucket = process.env.S3_BUCKET as string;
const finalPrefix = process.env.FINAL_PREFIX || "uploads/final";

export async function promoteTmpToFinal(tmpKey: string, finalKey?: string) {
  const final = finalKey ?? `${finalPrefix}/${tmpKey.split("/").slice(-1)[0]}`;
  await s3.send(
    new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${tmpKey}`,
      Key: final,
      ACL: "public-read",
    }),
  );
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: tmpKey }));
  return {
    key: final,
    url: process.env.S3_PUBLIC_URL
      ? `${process.env.S3_PUBLIC_URL}/${final}`
      : `https://${bucket}.s3.amazonaws.com/${final}`,
  };
}

export async function deleteObject(key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
