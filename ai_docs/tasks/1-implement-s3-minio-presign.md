# 1 - Implement S3/MinIO presign flow (switchable via env)

Goal

Provide a presigned upload flow so clients can upload images directly to S3 in production, or to a local MinIO during development. The server will expose a small presign endpoint and configuration flags. The client `AddMealForm` will upload the file to the presigned URL before creating/updating the meal record in the API and store the returned public URL in the DB.

Why

- Keeps server load minimal (client uploads directly to storage).
- Matches production workflow during local development by pointing to MinIO.
- Easy to toggle between local and production using environment variables.
  // (eg. /api/meals with multipart form). The server receives file, uploads to S3, then writes DB.

# 1 - Implement S3/MinIO presign flow (Option A: temp uploads + promote on save)

Goal

Implement Option A: clients upload images to a temporary key (uploads/tmp/<userId>/...) using presigned URLs. When a meal is created or updated and the image is confirmed, the server promotes the temp object to a permanent key (uploads/final/...) and deletes the tmp object. This keeps client/server decoupled, prevents orphaned permanent objects, and allows automatic cleanup of leftover tmp objects via lifecycle or GC.

Summary of changes (high level)

- Server
  - `server/src/lib/s3Client.ts` — factory for S3Client (AWS or MinIO).
  - `server/src/controllers/uploadController.ts` — presign endpoint (returns signed PUT URL and tmp key) and delete endpoint for best-effort manual cancels.
  - `server/src/lib/s3Utils.ts` — helper functions: promoteTmpToFinal(tmpKey, finalKey), deleteObject(key), (optional) createBucketIfMissing.
  - Update meals controller (where create/update meal is implemented) to accept `imageKey` or `imageUrl` and, if it references a tmp key, call promoteTmpToFinal before saving record.
  - Mount `server/src/routes/uploadRoutes.ts` with `/api/upload`.
- Client
  - `client/src/features/meal/components/add-meal-form.tsx` — store selected File in state, call presign + PUT on submit (only if new image present), send resulting final public URL / key in the create/update mutation payload. Skip upload if editing and image unchanged.
  - Optionally add `client/src/lib/upload.ts` helper for upload logic.
- Dev environment
  - Use MinIO for local development with env toggles to switch to real AWS S3 in prod.

Environment variables (add to server `.env` or your env setup)

- S3_ENDPOINT=http://localhost:9000 # leave blank in production to use AWS
- S3_FORCE_PATH_STYLE=true # leave blank in production to use AWS
- S3_REGION=us-east-1
- S3_ACCESS_KEY=minioadmin
- S3_SECRET_KEY=minioadmin
- S3_BUCKET=mybucket
- S3_PUBLIC_URL=http://localhost:9000/mybucket
- TMP_PREFIX=uploads/tmp
- FINAL_PREFIX=uploads/final
- PRESIGN_EXPIRES=60

Why tmp + promote?

- If a user uploads a file but cancels, the file remains under tmp and can be removed by lifecycle/GC.
- Only confirmed files are moved to final, ensuring the final folder contains only used images and is easy to manage.

Server implementation details

1. s3Client factory

Create `server/src/lib/s3Client.ts`:

```ts
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
```

2. uploadController (presign + delete)

Create `server/src/controllers/uploadController.ts`:

```ts
import { Request, Response } from "express";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { createS3Client } from "../lib/s3Client";

const s3 = createS3Client();
const bucket = process.env.S3_BUCKET as string;
const tmpPrefix = process.env.TMP_PREFIX || "uploads/tmp";
const expiresIn = Number(process.env.PRESIGN_EXPIRES || "60");

export async function presignUpload(req: Request, res: Response) {
  const { contentType, userId } = req.body as { contentType?: string; userId?: string };
  if (!contentType) return res.status(400).json({ message: "contentType required" });
  if (!userId) return res.status(400).json({ message: "userId required" });

  const key = `${tmpPrefix}/${userId}/${Date.now()}-${randomUUID()}`;
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });

  try {
    const signedUrl = await getSignedUrl(s3, cmd, { expiresIn });
    const publicUrl = process.env.S3_PUBLIC_URL
      ? `${process.env.S3_PUBLIC_URL}/${key}`
      : `https://${bucket}.s3.amazonaws.com/${key}`;
    return res.json({ url: signedUrl, key, publicUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create presigned URL" });
  }
}

