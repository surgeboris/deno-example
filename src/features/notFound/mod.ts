import type { Middleware } from "oak";

import { setupRenderer } from "src/templatingEngine.ts";

const render = setupRenderer(import.meta.url);

export const notFoundMiddleware: Middleware = (ctx) => {
  render("./notFound.eta", { ctx, status: 404 });
};
