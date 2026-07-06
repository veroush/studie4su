import { Hono } from "hono";
import type { Context } from "hono";

import { prisma } from "../../db";

interface AdminDatabase {
	quizResult: {
		findMany(args: {
			orderBy: { createdAt: "desc" };
			include: { recommendedProgram: { include: { school: true } } };
		}): Promise<unknown[]>;
		count(): Promise<number>;
		groupBy(args: {
			by: ["topCluster"];
			_count: { topCluster: true };
			orderBy: { _count: { topCluster: "desc" } };
		}): Promise<Array<{ topCluster: string | null; _count: { topCluster: number } }>>;
	};
	user: {
		findMany(args: {
			select: { id: true; name: true; email: true; role: true; createdAt: true };
			orderBy: { createdAt: "asc" };
		}): Promise<unknown[]>;
		update(args: { where: { id: number }; data: { role: string } }): Promise<unknown>;
	};
	school: {
		findMany(args: { orderBy: { createdAt: "desc" }; include: { _count: { select: { programs: true } } } }): Promise<unknown[]>;
		findUnique(args: { where: { id: string }; include?: unknown }): Promise<unknown | null>;
		create(args: { data: Record<string, unknown> }): Promise<unknown>;
		update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<unknown>;
		delete(args: { where: { id: string } }): Promise<unknown>;
	};
	studyProgram: {
		findMany(args: { orderBy: { createdAt: "desc" }; include: { school: true } }): Promise<unknown[]>;
		findUnique(args: { where: { id: string }; include?: unknown }): Promise<unknown | null>;
		create(args: { data: Record<string, unknown>; include: { school: true } }): Promise<unknown>;
		update(args: { where: { id: string }; data: Record<string, unknown>; include: { school: true } }): Promise<unknown>;
		delete(args: { where: { id: string } }): Promise<unknown>;
	};
	quizQuestion: {
		findMany(args: { orderBy: { order: "asc" }; include: { answers: { orderBy: { order: "asc" } } } }): Promise<unknown[]>;
		findUnique(args: { where: { id: string }; include: { answers: { orderBy: { order: "asc" } } } }): Promise<unknown | null>;
		aggregate(args: { _max: { order: true } }): Promise<{ _max: { order: number | null } }>;
		create(args: { data: Record<string, unknown>; include: { answers: { orderBy: { order: "asc" } } } }): Promise<unknown>;
		update(args: { where: { id: string }; data: Record<string, unknown>; include: { answers: { orderBy: { order: "asc" } } } }): Promise<unknown>;
		delete(args: { where: { id: string } }): Promise<unknown>;
	};
	quizAnswer: {
		deleteMany(args: { where: { questionId: string } }): Promise<unknown>;
	};
}

interface CountedSchool {
	_count: { programs: number };
}

interface CountedProgram {
	_count: { quizResults: number };
}

interface QuizAnswerBody {
	text: string;
	programLink?: string | null;
	order?: number | null;
}

interface QuestionBody {
	text?: string;
	type?: string;
	answers?: QuizAnswerBody[];
}

const db = prisma as unknown as AdminDatabase;
const adminRoutes = new Hono();

// TODO: Apply the migrated Hono requireAuth/adminOnly middleware when mounting this route module.

const isPrismaRecordNotFound = (error: unknown) =>
	typeof error === "object" && error !== null && "code" in error && error.code === "P2025";

const readJsonBody = async <T>(c: Context) => (await c.req.json()) as T;

const mapAnswersForCreate = (answers: QuizAnswerBody[]) =>
	answers.map((answer, index) => ({
		text: answer.text.trim(),
		programLink: answer.programLink || null,
		order: answer.order ?? index + 1,
	}));

adminRoutes.get("/results", async (c) => {
	try {
		const results = await db.quizResult.findMany({ orderBy: { createdAt: "desc" }, include: { recommendedProgram: { include: { school: true } } } });
		return c.json(results);
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to fetch results" }, 500);
	}
});

adminRoutes.get("/results/count", async (c) => {
	try {
		return c.json({ totalStudents: await db.quizResult.count() });
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to fetch count" }, 500);
	}
});

adminRoutes.get("/results/by-cluster", async (c) => {
	try {
		const grouped = await db.quizResult.groupBy({ by: ["topCluster"], _count: { topCluster: true }, orderBy: { _count: { topCluster: "desc" } } });
		return c.json(grouped.map((g) => ({ topCluster: g.topCluster, count: g._count.topCluster })));
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to fetch cluster data" }, 500);
	}
});

adminRoutes.get("/users", async (c) => {
	try {
		const users = await db.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true }, orderBy: { createdAt: "asc" } });
		return c.json(users);
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to fetch users" }, 500);
	}
});

adminRoutes.get("/schools", async (c) => {
	try {
		return c.json(await db.school.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { programs: true } } } }));
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to fetch schools" }, 500);
	}
});

