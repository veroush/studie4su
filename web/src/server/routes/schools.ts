import { Hono } from "hono";

import { prisma } from "../../db";

interface SchoolDelegate {
	findMany(args: {
		include: { _count: { select: { programs: true } } };
		orderBy: { name: "asc" };
	}): Promise<unknown[]>;
	findUnique(args: {
		where: { id: string };
		include: { programs: true };
	}): Promise<unknown | null>;
}

interface SchoolDatabase {
	school: SchoolDelegate;
}

const db = prisma as unknown as SchoolDatabase;
const schoolRoutes = new Hono();

const getErrorMessage = (error: unknown) =>
	error instanceof Error ? error.message : String(error);

schoolRoutes.get("/", async (c) => {
	try {
		const schools = await db.school.findMany({
			include: { _count: { select: { programs: true } } },
			orderBy: { name: "asc" },
		});

		return c.json(schools);
	} catch (error) {
		return c.json({ error: getErrorMessage(error) }, 500);
	}
});

schoolRoutes.get("/:id", async (c) => {
	try {
		const school = await db.school.findUnique({
			where: { id: c.req.param("id") },
			include: { programs: true },
		});

		if (!school) {
			return c.json({ error: "Not found" }, 404);
		}

		return c.json(school);
	} catch (error) {
		return c.json({ error: getErrorMessage(error) }, 500);
	}
});

export default schoolRoutes;
