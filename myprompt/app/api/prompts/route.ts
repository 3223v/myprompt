import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { parsePromptRow, serializeImages } from "@/lib/types";

// GET /api/prompts — 获取所有提示词，支持按 project_name 筛选
export async function GET(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const project = searchParams.get("project");
  const workspace = searchParams.get("workspace");

  const conditions:string[]=[]; const values:string[]=[];
  if(project){conditions.push("project_name = ?");values.push(project);}
  if(workspace){conditions.push("workspace = ?");values.push(workspace);}
  const where=conditions.length?`WHERE ${conditions.join(" AND ")}`:"";
  const rows=db.prepare(`SELECT * FROM prompts ${where} ORDER BY project_name, version, iteration`).all(...values);

  return NextResponse.json({ data: (rows as Record<string, unknown>[]).map(parsePromptRow) });
}

// POST /api/prompts — 创建新提示词
export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { workspace = "text-to-image", project_name, content, version, iteration, input_images, output_images } = body;

  if (!project_name) {
    return NextResponse.json(
      { error: "project_name 不能为空" },
      { status: 400 }
    );
  }

  // 自动分配版本号和迭代号
  const v = typeof version === "number" ? version : 1;
  const i = typeof iteration === "number" ? iteration : 1;

  try {
    db.prepare("INSERT OR IGNORE INTO projects (name) VALUES (?)").run(project_name);
    const result = db
      .prepare(
        `INSERT INTO prompts (workspace, project_name, content, version, iteration, input_images, output_images, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now','localtime'), datetime('now','localtime'))`
      )
      .run(workspace, project_name, content || "", v, i, serializeImages(input_images), serializeImages(output_images));

    const row = db
      .prepare("SELECT * FROM prompts WHERE id = ?")
      .get(result.lastInsertRowid);

    return NextResponse.json({ data: parsePromptRow(row as Record<string, unknown>) }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 409 });
  }
}
