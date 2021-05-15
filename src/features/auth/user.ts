import { compare as bcryptCompare, hash as bcryptHash } from "bcrypt";
import { DataTypes, Model } from "denodb";

import { queryRaw } from "src/db.ts";

const roles = ["librarian" as const, "reader" as const];

export type Role = (typeof roles)[0];

export class User extends Model {
  static table = "users";
  static timestamps = true;
  static fields = {
    id: { autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
    login: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.enum(roles),
    passport: DataTypes.STRING,
    address: DataTypes.STRING,
    phonenumber: DataTypes.STRING,
    lastname: DataTypes.STRING,
    firstname: DataTypes.STRING,
    middlename: DataTypes.STRING,
  };
  login!: string;
  password!: string;
  role!: Role;
  passport!: string;
  address!: string;
  phonenumber!: string;
  lastname!: string;
  firstname!: string;
  middlename!: string;
  static async createIfPossible(user: UserDataRequired) {
    const hasDuplicate = await User.where({ login: user.login }).count();
    const hasInvalidFields = !user.login || !user.password || !user.role;
    if (hasInvalidFields || hasDuplicate) throw new Error();
    const hashedPassword = await this.hash(user.password);
    await User.create({ ...user, password: hashedPassword });
  }
  static hash(plaintextPassword: string) {
    return bcryptHash(plaintextPassword);
  }
  static async search(params: UserSearchParams) {
    const values: Partial<UserSearchParams> = {};
    (["login", "lastname"] as const).forEach((k) => {
      if (params[k]) values[k] = `%${params[k]}%`;
    });
    if (params.from) values.from = params.from;
    if (params.role) values.role = params.role;
    values.limit = params.limit ?? 20;
    let query = `FROM ${User.table}`;
    const whereClauses: string[] = [];
    if (params.role) whereClauses.push(`role = :role`);
    if (params.login) whereClauses.push(`login LIKE :login`);
    if (params.lastname) whereClauses.push(`lastname LIKE :lastname`);
    const where = whereClauses.join(" AND ");
    if (where) query += ` WHERE ${where}`;
    const totalQuery = `SELECT COUNT(*) as c ${query}`;
    const { from: _f, limit: _l, ...totalValues } = values;
    const total: number = (await queryRaw(totalQuery, { ...totalValues }))[0].c;
    query += ` ORDER BY ${User.table}.created_at DESC`;
    query += ` LIMIT :limit`;
    if (params.from) query += ` OFFSET :from`;
    const users = await queryRaw(
      `SELECT id, login, firstname, middlename, lastname, address ${query}`,
      values,
    );
    return [total, users] as const;
  }
  hasPassword(plaintextPassword: string) {
    return bcryptCompare(plaintextPassword, this.password);
  }
}

interface UserDataRequired {
  login: string;
  password: string;
  role: Role;
  passport: string;
  address: string;
  phonenumber: string;
  lastname: string;
  firstname: string;
  middlename: string;
}

interface UserSearchParams {
  role: string;
  login: string;
  lastname: string;
  from: number;
  limit: number;
}
