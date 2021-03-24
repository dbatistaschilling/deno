import { connect } from "https://denopkg.com/keroxp/deno-redis/mod.ts";
const redis = await connect({
  hostname: "127.0.0.1",
  port: 6379
});

const ok = await redis.set("deno", "land");
const value = await redis.get("deno");

console.log(value) // deno