import { Request } from "oak";

import { router } from "src/router.ts";
import { setupRenderer } from "src/templatingEngine.ts";

import { protect } from "src/features/auth/mod.ts";

import { Author, Book, Genre, Publisher } from "./models.ts";

const render = setupRenderer(import.meta.url);

router.get("/bookadd", protect("librarian"), (ctx) => {
  render("./add.eta", { ctx });
});

class ParseError extends Error {
  parsed: Partial<Parsed>;
  constructor(result: Partial<Parsed>) {
    super();
    this.parsed = result;
  }
}

router.post("/bookadd", protect("librarian"), async (ctx) => {
  let values: Partial<Parsed> = {};
  try {
    const parsed = await parseAddBookPayload(ctx.request);
    values = parsed;
    await save(parsed);
  } catch (e) {
    if (e instanceof ParseError) values = e.parsed;
    return render("./add.eta", { ctx, status: 400 }, {
      result: "error",
      values,
    });
  }
  render("./add.eta", { ctx, status: 201 }, { result: "success" });
});

type Parsed = ReturnType<typeof parseAddBookPayload> extends Promise<infer U>
  ? U
  : never;

async function save(p: Parsed) {
  const [authorId, genreId, publisherId] = await Promise.all([
    getAuthorModelId(p),
    getGenreModelId(p),
    getPublisherModelId(p),
  ]);
  Book.create({
    title: p.title,
    isbn: p.isbn,
    year: p.year,
    quantity: p.quantity,
    pages: p.pages,
    authorId: authorId,
    genreId: genreId,
    publisherId: publisherId,
    // deno-lint-ignore no-explicit-any
  } as any);
}

async function parseAddBookPayload(request: Request) {
  const body = request.body();
  const params: URLSearchParams = await body.value;
  const result = {
    title: params.get("title")?.trim() ?? "",
    isbn: params.get("isbn")?.trim() ?? "",
    year: parseInt(params.get("year") ?? "", 10),
    quantity: parseInt(params.get("pages") ?? "", 10),
    pages: parseInt(params.get("quantity") ?? "", 10),
    lastname: params.get("lastname")?.trim() ?? "",
    firstname: params.get("firstname")?.trim() ?? "",
    middlename: params.get("middlename")?.trim() ?? "",
    genre: params.get("genre")?.trim().toLowerCase() ?? "",
    publisher: params.get("publisher")?.trim() ?? "",
    address: params.get("address")?.trim() ?? "",
  };
  const notValuesPresent = Object.values(result).some((v) => !v && v != 0);
  const notValidPayload = notValuesPresent || result.quantity < 0;
  if (notValidPayload) throw new ParseError(result);
  return result;
}

type AuthorFields = Pick<Parsed, "firstname" | "lastname" | "middlename">;
async function getAuthorModelId(
  { firstname, lastname, middlename }: AuthorFields,
) {
  const fields = { firstname, lastname, middlename };
  const result = await Author.where(fields).all();
  if (result.length) return result[0].id;
  const { id, lastInsertId } = await Author.create(fields);
  return id ?? lastInsertId;
}

type GenreFields = Pick<Parsed, "genre">;
async function getGenreModelId({ genre }: GenreFields) {
  const result = await Genre.where({ title: genre }).all();
  if (result.length) return result[0].id;
  const { id, lastInsertId } = await Genre.create({ title: genre });
  return id ?? lastInsertId;
}

type PublisherFields = Pick<Parsed, "publisher" | "address">;
async function getPublisherModelId({ publisher, address }: PublisherFields) {
  const result = await Publisher.where({ title: publisher, address }).all();
  if (result.length) return result[0].id;
  const values = { title: publisher, address };
  const { id, lastInsertId } = await Publisher.create(values);
  return id ?? lastInsertId;
}
