import { DataTypes, Model, Relationships } from "denodb";

import { queryRaw } from "src/db.ts";

export class Book extends Model {
  static table = "books";
  static timestamps = true;
  static fields = {
    id: { autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
    quantity: DataTypes.INTEGER,
    year: DataTypes.INTEGER,
    isbn: DataTypes.STRING,
    title: DataTypes.STRING,
    pages: DataTypes.INTEGER,
  };
  id!: number;
  title!: string;
  isbn!: string;
  year!: number;
  quantity!: number;
  pages!: number;
  static joinAuthor() {
    return this.join(Author, Author.field("id"), Book.field("author_id"));
  }
  static joinGenre() {
    return this.join(Genre, Genre.field("id"), Book.field("genre_id"));
  }
  static joinPublisher() {
    return this.join(
      Publisher,
      Publisher.field("id"),
      Book.field("publisher_id"),
    );
  }
  static search(params: BookSearchParams) {
    const values: Partial<BookSearchParams> = {};
    (["title", "isbn", "lastname", "genre"] as const).forEach((k) => {
      if (params[k]) values[k] = `%${params[k]}%`;
    });
    if (params.from) values.from = params.from;
    values.limit = params.limit ?? 20;
    const titleField = Book.field("title");
    const genreField = Genre.field("title");
    let query = [
      `SELECT ${titleField}, quantity, firstname, middlename,`,
      `lastname, ${genreField} AS genre`,
      `FROM ${Book.table} LEFT JOIN ${Author.table}`,
      `ON ${Book.table}.author_id = ${Author.field("id")}`,
      `LEFT JOIN ${Genre.table}`,
      `ON ${Book.table}.genre_id = ${Genre.field("id")}`,
    ].join(" ");
    const whereClauses: string[] = [];
    if (params.title) whereClauses.push(`${titleField} LIKE :title`);
    if (params.isbn) whereClauses.push(`${Book.field("isbn")} LIKE :isbn`);
    if (params.lastname) {
      whereClauses.push(`${Author.field("lastname")} LIKE :lastname`);
    }
    if (params.genre) whereClauses.push(`${genreField} LIKE :genre`);
    const where = whereClauses.join(" AND ");
    if (where) query += ` WHERE ${where}`;
    query += ` ORDER BY ${Book.table}.created_at DESC`;
    query += ` LIMIT :limit`;
    if (params.from) query += ` OFFSET :from`;
    return queryRaw(query, values);
  }
}

interface BookSearchParams {
  title: string;
  isbn: string;
  lastname: string;
  genre: string;
  from: number;
  limit: number;
}

export class Author extends Model {
  static table = "authors";
  static timestamps = true;
  static fields = {
    id: { autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
    firstname: DataTypes.STRING,
    middlename: DataTypes.STRING,
    lastname: DataTypes.STRING,
  };
  id!: number;
  firstname!: string;
  middlename!: string;
  lastname!: string;
  static books() {
    return this.hasMany(Book);
  }
}

Relationships.belongsTo(Book, Author);

export class Genre extends Model {
  static table = "genres";
  static timestamps = true;
  static fields = {
    id: { autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
    title: DataTypes.STRING,
  };
  id!: number;
  title!: string;
  static books() {
    return this.hasMany(Book);
  }
}

Relationships.belongsTo(Book, Genre);

export class Publisher extends Model {
  static table = "publishers";
  static timestamps = true;
  static fields = {
    id: { autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
    title: DataTypes.STRING,
    address: DataTypes.STRING,
  };
  id!: number;
  title!: string;
  address!: string;
  static books() {
    return this.hasMany(Book);
  }
}

Relationships.belongsTo(Book, Publisher);
