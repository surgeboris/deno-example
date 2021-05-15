import { configure, renderFile } from "eta";
import type { Context } from "oak";
import { fromFileUrl, join } from "path";

configure({ views: Deno.realPathSync("./views") });

interface RenderBodyOptions {
  ctx: Context;
  config?: Parameters<typeof configure>[0];
  contentType?: string;
  status?: number;
}

export function setupRenderer(baseFileUrl: string | URL) {
  const basePath = join(fromFileUrl(baseFileUrl), "..");
  return function render(
    filename: string,
    { ctx, config, contentType, status }: RenderBodyOptions,
    data: Record<string, unknown> = {},
  ) {
    let path = join(basePath, filename);
    path = Deno.realPathSync(path);
    const { url } = ctx.request;
    const { user } = ctx.state;
    ctx.response.status = status ?? 200;
    ctx.response.headers.set("Content-Type", contentType ?? "text/html");
    ctx.response.body = () => {
      const p = renderFile(path, { ...data, url, user }, config);
      if (p) p.catch(console.error);
      return p;
    };
  };
}
