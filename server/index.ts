import { serve, ServerRequest } from "https://deno.land/std@0.62.0/http/server.ts";
import { respondRpc } from "https://deno.land/x/gentleRpc/rpcServer.ts";

console.log("listening on 0.0.0.0:8000");
const s = serve("0.0.0.0:8000");
const rpcMethods = {
  sayHello: (w: string) => `Hello ${w}`,
  animalsMakeNoise: (noise: string) => noise.toUpperCase(),
};

for await (const req of s) {
  await respondRpc(req, rpcMethods);
}