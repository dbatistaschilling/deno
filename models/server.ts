import { MongoClient } from "./deps.ts";

const client = new MongoClient();
client.connectWithUri(Deno.env.get('MONGO_URI') || 'mongodb://mongo/models-api');

// Defining schema interface
interface UserSchema {
  _id: { $oid: string };
  username: string;
  password: string;
}

const db = client.database("test");
const users = db.collection<UserSchema>("users");

import { serve, ServerRequest } from "./deps.ts";
import { respondRpc } from "./deps.ts";

console.log("listening on 0.0.0.0:3333");
const s = serve("0.0.0.0:3333");
const rpcMethods = {
  createUser: async ({ username, password }: { username:string, password:string }) => {
    console.log(username, password );
    
    if (!username || !password) {
      return {
        success: false,
        user: null
      }
    } else {
      const _id = await users.insertOne({ username, password })
      return {
        success: true,
        user: await users.findOne({ _id })
      }
    }
  },
};

for await (const req of s) {
  await respondRpc(req, rpcMethods);
}

// // insert
// const insertId = await users.insertOne({
//   username: "user1",
//   password: "pass1",
// });

// // insertMany
// const insertIds = await users.insertMany([
//   {
//     username: "user1",
//     password: "pass1",
//   },
//   {
//     username: "user2",
//     password: "pass2",
//   },
// ]);

// // findOne
// const user1 = await users.findOne({ _id: insertId });
// // Returns:
// // { _id: { $oid: "<oid>" }, username: "user1", password: "pass1" }

// // find
// const all_users = await users.find({ username: { $ne: null } });

// // find by ObjectId
// const user1_id = await users.findOne({ _id: { $oid: "<oid>" } });

// // count
// const count = await users.count({ username: { $ne: null } });

// // aggregation
// const docs = await users.aggregate([
//   { $match: { username: "many" } },
//   { $group: { _id: "$username", total: { $sum: 1 } } },
// ]);

// // updateOne
// const { matchedCount, modifiedCount, upsertedId } = await users.updateOne(
//   { username: { $ne: null } },
//   { $set: { username: "USERNAME" } }
// );

// // updateMany
// const { matchedCount, modifiedCount, upsertedId } = await users.updateMany(
//   { username: { $ne: null } },
//   { $set: { username: "USERNAME" } }
// );

// // deleteOne
// const deleteCount = await users.deleteOne({ _id: insertId });

// // deleteMany
// const deleteCount2 = await users.deleteMany({ username: "test" });

// // Skip
// const skipTwo = await users.skip(2).find();

// // Limit
// const featuredUser = await users.limit(5).find();