import { Database, SQLite3Connector } from "denodb";
import { existsSync } from "fs";

const dbFile = "./database.sqlite";
if (!existsSync(dbFile)) {
  Deno.createSync(dbFile);
}
const DB_PATH = Deno.realPathSync(dbFile);

const connector = new SQLite3Connector({
  filepath: DB_PATH,
});

export const db = new Database(connector);
