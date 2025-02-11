import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

type Bindings = {
  DB: D1Database
  API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", prettyJSON(), logger(), async (c, next) => {
  const auth = bearerAuth({ token: c.env.API_KEY });
  return auth(c, next);
});

app.post("/api/all", async (c) => {
  try {
    console.log(c.req);
    const { query, params } = await c.req.json();
    let stmt = c.env.DB.prepare(query);
    if (params) {
      stmt = stmt.bind(params);
    }

    const result = await stmt.run();
    return c.json(result);
  } catch (err) {
    return c.json({ error: `Failed to run query: ${err}` }, 500);
  }
});

app.post("/api/exec", async (c) => {
  return c.text("/api/exec endpoint");
});

app.post("/api/batch", async (c) => {
  return c.text("/api/batch endpoint");
});

export default app;