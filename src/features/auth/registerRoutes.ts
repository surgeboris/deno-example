import type { Context, Request } from "oak";

import { router } from "src/router.ts";
import { setupRenderer } from "src/templatingEngine.ts";

import { User } from "./user.ts";

const render = setupRenderer(import.meta.url);

router.get("/register", (ctx) => {
  const isBootstrap = ctx.state.isBootstrapInProgress;
  if (notAuthorized(ctx, isBootstrap)) return ctx.response.redirect("/login");
  render("./register.eta", { ctx }, { isBootstrap });
});

router.post("/register", async (ctx) => {
  const isBootstrap = ctx.state.isBootstrapInProgress;
  if (notAuthorized(ctx, isBootstrap)) return ctx.response.redirect("/login");
  try {
    const user = await parseRegisterPayload(ctx.request);
    if (isBootstrap) user.role = "librarian";
    await User.createIfPossible(user);
  } catch (_) {
    const data = { isBootstrap, result: "error" };
    return render("./register.eta", { ctx, status: 400 }, data);
  }
  const data = { isBootstrap, result: "success" };
  render("./register.eta", { ctx, status: 201 }, data);
});

async function parseRegisterPayload(request: Request) {
  const body = request.body();
  const params = await body.value;
  const login = params.get("login");
  const password = params.get("password");
  const role = params.get("role");
  const passport = params.get("passport");
  const address = params.get("address");
  const phonenumber = params.get("phonenumber");
  const lastname = params.get("lastname");
  const firstname = params.get("firstname");
  const middlename = params.get("middlename");
  const result = {
    login,
    password,
    role,
    passport,
    address,
    phonenumber,
    lastname,
    firstname,
    middlename,
  };
  if (Object.values(result).some((v) => !v)) throw new Error();
  return result;
}

function notAuthorized(ctx: Context, isBootstrap: boolean) {
  if (isBootstrap) return;
  const { user } = ctx.state;
  const notLibrarian = !user || user.role !== "librarian";
  return notLibrarian;
}
