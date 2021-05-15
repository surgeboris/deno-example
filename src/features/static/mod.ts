import { send } from "oak";
import type { Middleware } from "oak";

export const staticMiddleware: Middleware = async (ctx, next) => {
  const routeRegExp = /^\/static\/(.+)/;
  const match = ctx.request.url.pathname.match(routeRegExp);
  if (match == null) return next();
  const filepath = match[1];
  if (isFileMissing(filepath)) return next();
  await send(ctx, filepath, { root: Deno.realPathSync("./static") });
};

function isFileMissing(filename: string) {
  try {
    Deno.statSync(Deno.realPathSync(`./static/${filename}`));
    return false;
  } catch (_) {
    return true;
  }
}
