import { DataTypes, Model, Relationships } from "denodb";

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
