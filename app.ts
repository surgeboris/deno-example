import { Application } from "oak";

import { state } from "src/appState.ts";
import { routes } from "src/routes.ts";

const app = new Application({ state });
app.use(routes);
app.listen("0.0.0.0:3000");

app.addEventListener("error", (e) => console.error(e.message));

console.log("Started at 0.0.0.0:3000");
