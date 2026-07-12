import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req:NextRequest) {
  const workspace=new URL(req.url).searchParams.get("workspace");
  const rows = workspace
    ? getDb().prepare(`SELECT projects.*, COUNT(prompts.id) AS prompt_count FROM projects LEFT JOIN prompts ON prompts.project_name = projects.name AND prompts.workspace = ? GROUP BY projects.id ORDER BY projects.updated_at DESC, projects.name`).all(workspace)
    : getDb().prepare(`SELECT projects.*, COUNT(prompts.id) AS prompt_count FROM projects LEFT JOIN prompts ON prompts.project_name = projects.name GROUP BY projects.id ORDER BY projects.updated_at DESC, projects.name`).all();
  return NextResponse.json({ data: rows });
}

export async function POST(req: NextRequest) {
  const name = String((await req.json()).name || "").trim();
  if (!name) return NextResponse.json({ error: "项目名称不能为空" }, { status: 400 });
  try {
    const db = getDb();
    const result = db.prepare("INSERT INTO projects (name) VALUES (?)").run(name);
    return NextResponse.json({ data: db.prepare("SELECT *, 0 AS prompt_count FROM projects WHERE id = ?").get(result.lastInsertRowid) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("UNIQUE") ? "项目名称已存在" : "项目创建失败";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
