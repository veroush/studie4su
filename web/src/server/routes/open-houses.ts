import { Hono } from "hono";
import type { Context } from "hono";

import { prisma } from "../../db";

type Variables = {
	userId?: number;
};

type SchoolSummary = {
	id: string;
	name: string;
	shortName: string | null;
	type: string | null;
};

type School = SchoolSummary & Record<string, unknown>;

type RegistrationSummary = {
	userId: number;
};

type OpenHouseListItem = {
	id: string;
	title: string;
	description: string | null;
	date: Date;
	location: string | null;
	isOnline: boolean;
	registrationUrl: string | null;
	school: SchoolSummary | null;
	OpenHouseRegistration: RegistrationSummary[];
};

type OpenHouse = {
	id: string;
	title: string;
	description: string | null;
	date: Date;
	location: string | null;
	isOnline: boolean;
	registrationUrl: string | null;
	isActive: boolean;
	schoolId: string;
};

type OpenHouseBody = Partial<{
	title: string;
	description: string | null;
	date: string | Date;
	location: string | null;
	isOnline: boolean;
	registrationUrl: string | null;
	isActive: boolean;
	schoolId: string;
}>;

type CreateOpenHouseData = {
	title: string;
	description: string | null;
	date: Date;
	location: string | null;
	isOnline: boolean;
	registrationUrl: string | null;
	isActive: boolean;
	schoolId: string;
};

type UpdateOpenHouseData = Partial<CreateOpenHouseData>;

type OpenHouseDelegate = {
	findMany(args: {
		where: { isActive: true; schoolId?: string };
		orderBy: { date: "asc" };
		include: {
			school: { select: { id: true; name: true; shortName: true; type: true } };
			OpenHouseRegistration: { select: { userId: true } };
		};
	}): Promise<OpenHouseListItem[]>;
	findUnique(args: { where: { id: string } }): Promise<OpenHouse | null>;
	findUnique(args: {
		where: { id: string };
		include: { school: true };
	}): Promise<(OpenHouse & { school: School | null }) | null>;
	create(args: {
		data: CreateOpenHouseData;
		include: { school: true };
	}): Promise<OpenHouse & { school: School | null }>;
	update(args: {
		where: { id: string };
		data: UpdateOpenHouseData;
		include: { school: true };
	}): Promise<OpenHouse & { school: School | null }>;
	delete(args: { where: { id: string } }): Promise<OpenHouse>;
};

type SchoolDelegate = {
	findUnique(args: { where: { id: string } }): Promise<School | null>;
};

type OpenHouseRegistrationDelegate = {
	upsert(args: {
		where: { userId_openHouseId: { userId: number | undefined; openHouseId: string } };
		update: Record<string, never>;
		create: { userId: number | undefined; openHouseId: string };
	}): Promise<unknown>;
	deleteMany(args: {
		where: { userId: number | undefined; openHouseId: string };
	}): Promise<unknown>;
};

type OpenHouseDatabase = {
	openHouse: OpenHouseDelegate;
	school: SchoolDelegate;
	openHouseRegistration: OpenHouseRegistrationDelegate;
};

const db = prisma as unknown as OpenHouseDatabase;
const openHouseRoutes = new Hono<{ Variables: Variables }>();

const parseBody = async (c: Context<{ Variables: Variables }>) =>
	(await c.req.json()) as OpenHouseBody;

openHouseRoutes.get("/", async (c) => {
	try {
		const schoolId = c.req.query("schoolId");

		const openHouses = await db.openHouse.findMany({
			where: {
				isActive: true,
				...(schoolId && { schoolId }),
			},
			orderBy: { date: "asc" },
			include: {
				school: {
					select: { id: true, name: true, shortName: true, type: true },
				},
				OpenHouseRegistration: { select: { userId: true } },
			},
		});

		const userId = c.get("userId") || null;
		const data = openHouses.map((openHouse) => ({
			id: openHouse.id,
			title: openHouse.title,
			description: openHouse.description,
			date: openHouse.date,
			location: openHouse.location,
			isOnline: openHouse.isOnline,
			registrationUrl: openHouse.registrationUrl,
			school:
				openHouse.school?.shortName || openHouse.school?.name || openHouse.title,
			registered: userId
				? openHouse.OpenHouseRegistration.some(
						(registration) => registration.userId === userId,
					)
				: false,
			registrationCount: openHouse.OpenHouseRegistration.length,
		}));

		return c.json(data);
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to fetch open houses" }, 500);
	}
});

openHouseRoutes.get("/:id", async (c) => {
	try {
		const openHouse = await db.openHouse.findUnique({
			where: { id: c.req.param("id") },
			include: { school: true },
		});

		if (!openHouse) {
			return c.json({ error: "Open house not found" }, 404);
		}

		return c.json(openHouse);
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to fetch open house" }, 500);
	}
});

