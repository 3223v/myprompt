import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { parsePromptRow, serializeImages } from "@/lib/types";
import { deleteStoredUrls } from "@/lib/storage";

// GET /api/prompts/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  const row = db.prepare("SELECT * FROM prompts WHERE id = ?").get(id);
  if (!row) {
    return NextResponse.json({ error: "未找到" }, { status: 404 });
  }
  return NextResponse.json({ data: parsePromptRow(row as Record<string, unknown>) });
}

// PUT /api/prompts/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  const body = await req.json();
  const { workspace, project_name, content, version, iteration, input_images, output_images } = body;

  const existing = db.prepare("SELECT * FROM prompts WHERE id = ?").get(id);
  if (!existing) {
    return NextResponse.json({ error: "未找到" }, { status: 404 });
  }

  try {
    const existingPrompt = parsePromptRow(existing as Record<string, unknown>);
    const nextImages = output_images === undefined ? existingPrompt.output_images : (Array.isArray(output_images) ? output_images.filter((item): item is string=>typeof item === "string") : []);
    db.prepare(
      `UPDATE prompts
       SET workspace = ?, project_name = ?, content = ?, version = ?, iteration = ?, input_images = ?, output_images = ?,
           updated_at = datetime('now', 'localtime')
       WHERE id = ?`
    ).run(
      workspace ?? (existing as Record<string, unknown>).workspace,
      project_name ?? (existing as Record<string, unknown>).project_name,
      content ?? (existing as Record<string, unknown>).content,
      version ?? (existing as Record<string, unknown>).version,
      iteration ?? (existing as Record<string, unknown>).iteration,
      input_images === undefined ? (existing as Record<string, unknown>).input_images : serializeImages(input_images),
      serializeImages(nextImages),
      id
    );

    const row = db.prepare("SELECT * FROM prompts WHERE id = ?").get(id);
    const nextInputs = input_images === undefined ? existingPrompt.input_images : (Array.isArray(input_images) ? input_images.filter((item):item is string=>typeof item==="string") : []);
    await deleteStoredUrls([...existingPrompt.output_images.filter(url=>!nextImages.includes(url)),...existingPrompt.input_images.filter(url=>!nextInputs.includes(url))]);
    return NextResponse.json({ data: parsePromptRow(row as Record<string, unknown>) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 409 });
  }
}

// DELETE /api/prompts/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  const existing = db.prepare("SELECT * FROM prompts WHERE id = ?").get(id);
  if (!existing) {
    return NextResponse.json({ error: "未找到" }, { status: 404 });
  }
  const prompt = parsePromptRow(existing as Record<string, unknown>);
  db.prepare("DELETE FROM prompts WHERE id = ?").run(id);
  await deleteStoredUrls([...prompt.input_images,...prompt.output_images]);
  return NextResponse.json({ success: true });
}
