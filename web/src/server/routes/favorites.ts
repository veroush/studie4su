import { Hono } from "hono";
import type { Context } from "hono";

import { prisma } from "../../db";
import type { AuthVariables } from "../middleware/session";

interface FavoriteSchoolRecord {
	id?: string;
	userId: string;
	schoolId: string;
	[key: string]: unknown;
}

interface FavoriteProgramRecord {
	id?: string;
	userId: string;
	programId: string;
	[key: string]: unknown;
}

interface FavoriteOpenHouseRecord {
	id?: string;
	userId: string;
	openHouseId: string;
	[key: string]: unknown;
}

interface PrismaErrorWithCode {
	code?: string;
}

interface FavoriteSchoolDelegate {
	findMany(args: {
		where: { userId: string };
		select: { schoolId: true };
	}): Promise<Array<{ schoolId: string }>>;
	findUnique(args: {
		where: { userId_schoolId: { userId: string; schoolId: string } };
	}): Promise<FavoriteSchoolRecord | null>;
	upsert(args: {
		where: { userId_schoolId: { userId: string; schoolId: string } };
		create: { userId: string; schoolId: string };
		update: Record<string, never>;
	}): Promise<FavoriteSchoolRecord>;
	delete(args: {
		where: { userId_schoolId: { userId: string; schoolId: string } };
	}): Promise<FavoriteSchoolRecord>;
}

interface FavoriteProgramDelegate {
	findMany(args: {
		where: { userId: string };
		select: { programId: true };
	}): Promise<Array<{ programId: string }>>;
	findUnique(args: {
		where: { userId_programId: { userId: string; programId: string } };
	}): Promise<FavoriteProgramRecord | null>;
	upsert(args: {
		where: { userId_programId: { userId: string; programId: string } };
		create: { userId: string; programId: string };
		update: Record<string, never>;
	}): Promise<FavoriteProgramRecord>;
	delete(args: {
		where: { userId_programId: { userId: string; programId: string } };
	}): Promise<FavoriteProgramRecord>;
}

interface FavoriteOpenHouseDelegate {
	findMany(args: {
		where: { userId: string };
		select: { openHouseId: true };
	}): Promise<Array<{ openHouseId: string }>>;
	findUnique(args: {
		where: { userId_openHouseId: { userId: string; openHouseId: string } };
	}): Promise<FavoriteOpenHouseRecord | null>;
	upsert(args: {
		where: { userId_openHouseId: { userId: string; openHouseId: string } };
		create: { userId: string; openHouseId: string };
		update: Record<string, never>;
	}): Promise<FavoriteOpenHouseRecord>;
	delete(args: {
		where: { userId_openHouseId: { userId: string; openHouseId: string } };
	}): Promise<FavoriteOpenHouseRecord>;
}

interface FavoritesDatabase {
	favoriteSchool: FavoriteSchoolDelegate;
	favoriteProgram: FavoriteProgramDelegate;
	favoriteOpenHouse: FavoriteOpenHouseDelegate;
}

interface FavoriteRequestBody {
	schoolId?: string;
	programId?: string;
	openHouseId?: string;
}

const db = prisma as unknown as FavoritesDatabase;
const favoritesRoutes = new Hono<{ Variables: AuthVariables }>();

const readBody = async (c: Context) =>
	(await c.req.json().catch(() => ({}))) as FavoriteRequestBody;

// Reads the Better Auth session user attached by the global
// `attachSession` middleware (mounted in app.ts) — no JWT decoding
// needed here anymore, and no `jsonwebtoken` import, which can't
// load on the Cloudflare Workers runtime this project targets.
const getUser = (c: Context) => c.get("user") as { id: string } | null;

const isPrismaErrorCode = (error: unknown, code: string) =>
	typeof error === "object" &&
	error !== null &&
	(error as PrismaErrorWithCode).code === code;

favoritesRoutes.get("/me", async (c) => {
	const user = getUser(c);
	if (!user) return c.json({ error: "Not authenticated" }, 401);

	try {
		const [schools, programs, openhouses] = await Promise.all([
			db.favoriteSchool.findMany({
				where: { userId: user.id },
				select: { schoolId: true },
			}),
			db.favoriteProgram.findMany({
				where: { userId: user.id },
				select: { programId: true },
			}),
			db.favoriteOpenHouse.findMany({
				where: { userId: user.id },
				select: { openHouseId: true },
			}),
		]);

		return c.json({
			schools: schools.map((favorite) => favorite.schoolId),
			programs: programs.map((favorite) => favorite.programId),
			openhouses: openhouses.map((favorite) => favorite.openHouseId),
		});
	} catch (error) {
		console.error("[GET /favorites/me]", error);
		return c.json({ error: "Failed to fetch favorites" }, 500);
	}
});

