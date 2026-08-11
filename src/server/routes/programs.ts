import { Hono } from "hono";

import { prisma } from "../../db";

interface StudyProgramDelegate {
	findMany(args: {
		include: { school: true };
		orderBy: { name: "asc" };
	}): Promise<unknown[]>;
	findUnique(args: {
		where: { id: string };
		include: { school: true };
	}): Promise<unknown | null>;
}

interface ProgramDatabase {
	studyProgram: StudyProgramDelegate;
}

const db = prisma as unknown as ProgramDatabase;
const programRoutes = new Hono();

const getErrorMessage = (error: unknown) =>
	error instanceof Error ? error.message : String(error);

programRoutes.get("/", async (c) => {
	try {
		const programs = await db.studyProgram.findMany({
			include: { school: true },
			orderBy: { name: "asc" },
		});

		return c.json(programs);
	} catch (error) {
		return c.json({ error: getErrorMessage(error) }, 500);
	}
});

programRoutes.get("/:id", async (c) => {
	try {
		const program = await db.studyProgram.findUnique({
			where: { id: c.req.param("id") },
			include: { school: true },
		});

		if (!program) {
			return c.json({ error: "Not found" }, 404);
		}

		return c.json(program);
	} catch (error) {
		return c.json({ error: getErrorMessage(error) }, 500);
	}
});

export default programRoutes;
