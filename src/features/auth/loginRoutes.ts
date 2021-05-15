import type { Request } from "oak";

import { User } from "./user.ts";

import { router } from "src/router.ts";
import { setupRenderer } from "src/templatingEngine.ts";

const render = setupRenderer(import.meta.url);

router.get("/login", (ctx) => {
  render("./login.eta", { ctx }, { error: false });
});

router.post("/login", async (ctx) => {
  const { login, password, redirectUri } = await parseLoginPayload(ctx.request);
  if (login && password) {
    // deno-lint-ignore no-explicit-any
    const user: User = await User.where({ login }).first() as any;
    const isPasswordValid = await user?.hasPassword(password);
    if (user && isPasswordValid) {
      ctx.state.session.set("user", { id: user.id, login, role: user.role });
      return ctx.response.redirect(redirectUri);
    }
  }
  render("./login.eta", { ctx, status: 400 }, { error: true });
});

router.get("/logout", async (ctx) => {
  await ctx.state.session.set("user", undefined);
  ctx.response.redirect("/");
});

async function parseLoginPayload(request: Request) {
  const redirectUri = request.url.searchParams.get("redirect") ?? "/";
  const body = request.body();
  const params = await body.value;
  const login = params.get("login");
  const password = params.get("password");
  return { login, password, redirectUri };
}
