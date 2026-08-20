import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { del, get, head, put } from "@vercel/blob";

import { getServerEnvironment } from "@/lib/env/server";

const storageRoot = path.join(process.cwd(), ".private-storage", "learning");
let s3Client: S3Client | undefined;

function getS3Configuration() {
  const environment = getServerEnvironment();
  const required = {
    region: environment.S3_REGION,
    bucket: environment.S3_BUCKET,
    accessKeyId: environment.S3_ACCESS_KEY_ID,
    secretAccessKey: environment.S3_SECRET_ACCESS_KEY,
  };
  if (Object.values(required).some((value) => !value))
    throw new Error("Private S3 storage credentials are incomplete.");
  s3Client ??= new S3Client({
    region: required.region,
    endpoint: environment.S3_ENDPOINT,
    forcePathStyle: Boolean(environment.S3_ENDPOINT),
    credentials: {
      accessKeyId: required.accessKeyId!,
      secretAccessKey: required.secretAccessKey!,
    },
  });
  return { client: s3Client, bucket: required.bucket! };
}

export const allowedMaterialMimeTypes = new Set([
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
]);

export function validateMaterialUpload(file: Pick<File, "size" | "type">) {
  if (!file.size) return "The selected file is empty.";
  if (!allowedMaterialMimeTypes.has(file.type))
    return "This file type is not allowed.";
  const limit = file.type.startsWith("video/") ? 250_000_000 : 20_000_000;
  if (file.size > limit)
    return file.type.startsWith("video/")
      ? "Videos must be 250 MB or smaller."
      : "Documents and images must be 20 MB or smaller.";
  return null;
}

export async function storePrivateMaterial(file: File) {
  const extension = path
    .extname(file.name)
    .toLowerCase()
    .replace(/[^.a-z0-9]/g, "");
  const storageKey = `${randomUUID()}${extension}`;
  if (getServerEnvironment().STORAGE_PROVIDER === "blob") {
    const pathname = `learning/${storageKey}`;
    await put(pathname, file, {
      access: "public",
      contentType: file.type,
      cacheControlMaxAge: 60,
      multipart: file.size > 5_000_000,
    });
    return pathname;
  }
  if (getServerEnvironment().STORAGE_PROVIDER === "s3") {
    const { client, bucket } = getS3Configuration();
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: `learning/${storageKey}`,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
        CacheControl: "private, no-store",
      }),
    );
    return storageKey;
  }
  await mkdir(storageRoot, { recursive: true });
  await writeFile(
    path.join(storageRoot, storageKey),
    Buffer.from(await file.arrayBuffer()),
    { flag: "wx" },
  );
  return storageKey;
}

export async function readPrivateMaterial(storageKey: string) {
  const provider = getServerEnvironment().STORAGE_PROVIDER;
  const validKey =
    provider === "blob"
      ? /^learning\/[a-f0-9-]+(?:\.[a-z0-9]+)?$/i.test(storageKey)
      : /^[a-f0-9-]+(?:\.[a-z0-9]+)?$/i.test(storageKey);
  if (!validKey) throw new Error("Invalid private storage key.");
  if (provider === "blob") {
    const result = await get(storageKey, { access: "public" });
    if (!result || result.statusCode !== 200 || !result.stream)
      throw new Error("Private Blob object is empty.");
    const data = Buffer.from(await new Response(result.stream).arrayBuffer());
    return { data, size: result.blob.size };
  }
  if (provider === "s3") {
    const { client, bucket } = getS3Configuration();
    const result = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: `learning/${storageKey}` }),
    );
    if (!result.Body) throw new Error("Private object is empty.");
    const data = Buffer.from(await result.Body.transformToByteArray());
    return { data, size: data.length };
  }
  const filePath = path.join(storageRoot, storageKey);
  const [data, metadata] = await Promise.all([
    readFile(filePath),
    stat(filePath),
  ]);
  return { data, size: metadata.size };
}

export async function removePrivateMaterial(storageKey: string) {
  if (getServerEnvironment().STORAGE_PROVIDER === "blob") {
    await del(storageKey).catch(() => undefined);
    return;
  }
  if (getServerEnvironment().STORAGE_PROVIDER === "s3") {
    const { client, bucket } = getS3Configuration();
    await client
      .send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: `learning/${storageKey}`,
        }),
      )
      .catch(() => undefined);
    return;
  }
  await unlink(path.join(storageRoot, storageKey)).catch(() => undefined);
}

export async function inspectPrivateBlob(storageKey: string) {
  if (!/^learning\/[a-f0-9-]+(?:\.[a-z0-9]+)?$/i.test(storageKey))
    throw new Error("Invalid private Blob key.");
  const metadata = await head(storageKey);
  return { size: metadata.size, type: metadata.contentType };
}