adminRoutes.get("/schools/:id", async (c) => {
	try {
		const school = await db.school.findUnique({ where: { id: c.req.param("id") }, include: { programs: true } });
		if (!school) return c.json({ error: "School not found" }, 404);
		return c.json(school);
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to fetch school" }, 500);
	}
});

adminRoutes.post("/schools", async (c) => {
	try {
		const { name, shortName, type, website, location } = await readJsonBody<Record<string, string | undefined>>(c);
		if (!name || !type) return c.json({ error: "name and type are required" }, 400);
		const school = await db.school.create({ data: { name, shortName: shortName || null, type, website: website || null, location: location || null } });
		return c.json(school, 201);
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to create school" }, 500);
	}
});

adminRoutes.put("/schools/:id", async (c) => {
	try {
		const { name, shortName, type, website, location } = await readJsonBody<Record<string, string | undefined>>(c);
		const existing = await db.school.findUnique({ where: { id: c.req.param("id") } });
		if (!existing) return c.json({ error: "School not found" }, 404);
		const updated = await db.school.update({ where: { id: c.req.param("id") }, data: { ...(name !== undefined && { name }), ...(shortName !== undefined && { shortName }), ...(type !== undefined && { type }), ...(website !== undefined && { website }), ...(location !== undefined && { location }) } });
		return c.json(updated);
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to update school" }, 500);
	}
});

adminRoutes.delete("/schools/:id", async (c) => {
	try {
		const existing = (await db.school.findUnique({ where: { id: c.req.param("id") }, include: { _count: { select: { programs: true } } } })) as CountedSchool | null;
		if (!existing) return c.json({ error: "School not found" }, 404);
		if (existing._count.programs > 0) return c.json({ error: `Cannot delete school — it still has ${existing._count.programs} program(s) linked to it. Delete those programs first.` }, 400);
		await db.school.delete({ where: { id: c.req.param("id") } });
		return c.json({ success: true, message: "School deleted successfully" });
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to delete school" }, 500);
	}
});

adminRoutes.get("/programs", async (c) => {
	try {
		return c.json(await db.studyProgram.findMany({ orderBy: { createdAt: "desc" }, include: { school: true } }));
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to fetch programs" }, 500);
	}
});

adminRoutes.get("/programs/:id", async (c) => {
	try {
		const program = await db.studyProgram.findUnique({ where: { id: c.req.param("id") }, include: { school: true } });
		if (!program) return c.json({ error: "Program not found" }, 404);
		return c.json(program);
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to fetch program" }, 500);
	}
});

adminRoutes.post("/programs", async (c) => {
	try {
		const body = await readJsonBody<Record<string, string | undefined>>(c);
		const { name, description, cluster, duration, levelRequired, tuitionCost, careers, schoolId } = body;
		if (!name || !cluster || !schoolId) return c.json({ error: "name, cluster, and schoolId are required" }, 400);
		const school = await db.school.findUnique({ where: { id: schoolId } });
		if (!school) return c.json({ error: `School with id "${schoolId}" not found` }, 404);
		const program = await db.studyProgram.create({ data: { name, description: description || null, cluster, duration: duration || null, levelRequired: levelRequired || null, tuitionCost: tuitionCost || null, careers: careers || null, schoolId }, include: { school: true } });
		return c.json(program, 201);
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to create program" }, 500);
	}
});

adminRoutes.put("/programs/:id", async (c) => {
	try {
		const body = await readJsonBody<Record<string, string | undefined>>(c);
		const { name, description, cluster, duration, levelRequired, tuitionCost, careers, schoolId } = body;
		const existing = await db.studyProgram.findUnique({ where: { id: c.req.param("id") } });
		if (!existing) return c.json({ error: "Program not found" }, 404);
		if (schoolId) {
			const school = await db.school.findUnique({ where: { id: schoolId } });
			if (!school) return c.json({ error: `School with id "${schoolId}" not found` }, 404);
		}
		const updated = await db.studyProgram.update({ where: { id: c.req.param("id") }, data: { ...(name !== undefined && { name }), ...(description !== undefined && { description }), ...(cluster !== undefined && { cluster }), ...(duration !== undefined && { duration }), ...(levelRequired !== undefined && { levelRequired }), ...(tuitionCost !== undefined && { tuitionCost }), ...(careers !== undefined && { careers }), ...(schoolId !== undefined && { schoolId }) }, include: { school: true } });
		return c.json(updated);
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to update program" }, 500);
	}
});

adminRoutes.delete("/programs/:id", async (c) => {
	try {
		const existing = (await db.studyProgram.findUnique({ where: { id: c.req.param("id") }, include: { _count: { select: { quizResults: true } } } })) as CountedProgram | null;
		if (!existing) return c.json({ error: "Program not found" }, 404);
		if (existing._count.quizResults > 0) return c.json({ error: `Cannot delete program — it has ${existing._count.quizResults} quiz result(s) linked to it.` }, 400);
		await db.studyProgram.delete({ where: { id: c.req.param("id") } });
		return c.json({ success: true, message: "Program deleted successfully" });
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to delete program" }, 500);
	}
});

