import { createRemote } from "https://deno.land/x/gentleRpc/rpcClient.ts";

const remote = createRemote("http://0.0.0.0:8000");
// const createdUser = await remote.createUser({
//   username: "treta",
//   password: "benga"
// });

// console.log(createdUser);

const getUsers = await remote.getUsers();

// console.log(getUsers);