// TODO: attach admin-only Hono middleware before mounting admin open house routes.
openHouseRoutes.post("/", async (c) => {
	try {
		const {
			title,
			description,
			date,
			location,
			isOnline,
			registrationUrl,
			isActive,
			schoolId,
		} = await parseBody(c);

		if (!title || !date || !schoolId) {
			return c.json({ error: "title, date, and schoolId are required" }, 400);
		}

		const parsedDate = new Date(date);
		if (Number.isNaN(parsedDate.getTime())) {
			return c.json(
				{
					error:
						'date must be a valid ISO 8601 date string, e.g. "2026-03-15T10:00:00"',
				},
				400,
			);
		}

		const school = await db.school.findUnique({ where: { id: schoolId } });
		if (!school) {
			return c.json({ error: `School with id "${schoolId}" not found` }, 404);
		}

		const openHouse = await db.openHouse.create({
			data: {
				title,
				description: description || null,
				date: parsedDate,
				location: location || null,
				isOnline: isOnline ?? false,
				registrationUrl: registrationUrl || null,
				isActive: isActive ?? true,
				schoolId,
			},
			include: { school: true },
		});

		return c.json(openHouse, 201);
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to create open house" }, 500);
	}
});

// TODO: attach admin-only Hono middleware before mounting admin open house routes.
openHouseRoutes.put("/:id", async (c) => {
	try {
		const {
			title,
			description,
			date,
			location,
			isOnline,
			registrationUrl,
			isActive,
			schoolId,
		} = await parseBody(c);

		const existing = await db.openHouse.findUnique({
			where: { id: c.req.param("id") },
		});
		if (!existing) {
			return c.json({ error: "Open house not found" }, 404);
		}

		let parsedDate: Date | undefined;
		if (date !== undefined) {
			parsedDate = new Date(date);
			if (Number.isNaN(parsedDate.getTime())) {
				return c.json(
					{
						error:
							'date must be a valid ISO 8601 date string, e.g. "2026-03-15T10:00:00"',
					},
					400,
				);
			}
		}

		if (schoolId) {
			const school = await db.school.findUnique({ where: { id: schoolId } });
			if (!school) {
				return c.json({ error: `School with id "${schoolId}" not found` }, 404);
			}
		}

		const updated = await db.openHouse.update({
			where: { id: c.req.param("id") },
			data: {
				...(title !== undefined && { title }),
				...(description !== undefined && { description }),
				...(date !== undefined && { date: parsedDate }),
				...(location !== undefined && { location }),
				...(isOnline !== undefined && { isOnline }),
				...(registrationUrl !== undefined && { registrationUrl }),
				...(isActive !== undefined && { isActive }),
				...(schoolId !== undefined && { schoolId }),
			},
			include: { school: true },
		});

		return c.json(updated);
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to update open house" }, 500);
	}
});

// TODO: attach admin-only Hono middleware before mounting admin open house routes.
openHouseRoutes.delete("/:id", async (c) => {
	try {
		const existing = await db.openHouse.findUnique({
			where: { id: c.req.param("id") },
		});

		if (!existing) {
			return c.json({ error: "Open house not found" }, 404);
		}

		await db.openHouse.delete({ where: { id: c.req.param("id") } });

		return c.json({ success: true, message: "Open house deleted successfully" });
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to delete open house" }, 500);
	}
});

// TODO: attach require-auth Hono middleware before mounting registration routes.
openHouseRoutes.post("/:id/register", async (c) => {
	const id = c.req.param("id");
	const userId = c.get("userId");

	try {
		const openHouse = await db.openHouse.findUnique({ where: { id } });
		if (!openHouse || !openHouse.isActive) {
			return c.json({ error: "Open house not found" }, 404);
		}

		await db.openHouseRegistration.upsert({
			where: { userId_openHouseId: { userId, openHouseId: id } },
			update: {},
			create: { userId, openHouseId: id },
		});

		console.log(`[openHouses.register] user ${userId} registered for ${id}`);
		return c.json({ success: true });
	} catch (error) {
		console.error("[openHouses.register]", error);
		return c.json({ error: "Server error" }, 500);
	}
});

// TODO: attach require-auth Hono middleware before mounting registration routes.
openHouseRoutes.delete("/:id/register", async (c) => {
	const id = c.req.param("id");
	const userId = c.get("userId");

	try {
		await db.openHouseRegistration.deleteMany({
			where: { userId, openHouseId: id },
		});

		console.log(`[openHouses.unregister] user ${userId} unregistered from ${id}`);
		return c.json({ success: true });
	} catch (error) {
		console.error("[openHouses.unregister]", error);
		return c.json({ error: "Server error" }, 500);
	}
});

export default openHouseRoutes;
