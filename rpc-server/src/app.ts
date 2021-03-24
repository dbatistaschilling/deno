import { serve, ServerRequest } from "./deps.ts";
import { respondRpc } from "./deps.ts";
import { rpcMethods } from "./rpc-methods.ts";
import { config } from "./deps.ts";

console.log(`listening on ${Deno.env.get("PORT") || config()["PORT"]}`);
console.log(Deno.env.get("DENO_ENV"), config()["PORT"]);

const s = serve(Deno.env.get("PORT") || config()["PORT"]);

for await (const req of s) {
  await respondRpc(req, rpcMethods);
}
