import { serve, ServerRequest } from "./deps.ts";
import { respondRpc } from "./deps.ts";

import { rpcMethods } from "./rpc-methods.ts"

console.log("listening on 0.0.0.0:3333");
const s = serve("0.0.0.0:3000");

for await (const req of s) {
  await respondRpc(req, rpcMethods);
}