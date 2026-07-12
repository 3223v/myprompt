import { NextRequest, NextResponse } from "next/server";
import { deleteStoredFile, readStoredFile } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ key: string[] }> }) {
  try {
    const { key } = await params;
    const file = await readStoredFile(key.join("/"));
    return new NextResponse(new Uint8Array(file.buffer), { headers: { "Content-Type": file.contentType, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return NextResponse.json({ error: "文件不存在" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ key: string[] }> }) {
  try {
    const { key } = await params;
    await deleteStoredFile(key.join("/"));
    return NextResponse.json({ success:true });
  } catch {
    return NextResponse.json({ error:"文件删除失败" }, { status:400 });
  }
}