export async function deleteUpload(req: Request, res: Response) {
  const { key } = req.body as { key?: string };
  if (!key) return res.status(400).json({ message: "key required" });

  try {
    await s3.send({
      // typed as any for brevity
      Bucket: bucket,
      Key: key,
      //@ts-ignore
      // actual command: DeleteObjectCommand
    });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete object" });
  }
}
```

Note: the delete handler above is a placeholder — use DeleteObjectCommand from `@aws-sdk/client-s3`.

3. s3Utils (promote tmp -> final)

Create `server/src/lib/s3Utils.ts`:

```ts
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
```

4. Wire routes

`server/src/routes/uploadRoutes.ts`:

```ts
import express from "express";
import { presignUpload, deleteUpload } from "../controllers/uploadController";
const router = express.Router();
router.post("/presign", presignUpload);
router.post("/delete", deleteUpload);
export default router;
```

Mount in server entry file (`server/src/index.ts` or `server/src/app.ts`):

```ts
import uploadRoutes from "./routes/uploadRoutes";
app.use("/api/upload", uploadRoutes);
```

5. Update meals controller

Where the server accepts meal creation/updates (e.g. `server/src/controllers/mealController.ts`), change the flow so if the incoming payload contains an image `key` that is under the tmp prefix, call `promoteTmpToFinal(tmpKey)` and replace `image` with the returned final URL (or key) before saving meal to DB.

Example snippet inside create meal controller:

```ts
import { promoteTmpToFinal } from "../lib/s3Utils";

