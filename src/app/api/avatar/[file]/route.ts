import path from "node:path";
import { readFile } from "node:fs/promises";
import { UPLOAD_DIR, contentTypeForFile } from "@/lib/uploads";

export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;

  // hindre path traversal – kun rent filnavn tillates
  if (!/^[A-Za-z0-9._-]+$/.test(file)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const buf = await readFile(path.join(UPLOAD_DIR, file));
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": contentTypeForFile(file),
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
