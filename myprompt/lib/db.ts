import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "myprompt.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    migrate(db);
  }
  return db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workspace TEXT NOT NULL DEFAULT 'text-to-image',
      project_name TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      version INTEGER NOT NULL DEFAULT 1,
      iteration INTEGER NOT NULL DEFAULT 1,
      input_images TEXT NOT NULL DEFAULT '[]',
      output_images TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      UNIQUE(workspace, project_name, version, iteration)
    );
  `);

  const columns = db.prepare("PRAGMA table_info(prompts)").all() as Array<{ name: string }>;
  const names = new Set(columns.map(column=>column.name));
  if (!names.has("workspace") || !names.has("input_images")) {
    const outputExpression = names.has("output_images") ? "output_images" : "'[]'";
    db.exec(`
      ALTER TABLE prompts RENAME TO prompts_legacy;
      CREATE TABLE prompts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace TEXT NOT NULL DEFAULT 'text-to-image',
        project_name TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        version INTEGER NOT NULL DEFAULT 1,
        iteration INTEGER NOT NULL DEFAULT 1,
        input_images TEXT NOT NULL DEFAULT '[]',
        output_images TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        UNIQUE(workspace, project_name, version, iteration)
      );
      INSERT INTO prompts (id, workspace, project_name, content, version, iteration, input_images, output_images, created_at, updated_at)
      SELECT id, 'text-to-image', project_name, content, version, iteration, '[]', ${outputExpression}, created_at, updated_at FROM prompts_legacy;
      DROP TABLE prompts_legacy;
    `);
  }
  db.exec(`INSERT OR IGNORE INTO projects (name) SELECT DISTINCT project_name FROM prompts WHERE trim(project_name) <> ''`);
}