// inside your create handler
let imageUrl = payload.imageUrl; // or payload.imageKey
if (imageUrl && imageUrl.startsWith(process.env.S3_PUBLIC_URL ? process.env.S3_PUBLIC_URL + '/' + (process.env.TMP_PREFIX || 'uploads/tmp') : '')) {
  // convert publicUrl back to key or receive key from client instead
  const tmpKey = /* extract key from the provided publicUrl or accept key from client */;
  const { url, key } = await promoteTmpToFinal(tmpKey);
  imageUrl = url;
}
// save meal with imageUrl
```

Client implementation details

1. keep File object and original image

- Add `fileToUpload` state and `originalImage` from `initialData?.image`.
- When user changes file, set `fileToUpload` and preview via FileReader as you already do.

2. on submit — flow

- If `fileToUpload` exists:
  - POST `/api/upload/presign` with { contentType: file.type, userId } -> receive { url, key, publicUrl }
  - PUT file to `url` (include Content-Type)
  - Send `key` (preferred) or `publicUrl` in create/update meal mutation payload (server will promote if it's a tmp key).
- Else if editing and `initialData.image` === current image => skip upload and reuse original image URL/key.

3. minimal client helper (client/src/lib/upload.ts)

```ts
export async function getPresignedAndUpload(file: File, userId: string) {
  const resp = await fetch(`/api/upload/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, userId }),
  });
  if (!resp.ok) throw new Error("presign failed");
  const { url, key, publicUrl } = await resp.json();
  const put = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!put.ok) throw new Error("upload failed");
  return { key, publicUrl };
}
```

4. skip upload on edit when unchanged

- Compare `initialData.image` and the current image value. If equal, do not presign/upload.

Local dev (MinIO)

- Run MinIO with Docker (PowerShell):

```powershell
docker run -p 9000:9000 -p 9001:9001 `
  --name minio `
  -e MINIO_ROOT_USER=minioadmin `
  -e MINIO_ROOT_PASSWORD=minioadmin `
  -v ${env:USERPROFILE}\minio\data:/data `
  quay.io/minio/minio server /data --console-address ":9001"
```

- Create bucket `mybucket` in MinIO console (http://localhost:9001)
  - Access http://localhost:9001 in the browser.
  - Use `minioadmin` / `minioadmin` to log in.
  - If permission issues, set bucket policy to "public" or "download" for testing.
    (do this in Docker Desktop > tab Exec)
    - set alias: mc alias set myminio http://localhost:9000 minioadmin minioadmin
    - create bucket (if missing): mc mb myminio/mybucket
    - make objects downloadable (public): mc policy set download myminio/mybucket
    - verify: mc ls myminio/mybucket
- Set `S3_BUCKET=mybucket` and `S3_PUBLIC_URL=http://localhost:9000/mybucket` in server env

Promotion / cleanup strategy

- Promote tmp -> final on meal save (server does it).
- Configure an S3 lifecycle rule to remove objects under `uploads/tmp/` after a TTL (e.g., 1 day) to handle orphaned uploads.
- Optionally create a server cron job to list tmp objects and delete those older than TTL or not referenced.

Testing & verification

- Manual test:

  - Start MinIO and server.
  - Create a meal with an image: client should request presign, upload to tmp, then server should promote to final and DB should hold final URL.
  - Edit a meal and do not change the image: no upload occurs; server reuses existing final URL.
  - Upload and then cancel: tmp object remains until lifecycle rule or GC deletes it.

- Automated test:
  - Use LocalStack/MinIO in CI to run integration tests that presign/upload/promote.

Notes & simplifications removed

- Removed optional server-side multipart upload option from this task to keep scope focused on presign + promote.
- Kept delete endpoint as a best-effort helper but GC/lifecycle is primary cleanup.

Ready for review

This file now contains a focused implementation plan for Option A (temp uploads + promote on save). Tell me any naming preferences (bucket, prefixes, TTL), and I'll implement the server controllers/routes and patch the client `AddMealForm` to follow this flow.

// Drawbacks: larger server load, slower client experience.

```

Local dev steps

1. Add env vars to `server/.env.development` (or the server startup env):

```

UPLOAD_STRATEGY=presign
S3_ENDPOINT=http://localhost:9000
S3_FORCE_PATH_STYLE=true
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=mybucket
S3_PUBLIC_URL=http://localhost:9000/mybucket

````

2. Run MinIO (PowerShell):

```powershell
docker run -p 9000:9000 -p 9001:9001 `
  --name minio `
  -e MINIO_ROOT_USER=minioadmin `
  -e MINIO_ROOT_PASSWORD=minioadmin `
  -v ${env:USERPROFILE}\minio\data:/data `
  quay.io/minio/minio server /data --console-address ":9001"
````

3. Create the bucket `mybucket` via MinIO console (http://localhost:9001) or mc CLI.
4. Start server and client, test the form: pick a file, submit, verify MinIO bucket receives the uploaded object and DB stores `S3_PUBLIC_URL/<key>`.

Testing & verification

- Manual:
  - Submit a new meal with an image via the form. Confirm the object appears in MinIO and the meal record in DB contains the public URL.
  - Fetch the public URL in a browser and confirm the image loads.
- Automated:
  - Add an integration test that uses LocalStack or MinIO in CI, calls server presign, does PUT to presigned url, then calls create meal API.

Edge cases & notes

- CORS: ensure MinIO/CORS allows PUT from your client origin during presigned uploads.
- Caching and public access: MinIO may require different public URL construction depending on how path-style vs virtual-hosted style is configured.
- Security: don't return pre-signed URLs with overly long expiry in production.
- Cleanup: delete temp local files if you use server-side multipart upload.

When you review this and confirm, I will implement the presign route and the client edits.

If you'd like, I can also:

- add a small helper `client/src/lib/upload.ts` for the client upload logic
- add a script or server startup snippet that creates the MinIO bucket when in dev
- add sample `.env` files to `server/.env.example` and `client/.env.example`

---

End of task file.
