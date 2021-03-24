FROM hayd/alpine-deno:latest

EXPOSE 8000

WORKDIR /app

USER deno

COPY src/deps.ts .
RUN deno cache --unstable deps.ts

COPY . .
RUN deno cache --unstable src/app.ts

CMD [ "run","--unstable","--allow-plugin","--allow-write","--allow-net","--allow-env","--allow-read","src/app.ts" ]