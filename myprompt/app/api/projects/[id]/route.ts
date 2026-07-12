import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { deleteStoredUrls } from "@/lib/storage";
import { parsePromptRow } from "@/lib/types";

function projectWithCount(id: string) {
  return getDb().prepare(`SELECT projects.*, COUNT(prompts.id) AS prompt_count FROM projects LEFT JOIN prompts ON prompts.project_name = projects.name WHERE projects.id = ? GROUP BY projects.id`).get(id);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id:string }> }) {
  const { id } = await params;
  const project = projectWithCount(id);
  return project ? NextResponse.json({ data: project }) : NextResponse.json({ error:"项目不存在" }, { status:404 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id:string }> }) {
  const { id } = await params;
  const name = String((await req.json()).name || "").trim();
  if (!name) return NextResponse.json({ error:"项目名称不能为空" }, { status:400 });
  const db = getDb();
  const existing = db.prepare("SELECT * FROM projects WHERE id = ?").get(id) as { name:string } | undefined;
  if (!existing) return NextResponse.json({ error:"项目不存在" }, { status:404 });
  try {
    db.transaction(() => {
      db.prepare("UPDATE projects SET name = ?, updated_at = datetime('now','localtime') WHERE id = ?").run(name,id);
      db.prepare("UPDATE prompts SET project_name = ?, updated_at = datetime('now','localtime') WHERE project_name = ?").run(name,existing.name);
    })();
    return NextResponse.json({ data: projectWithCount(id) });
  } catch (error) {
    return NextResponse.json({ error:error instanceof Error&&error.message.includes("UNIQUE")?"项目名称已存在":"项目更新失败" }, { status:409 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id:string }> }) {
  const { id } = await params;
  const db = getDb();
  const existing = db.prepare("SELECT * FROM projects WHERE id = ?").get(id) as { name:string } | undefined;
  if (!existing) return NextResponse.json({ error:"项目不存在" }, { status:404 });
  const prompts = (db.prepare("SELECT * FROM prompts WHERE project_name = ?").all(existing.name) as Record<string,unknown>[]).map(parsePromptRow);
  const cascade = new URL(req.url).searchParams.get("cascade") === "true";
  if (prompts.length && !cascade) return NextResponse.json({ error:"项目仍包含提示词", prompt_count:prompts.length }, { status:409 });
  db.transaction(() => {
    if (cascade) db.prepare("DELETE FROM prompts WHERE project_name = ?").run(existing.name);
    db.prepare("DELETE FROM projects WHERE id = ?").run(id);
  })();
  await deleteStoredUrls(prompts.flatMap(prompt=>[...prompt.input_images,...prompt.output_images]));
  return NextResponse.json({ success:true });
}
