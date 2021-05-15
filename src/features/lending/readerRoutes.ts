import { Request } from "oak";

import { getPaginationData } from "src/pagination.ts";
import { router } from "src/router.ts";
import { setupRenderer } from "src/templatingEngine.ts";

import { Lending } from "src/features/lending/lending.ts";

import { protect } from "src/features/auth/mod.ts";

const render = setupRenderer(import.meta.url);

router.get("/lended", protect("reader"), async (ctx) => {
  const params = parseLendedPayload(ctx.request);
  const [total, books] = await Lending.getLended(
    ctx.state.user?.id,
    params.limit,
    params.from,
  );
  const pagination = getPaginationData({
    type: "get",
    from: params.from,
    limit: params.limit,
    total,
    url: ctx.request.url,
  });
  return render("./lended.eta", { ctx }, { books, pagination });
});

function parseLendedPayload(request: Request) {
  const params = request.url.searchParams;
  const result = {
    limit: 20,
    from: parseInt(params.get("from") ?? "", 10) || 0,
  };
  result.from = Math.max(result.from, 0);
  return result;
}
