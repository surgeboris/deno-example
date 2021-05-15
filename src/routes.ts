import { composeMiddleware } from "oak";

import { router } from "src/router.ts";

import "src/features/home/mod.ts";
import "src/features/books/mod.ts";
import { authMiddleware } from "src/features/auth/mod.ts";
import { staticMiddleware } from "src/features/static/mod.ts";
import { notFoundMiddleware } from "src/features/notFound/mod.ts";

export const routes = composeMiddleware([
  staticMiddleware,
  authMiddleware,
  router.routes(),
  router.allowedMethods(),
  notFoundMiddleware,
]);
