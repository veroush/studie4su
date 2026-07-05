import { Hono } from "hono";

import { prisma } from "../../db";

interface AdminSettingsDelegate {
	findFirst(): Promise<{ aboutUs: unknown } | null>;
}

const db = prisma as unknown as { adminSettings: AdminSettingsDelegate };
const aboutRoutes = new Hono();

aboutRoutes.get("/", async (c) => {
	try {
		const settings = await db.adminSettings.findFirst();

		if (!settings || !settings.aboutUs) {
			return c.json({ error: "About content not found" }, 404);
		}

		return c.json(settings.aboutUs);
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to fetch about content" }, 500);
	}
});

export default aboutRoutes;
