import { db } from "../mongodb.ts";

// Defining schema interface
type UserSchema = {
  _id: { $oid: string };
  username: string;
  password: string;
};

export const users = db.collection<UserSchema>("users");
