import type { Middleware } from "oak";
import type { Role } from "./user.ts";

export function protect(role?: Role): Middleware {
  return function protectMiddleware(ctx, next) {
    const { user } = ctx.state;
    const notExpectedRole = role && role != user?.role;
    return (!user || notExpectedRole)
      ? ctx.response.redirect("/login")
      : next();
  };
}