adminRoutes.put("/users/:id", async (c) => {
	const { role } = await readJsonBody<{ role?: string }>(c);
	if (!role || !["admin", "student"].includes(role)) return c.json({ message: "Invalid role" }, 400);
	try {
		return c.json(await db.user.update({ where: { id: Number.parseInt(c.req.param("id"), 10) }, data: { role } }));
	} catch {
		return c.json({ message: "Failed to update user" }, 500);
	}
});

adminRoutes.get("/quiz/questions", async (c) => {
	try {
		return c.json(await db.quizQuestion.findMany({ orderBy: { order: "asc" }, include: { answers: { orderBy: { order: "asc" } } } }));
	} catch (error) {
		console.error("[GET /admin/quiz/questions]", error);
		return c.json({ error: "Failed to fetch questions" }, 500);
	}
});

adminRoutes.get("/quiz/questions/:id", async (c) => {
	try {
		const question = await db.quizQuestion.findUnique({ where: { id: c.req.param("id") }, include: { answers: { orderBy: { order: "asc" } } } });
		if (!question) return c.json({ error: "Question not found" }, 404);
		return c.json(question);
	} catch (error) {
		console.error("[GET /admin/quiz/questions/:id]", error);
		return c.json({ error: "Failed to fetch question" }, 500);
	}
});

adminRoutes.post("/quiz/questions", async (c) => {
	const { text, type, answers = [] } = await readJsonBody<QuestionBody>(c);
	if (!text?.trim()) return c.json({ error: "Question text is required" }, 400);
	if (!type) return c.json({ error: "Question type is required" }, 400);
	if (answers.length < 2) return c.json({ error: "At least 2 answers are required" }, 400);
	try {
		const maxOrder = await db.quizQuestion.aggregate({ _max: { order: true } });
		const question = await db.quizQuestion.create({ data: { text: text.trim(), type, order: (maxOrder._max.order ?? 0) + 1, answers: { create: mapAnswersForCreate(answers) } }, include: { answers: { orderBy: { order: "asc" } } } });
		return c.json(question, 201);
	} catch (error) {
		console.error("[POST /admin/quiz/questions]", error);
		return c.json({ error: "Failed to create question" }, 500);
	}
});

adminRoutes.put("/quiz/questions/:id", async (c) => {
	const { text, type, answers = [] } = await readJsonBody<QuestionBody>(c);
	if (!text?.trim()) return c.json({ error: "Question text is required" }, 400);
	if (!type) return c.json({ error: "Question type is required" }, 400);
	if (answers.length < 2) return c.json({ error: "At least 2 answers are required" }, 400);
	try {
		await db.quizAnswer.deleteMany({ where: { questionId: c.req.param("id") } });
		const question = await db.quizQuestion.update({ where: { id: c.req.param("id") }, data: { text: text.trim(), type, answers: { create: mapAnswersForCreate(answers) } }, include: { answers: { orderBy: { order: "asc" } } } });
		return c.json(question);
	} catch (error) {
		console.error("[PUT /admin/quiz/questions/:id]", error);
		if (isPrismaRecordNotFound(error)) return c.json({ error: "Question not found" }, 404);
		return c.json({ error: "Failed to update question" }, 500);
	}
});

adminRoutes.put("/quiz/questions/:id/answers", async (c) => {
	const { answers = [] } = await readJsonBody<{ answers?: QuizAnswerBody[] }>(c);
	if (answers.length < 2) return c.json({ error: "At least 2 answers are required" }, 400);
	try {
		await db.quizAnswer.deleteMany({ where: { questionId: c.req.param("id") } });
		const question = await db.quizQuestion.update({ where: { id: c.req.param("id") }, data: { answers: { create: mapAnswersForCreate(answers) } }, include: { answers: { orderBy: { order: "asc" } } } });
		return c.json(question);
	} catch (error) {
		console.error("[PUT /admin/quiz/questions/:id/answers]", error);
		if (isPrismaRecordNotFound(error)) return c.json({ error: "Question not found" }, 404);
		return c.json({ error: "Failed to update answers" }, 500);
	}
});

adminRoutes.delete("/quiz/questions/:id", async (c) => {
	try {
		await db.quizAnswer.deleteMany({ where: { questionId: c.req.param("id") } });
		await db.quizQuestion.delete({ where: { id: c.req.param("id") } });
		return c.json({ success: true, message: "Question deleted successfully" });
	} catch (error) {
		console.error("[DELETE /admin/quiz/questions/:id]", error);
		if (isPrismaRecordNotFound(error)) return c.json({ error: "Question not found" }, 404);
		return c.json({ error: "Failed to delete question" }, 500);
	}
});

export default adminRoutes;
