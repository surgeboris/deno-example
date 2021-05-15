import { Application } from "oak";
import { OakSession } from "sessions";

import { state } from "src/appState.ts";
import { sessionStore } from "src/dbSetup.ts";
import { routes } from "src/routes.ts";

const app = new Application({ state });
new OakSession(app, sessionStore);
app.use(routes);
app.listen("0.0.0.0:3000");

app.addEventListener("error", (e) => console.error(e.message));

console.log("Started at 0.0.0.0:3000");
