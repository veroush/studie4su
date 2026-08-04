import { type Context, Hono } from "hono";

import { prisma } from "../../db";

type ClusterWeights = Record<string, number>;

type AnswerOptionRow = {
	id: string;
	text: string;
	textEn: string | null;
	weights: ClusterWeights;
	questionId: string;
};

type QuestionWithOptions = {
	id: string;
	text: string;
	textEn: string | null;
	type: string;
	orderIndex: number;
	isActive: boolean;
	createdAt: Date;
	options: AnswerOptionRow[];
};

type AnswerInput = { text: string; cluster?: string };

type QuestionBody = Partial<{
	text: string;
	type: string;
	answers: AnswerInput[];
}>;

// Weight given to an answer's chosen cluster. Other clusters stay at 0.
// Matches the "interests" tier in quiz.ts's ANSWER_WEIGHTS map, not the
// higher "preferredField" tier (5) — tune here if that's wrong.
const SINGLE_CLUSTER_WEIGHT = 3;

type QuestionDelegate = {
	findMany(args: {
		orderBy: { orderIndex: "asc" };
		include: { options: true };
	}): Promise<QuestionWithOptions[]>;
	findUnique(args: {
		where: { id: string };
		include: { options: true };
	}): Promise<QuestionWithOptions | null>;
	aggregate(args: {
		_max: { orderIndex: true };
	}): Promise<{ _max: { orderIndex: number | null } }>;
	create(args: {
		data: {
			text: string;
			type: string;
			orderIndex: number;
			isActive: boolean;
			options: { create: { text: string; weights: ClusterWeights }[] };
		};
		include: { options: true };
	}): Promise<QuestionWithOptions>;
	update(args: {
		where: { id: string };
		data: {
			text?: string;
			type?: string;
			options?: { create: { text: string; weights: ClusterWeights }[] };
		};
		include: { options: true };
	}): Promise<QuestionWithOptions>;
	delete(args: { where: { id: string } }): Promise<{ id: string }>;
};

type AnswerOptionDelegate = {
	deleteMany(args: { where: { questionId: string } }): Promise<unknown>;
};

type QuizQuestionDatabase = {
	question: QuestionDelegate;
	answerOption: AnswerOptionDelegate;
};

const db = prisma as unknown as QuizQuestionDatabase;
const quizQuestionRoutes = new Hono();

const parseBody = async (c: Context) => (await c.req.json()) as QuestionBody;

function buildWeights(cluster: string | undefined): ClusterWeights {
	if (!cluster) return {};
	return { [cluster]: SINGLE_CLUSTER_WEIGHT };
}

function mapAnswersForCreate(answers: AnswerInput[]) {
	return answers.map((a) => ({
		text: a.text,
		weights: buildWeights(a.cluster),
	}));
}

quizQuestionRoutes.get("/", async (c) => {
	try {
		const questions = await db.question.findMany({
			orderBy: { orderIndex: "asc" },
			include: { options: true },
		});
		return c.json(questions);
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to fetch quiz questions" }, 500);
	}
});

quizQuestionRoutes.get("/:id", async (c) => {
	try {
		const question = await db.question.findUnique({
			where: { id: c.req.param("id") },
			include: { options: true },
		});
		if (!question) return c.json({ error: "Question not found" }, 404);
		return c.json(question);
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to fetch question" }, 500);
	}
});

quizQuestionRoutes.post("/", async (c) => {
	try {
		const { text, type, answers } = await parseBody(c);

		if (!text || !text.trim()) {
			return c.json({ error: "text is required" }, 400);
		}
		if (!type) {
			return c.json({ error: "type is required" }, 400);
		}
		if (!answers || answers.length < 2) {
			return c.json({ error: "At least 2 answer options are required" }, 400);
		}

		const maxOrder = await db.question.aggregate({ _max: { orderIndex: true } });
		const question = await db.question.create({
			data: {
				text: text.trim(),
				type,
				orderIndex: (maxOrder._max.orderIndex ?? 0) + 1,
				isActive: true,
				options: { create: mapAnswersForCreate(answers) },
			},
			include: { options: true },
		});

		return c.json(question, 201);
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to create question" }, 500);
	}
});

quizQuestionRoutes.put("/:id", async (c) => {
	try {
		const { text, type, answers } = await parseBody(c);

		if (!text || !text.trim()) {
			return c.json({ error: "text is required" }, 400);
		}
		if (!type) {
			return c.json({ error: "type is required" }, 400);
		}
		if (!answers || answers.length < 2) {
			return c.json({ error: "At least 2 answer options are required" }, 400);
		}

		await db.answerOption.deleteMany({ where: { questionId: c.req.param("id") } });
		const question = await db.question.update({
			where: { id: c.req.param("id") },
			data: {
				text: text.trim(),
				type,
				options: { create: mapAnswersForCreate(answers) },
			},
			include: { options: true },
		});

		return c.json(question);
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to update question" }, 500);
	}
});

quizQuestionRoutes.put("/:id/answers", async (c) => {
	try {
		const { answers } = await parseBody(c);

		if (!answers || answers.length < 2) {
			return c.json({ error: "At least 2 answer options are required" }, 400);
		}

		await db.answerOption.deleteMany({ where: { questionId: c.req.param("id") } });
		const question = await db.question.update({
			where: { id: c.req.param("id") },
			data: { options: { create: mapAnswersForCreate(answers) } },
			include: { options: true },
		});

		return c.json(question);
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to update answers" }, 500);
	}
});

quizQuestionRoutes.delete("/:id", async (c) => {
	try {
		await db.answerOption.deleteMany({ where: { questionId: c.req.param("id") } });
		await db.question.delete({ where: { id: c.req.param("id") } });
		return c.json({ success: true, message: "Question deleted successfully" });
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to delete question" }, 500);
	}
});

export default quizQuestionRoutes;