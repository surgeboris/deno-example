import { db, sessionStore } from "src/db.ts";

const models = [];

import { User } from "src/features/auth/user.ts";
models.push(User);

import { Author, Book, Genre, Publisher } from "src/features/books/models.ts";
models.push(Author, Book, Genre, Publisher);

import { Lending } from "src/features/lending/lending.ts";
models.push(Lending);

db.link(models);
db.sync();

export { sessionStore };
