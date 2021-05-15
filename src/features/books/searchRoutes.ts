import { Request } from "oak";

import { router } from "src/router.ts";
import { setupRenderer } from "src/templatingEngine.ts";

import { Book } from "./models.ts";

const render = setupRenderer(import.meta.url);

router.get("/books", async (ctx) => {
  const params = parseSearchBookPayload(ctx.request);
  const books = await Book.search(params);
  return render("./search.eta", { ctx }, { books, params, formatAuthorName });
});

function parseSearchBookPayload(request: Request) {
  const params = request.url.searchParams;
  const result = {
    title: params.get("title")?.trim() ?? "",
    isbn: params.get("isbn")?.trim() ?? "",
    lastname: params.get("lastname")?.trim() ?? "",
    limit: 20,
    genre: params.get("genre")?.trim().toLowerCase() ?? "",
    from: parseInt(params.get("from") ?? "", 10) || 0,
  };
  result.from = Math.max(result.from, 0);
  return result;
}

function formatAuthorName(authorName: {
  firstname: string;
  middlename: string;
  lastname: string;
}) {
  const { firstname, middlename, lastname } = authorName;
  let formatted = lastname;
  if (firstname) {
    formatted += ` ${firstname[0].toUpperCase()}.`;
  }
  if (middlename) {
    formatted += ` ${middlename[0].toUpperCase()}.`;
  }
  return formatted;
}
