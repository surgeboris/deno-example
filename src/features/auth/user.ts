import { compare as bcryptCompare, hash as bcryptHash } from "bcrypt";
import { DataTypes, Model } from "denodb";

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
