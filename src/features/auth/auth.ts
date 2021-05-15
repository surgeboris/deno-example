import type { Middleware } from "oak";

import { set } from "src/appState.ts";

import { User } from "./user.ts";

export const authMiddleware: Middleware = async (ctx, next) => {
  const shouldSuggestBootstrap = ctx.state.isBootstrapInProgress ?? true;
  if (shouldSuggestBootstrap) {
    const isRoot = ctx.request.url.pathname === "/";
    if (isRoot) {
      const hasUsers = await User.count();
      if (hasUsers) {
        set("isBootstrapInProgress", false);
      } else {
        set("isBootstrapInProgress", true);
        return ctx.response.redirect("/register");
      }
    }
  }
  const user = await ctx.state.session.get("user");
  ctx.state.user = user ?? null;
  return next();
};
