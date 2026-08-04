import { Hono } from "hono";
import { prisma } from "../../db";

const trackingRoutes = new Hono();

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

trackingRoutes.post("/comparison", async (c) => {
  try {
    const body = await c.req.json<{ programIds?: string[] }>();
    const programIds = body.programIds;
    if (!Array.isArray(programIds) || programIds.length < 2 || programIds.length > 3) {
      return c.json({ error: "programIds must be an array of 2-3 ids" }, 400);
    }
    await prisma.programComparison.create({ data: { programIds } });
    return c.json({ ok: true }, 201);
  } catch (error) {
    return c.json({ error: getErrorMessage(error) }, 500);
  }
});

trackingRoutes.post("/pageview", async (c) => {
  try {
    const body = await c.req.json<{ type?: string }>();
    if (body.type !== "visit" && body.type !== "favorite") {
      return c.json({ error: "type must be 'visit' or 'favorite'" }, 400);
    }
    await prisma.pageView.create({ data: { type: body.type } });
    return c.json({ ok: true }, 201);
  } catch (error) {
    return c.json({ error: getErrorMessage(error) }, 500);
  }
});

export default trackingRoutes;