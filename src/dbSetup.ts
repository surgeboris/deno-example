import { db, sessionStore } from "src/db.ts";

const models = [];

import { User } from "src/features/auth/user.ts";
models.push(User);

db.link(models);
db.sync();

export { sessionStore };
