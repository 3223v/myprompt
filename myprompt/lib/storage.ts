import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export type StoredFile = { url: string; key: string; provider: "self-hosted" };
export class StorageValidationError extends Error {}

const MIME_EXTENSIONS: Record<string,string> = {
  "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "image/avif": ".avif",
  "video/mp4": ".mp4", "video/webm": ".webm", "video/quicktime": ".mov",
};
const EXTENSION_MIME: Record<string,string> = Object.fromEntries(Object.entries(MIME_EXTENSIONS).map(([mime,ext])=>[ext,mime]));

function storageRoot() {
  return path.join(process.cwd(), "storage", "uploads");
}

function safeDiskPath(key: string) {
  const normalized = key.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.split("/").some(part=>part===".."||part===".")) throw new StorageValidationError("非法文件路径");
  const root = storageRoot();
  const target = path.resolve(root, ...normalized.split("/"));
  if (!target.startsWith(`${root}${path.sep}`)) throw new StorageValidationError("非法文件路径");
  return target;
}

export async function uploadImage(file: File): Promise<StoredFile> {
  const extension = MIME_EXTENSIONS[file.type];
  if (!extension) throw new StorageValidationError("仅支持 JPG、PNG、WebP、GIF、AVIF、MP4、WebM 或 MOV 文件");
  const buffer = Buffer.from(await file.arrayBuffer());
  const signatures: Record<string,(bytes:Buffer)=>boolean> = {
    "image/jpeg": bytes=>bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff,
    "image/png": bytes=>bytes.subarray(0,8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])),
    "image/gif": bytes=>bytes.subarray(0,4).toString("ascii")==="GIF8",
    "image/webp": bytes=>bytes.subarray(0,4).toString("ascii")==="RIFF"&&bytes.subarray(8,12).toString("ascii")==="WEBP",
    "image/avif": bytes=>bytes.subarray(4,12).toString("ascii").includes("ftypavif"),
    "video/mp4": bytes=>bytes.subarray(4,12).toString("ascii").includes("ftyp"),
    "video/quicktime": bytes=>bytes.subarray(4,12).toString("ascii").includes("ftyp"),
    "video/webm": bytes=>bytes.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3])),
  };
  if (!signatures[file.type]?.(buffer)) throw new StorageValidationError("图片内容与文件格式不匹配");
  const date = new Date();
  const key = `${date.getFullYear()}/${String(date.getMonth()+1).padStart(2,"0")}/${randomUUID()}${extension}`;
  const diskPath = safeDiskPath(key);
  await mkdir(path.dirname(diskPath), { recursive: true });
  await writeFile(diskPath, buffer);
  return { key, provider: "self-hosted", url: `/api/files/${key}` };
}

export async function readStoredFile(key: string) {
  const diskPath = safeDiskPath(key);
  return { buffer: await readFile(diskPath), contentType: EXTENSION_MIME[path.extname(diskPath).toLowerCase()] || "application/octet-stream" };
}

export function storageKeyFromUrl(url: string) {
  const prefix = "/api/files/";
  return url.startsWith(prefix) ? decodeURIComponent(url.slice(prefix.length)) : null;
}

export async function deleteStoredFile(key: string) {
  try { await unlink(safeDiskPath(key)); } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

export async function deleteStoredUrls(urls: string[]) {
  await Promise.allSettled(urls.map(storageKeyFromUrl).filter((key): key is string=>Boolean(key)).map(deleteStoredFile));
}
