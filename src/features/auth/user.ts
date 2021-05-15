import { DataTypes, Model } from "denodb";

const roles = ["librarian" as const, "reader" as const];

export type Role = (typeof roles)[0];

export class User extends Model {
  static table = "users";
  static timestamps = true;
  static fields = {
    id: { primaryKey: true, type: DataTypes.INTEGER },
    login: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.enum(roles),
  };
  login!: string;
  password!: string;
  role!: Role;
}
