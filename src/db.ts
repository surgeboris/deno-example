import { Database, SQLite3Connector } from "denodb";
import { existsSync } from "fs";
import { DB } from "sqlite";

const dbFile = "./database.sqlite";
if (!existsSync(dbFile)) {
  Deno.createSync(dbFile);
}
const DB_PATH = Deno.realPathSync(dbFile);

const connector = new SQLite3Connector({
  filepath: DB_PATH,
});

export const db = new Database(connector);

const rawDb = new DB(DB_PATH);

// deno-lint-ignore require-await - made async to ease potential migration to other db
export async function queryRaw(...args: Parameters<DB["query"]>) {
  return [...rawDb.query(...args).asObjects()];
}
