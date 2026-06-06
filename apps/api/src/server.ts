import { env } from "./config/env";
import { app } from "./app";

console.log(`Weather API escuchando en http://localhost:${env.PORT}`);

export default {
  port: env.PORT,
  fetch: app.fetch
};
