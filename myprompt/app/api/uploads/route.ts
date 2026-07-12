import { NextRequest, NextResponse } from "next/server";
import { StorageValidationError, uploadImage } from "@/lib/storage";

export const runtime = "nodejs";
const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const VIDEO_MAX_BYTES = 100 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "请选择图片" }, { status: 400 });
    const maxBytes=file.type.startsWith("video/")?VIDEO_MAX_BYTES:IMAGE_MAX_BYTES;
    if (file.size > maxBytes) return NextResponse.json({ error: file.type.startsWith("video/")?"视频不能超过 100MB":"图片不能超过 10MB" }, { status: 413 });
    const stored = await uploadImage(file);
    return NextResponse.json({ data: stored }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "上传失败" }, { status: error instanceof StorageValidationError ? 400 : 500 });
  }
}
