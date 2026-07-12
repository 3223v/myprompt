import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "myprompt.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
  }
  return db;
}
