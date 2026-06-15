import path from "node:path";
import { mkdir } from "node:fs/promises";

// Avatarfiler lagres utenfor public, og serveres via /api/avatar/[file].
// I Docker peker UPLOAD_DIR på et montert volum så bildene overlever restart.
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB

export async function ensureUploadDir() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

export function contentTypeForFile(file: string): string {
  const ext = file.split(".").pop()?.toLowerCase() ?? "";
  return CONTENT_TYPE_BY_EXT[ext] ?? "application/octet-stream";
}
