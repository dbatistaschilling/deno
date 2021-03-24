FROM hayd/alpine-deno:latest

EXPOSE 8000

WORKDIR /app

USER deno

COPY . .

CMD [ "run", "--unstable","--allow-plugin",  "--allow-write", "--allow-net=0.0.0.0:8000", "--allow-env", "--allow-read", "app.js" ]