import { MongoClient } from "./deps.ts";

const client = new MongoClient();
client.connectWithUri(Deno.env.get('MONGO_URI') || 'mongodb://localhost:27017/models-api');

// Defining schema interface
interface UserSchema {
  _id: { $oid: string };
  username: string;
  password: string;
}

const db = client.database("test");
export const users = db.collection<UserSchema>("users");