import { MongoClient } from "./deps.ts";
import { config } from "./deps.ts";

const client = new MongoClient();
client.connectWithUri(
  `${Deno.env.get("MONGO_URL") || config()["MONGO_URL"]}-${
    Deno.env.get("DENO_ENV")
  }`,
);
console.log(
  `${Deno.env.get("MONGO_URL") || config()["MONGO_URL"]}-${
    Deno.env.get("DENO_ENV")
  }`,
);

export const db = client.database(
  `${Deno.env.get("DB_DATABASE") || config()["DB_DATABASE"]}-${
    Deno.env.get("DENO_ENV")
  }`,
);
// console.log(db);
