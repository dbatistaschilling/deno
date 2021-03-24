import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application();

app.use((ctx) => {
  ctx.response.body = "Hello World!";
});

console.log('Listening on port 8000');
await app.listen({ port: 8000 });

import { connect } from "./deps.ts";

const queueName = Deno.args[0];
if (!queueName) {
  console.log(`No queue name specified`);
  Deno.exit(1);
}

const connection = await connect({ loglevel: "debug" });

const channel = await connection.openChannel();

await channel.declareQueue({ queue: queueName });
await channel.consume(
  { queue: queueName },
  async (args, props, data) => {
    console.log(JSON.stringify(args));
    console.log(JSON.stringify(props));
    console.log(new TextDecoder().decode(data));
    await channel.ack({ deliveryTag: args.deliveryTag });
  },
);

connection.closed().then(() => {
  console.log("Closed peacefully");
}).catch((error) => {
  console.error("Connection closed with error");
  console.error(error.message);
});