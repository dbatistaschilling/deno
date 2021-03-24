import { Application, Router, Status } from './deps.ts';

const app = new Application();
const router = new Router();

// Logger
import logger from "./middleware/logger.ts";
app.use(logger);

// Timing
import timer from "./middleware/timer.ts";
app.use(timer);

// Hello World!
router.get("/", (ctx) => {
  ctx.response.status = Status.OK;
  ctx.response.type = "json";
  ctx.response.body = {
    status: "success",
    message: "Hello World!",
    data: null,
  };
});

app.use(router.routes());

// error
import error from "./middleware/error.ts";
app.use(error);

console.log("app running -> http://localhost:3000");
await app.listen({ port: 3000 });