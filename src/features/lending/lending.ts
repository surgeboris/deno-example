import { DataTypes, Model, Relationships } from "denodb";

import { queryRaw } from "src/db.ts";

import { User } from "src/features/auth/user.ts";
import { Book } from "src/features/books/models.ts";

export class Lending extends Model {
  static table = "lendings";
  static timestamps = true;
  static fields = {
    id: { autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
  };
  static getExpired(userId: number) {
    const query = [
      `SELECT * FROM ${Lending.table} LEFT JOIN ${Book.table}`,
      `ON ${Book.field("id")} = ${Lending.field("book_id")}`,
      `WHERE ${Lending.field("user_id")} = :userId`,
      `AND ${Lending.field("created_at")} <= date('now', '-1 month')`,
    ].join(" ");
    return queryRaw(query, { userId });
  }
  static async getLended(userId: number, limit: number, from: number) {
    const total = await Lending.where({ userId }).count();
    // deno-lint-ignore no-explicit-any
    const books: any[] = await Lending.where({ userId })
      .select(
        Lending.field("created_at"),
        Book.field("title"),
        Book.field("isbn"),
      )
      .join(Book, Book.field("id"), Lending.field("book_id"))
      .orderBy(Lending.field("created_at"), "asc")
      .limit(limit)
      .offset(from)
      .get();
    books.forEach((b) => {
      const expireDate = new Date(b.createdAt);
      expireDate.setMonth(expireDate.getMonth() + 1);
      b.expires = expireDate.toISOString().slice(0, 10);
      b.isExpired = new Date() >= expireDate;
    });
    return [total, books] as const;
  }
  static async lendTo(bookId: number, userId: number) {
    // deno-lint-ignore no-explicit-any
    const book: any = await Book.find(bookId);
    if (!book || !book.quantity) throw new Error();
    book.quantity -= 1;
    await book.update();
    await Lending.create({ bookId, userId });
  }
  static async checkInFrom(bookId: number, userId: number) {
    // deno-lint-ignore no-explicit-any
    const lending: any = await Lending.where({ bookId, userId }).first();
    // deno-lint-ignore no-explicit-any
    const book: any = await Book.find(bookId);
    if (!lending || !book) throw new Error();
    book.quantity += 1;
    await book.update();
    await lending.delete();
  }
}

export function searchUsers(...args: Parameters<typeof User["search"]>) {
  return User.search(...args);
}

Relationships.belongsTo(Lending, Book);
Relationships.belongsTo(Lending, User);
