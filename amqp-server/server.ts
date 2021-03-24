import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application();

app.use((ctx) => {
  ctx.response.body = "Hello World!";
});

console.log('Listening on port 5000');
await app.listen({ port: 5000 });

import { connect } from "./deps.ts";

const queueName = Deno.args[0];

const connection = await connect();

const channel = await connection.openChannel();

await channel.declareQueue({ queue: queueName });
await channel.publish(
  { routingKey: queueName },
  { contentType: "application/json" },
  new TextEncoder().encode(JSON.stringify({ foo: "bar" })),
);

await connection.close();