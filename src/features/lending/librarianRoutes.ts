import { Context, Request } from "oak";

import { getPaginationData } from "src/pagination.ts";
import { router } from "src/router.ts";
import { setupRenderer } from "src/templatingEngine.ts";

import { Lending, searchUsers } from "src/features/lending/lending.ts";

import { protect } from "src/features/auth/mod.ts";

const render = setupRenderer(import.meta.url);

router.post("/lend", protect("librarian"), async (ctx) => {
  const params = await parseLendingPayload(ctx.request);
  if (!params.userId) return handleUserSelection(ctx, params);
  const books = await Lending.getExpired(params.userId);
  if (books.length) {
    const templateData = { status: "error", books };
    return render("./lend.eta", { ctx, status: 400 }, templateData);
  }
  try {
    await Lending.lendTo(params.bookId, params.userId);
  } catch (_) {
    return render("./lend.eta", { ctx, status: 400 }, { status: "error" });
  }
  return render("./lend.eta", { ctx, status: 201 }, { status: "success" });
});

router.post("/checkin", protect("librarian"), async (ctx) => {
  const params = await parseLendingPayload(ctx.request);
  if (!params.userId) return handleUserSelection(ctx, params);
  try {
    await Lending.checkInFrom(params.bookId, params.userId);
  } catch (_) {
    return render("./checkin.eta", { ctx, status: 400 }, { status: "error" });
  }
  return render("./checkin.eta", { ctx, status: 201 }, { status: "success" });
});

type Parsed = ReturnType<typeof parseLendingPayload> extends Promise<infer U>
  ? U
  : never;

async function handleUserSelection(ctx: Context, params: Parsed) {
  const [total, users] = await searchUsers(params);
  const { from: _f, limit: _l, role: _r, ...payload } = params;
  const pagination = getPaginationData({
    type: "post",
    from: params.from,
    limit: params.limit,
    total,
    payload: { ...payload },
  });
  return render("./selectUser.eta", { ctx }, { params, users, pagination });
}

async function parseLendingPayload(request: Request) {
  const body = request.body();
  const params: URLSearchParams = await body.value;
  const result = {
    bookId: parseInt(params.get("book") ?? "", 10) || 0,
    userId: parseInt(params.get("user") ?? "", 10) || 0,
    login: (params.get("login") ?? "").trim(),
    lastname: (params.get("lastname") ?? "").trim(),
    role: "reader",
    from: parseInt(params.get("from") ?? "", 10) || 0,
    limit: 20,
  };
  return result;
}