favoritesRoutes.post("/schools", async (c) => {
	const user = getUser(c);
	if (!user) return c.json({ error: "Not authenticated" }, 401);

	const { schoolId } = await readBody(c);
	if (!schoolId) return c.json({ error: "schoolId required" }, 400);

	try {
		const favorite = await db.favoriteSchool.upsert({
			where: { userId_schoolId: { userId: user.id, schoolId } },
			create: { userId: user.id, schoolId },
			update: {},
		});
		return c.json(favorite);
	} catch (error) {
		if (isPrismaErrorCode(error, "P2002")) {
			const existing = await db.favoriteSchool.findUnique({
				where: { userId_schoolId: { userId: user.id, schoolId } },
			});
			return c.json(existing);
		}
		console.error("[POST /favorites/schools]", error);
		return c.json({ error: "Failed to add favorite" }, 500);
	}
});

favoritesRoutes.delete("/schools/:schoolId", async (c) => {
	const user = getUser(c);
	if (!user) return c.json({ error: "Not authenticated" }, 401);

	try {
		await db.favoriteSchool.delete({
			where: {
				userId_schoolId: { userId: user.id, schoolId: c.req.param("schoolId") },
			},
		});
		return c.json({ success: true });
	} catch (error) {
		if (isPrismaErrorCode(error, "P2025")) return c.json({ success: true });
		console.error("[DELETE /favorites/schools]", error);
		return c.json({ error: "Failed to remove favorite" }, 500);
	}
});

favoritesRoutes.post("/programs", async (c) => {
	const user = getUser(c);
	if (!user) return c.json({ error: "Not authenticated" }, 401);

	const { programId } = await readBody(c);
	if (!programId) return c.json({ error: "programId required" }, 400);

	try {
		const favorite = await db.favoriteProgram.upsert({
			where: { userId_programId: { userId: user.id, programId } },
			create: { userId: user.id, programId },
			update: {},
		});
		return c.json(favorite);
	} catch (error) {
		if (isPrismaErrorCode(error, "P2002")) {
			const existing = await db.favoriteProgram.findUnique({
				where: { userId_programId: { userId: user.id, programId } },
			});
			return c.json(existing);
		}
		console.error("[POST /favorites/programs]", error);
		return c.json({ error: "Failed to add favorite" }, 500);
	}
});

favoritesRoutes.delete("/programs/:programId", async (c) => {
	const user = getUser(c);
	if (!user) return c.json({ error: "Not authenticated" }, 401);

	try {
		await db.favoriteProgram.delete({
			where: {
				userId_programId: { userId: user.id, programId: c.req.param("programId") },
			},
		});
		return c.json({ success: true });
	} catch (error) {
		if (isPrismaErrorCode(error, "P2025")) return c.json({ success: true });
		console.error("[DELETE /favorites/programs]", error);
		return c.json({ error: "Failed to remove favorite" }, 500);
	}
});

favoritesRoutes.post("/openhouses", async (c) => {
	const user = getUser(c);
	if (!user) return c.json({ error: "Not authenticated" }, 401);

	const { openHouseId } = await readBody(c);
	if (!openHouseId) return c.json({ error: "openHouseId required" }, 400);

	try {
		const favorite = await db.favoriteOpenHouse.upsert({
			where: { userId_openHouseId: { userId: user.id, openHouseId } },
			create: { userId: user.id, openHouseId },
			update: {},
		});
		return c.json(favorite);
	} catch (error) {
		if (isPrismaErrorCode(error, "P2002")) {
			const existing = await db.favoriteOpenHouse.findUnique({
				where: { userId_openHouseId: { userId: user.id, openHouseId } },
			});
			return c.json(existing);
		}
		console.error("[POST /favorites/openhouses]", error);
		return c.json({ error: "Failed to add favorite" }, 500);
	}
});

favoritesRoutes.delete("/openhouses/:openHouseId", async (c) => {
	const user = getUser(c);
	if (!user) return c.json({ error: "Not authenticated" }, 401);

	try {
		await db.favoriteOpenHouse.delete({
			where: {
				userId_openHouseId: {
					userId: user.id,
					openHouseId: c.req.param("openHouseId"),
				},
			},
		});
		return c.json({ success: true });
	} catch (error) {
		if (isPrismaErrorCode(error, "P2025")) return c.json({ success: true });
		console.error("[DELETE /favorites/openhouses]", error);
		return c.json({ error: "Failed to remove favorite" }, 500);
	}
});

export default favoritesRoutes;