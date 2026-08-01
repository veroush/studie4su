import { type Context, Hono } from "hono";

import { prisma } from "../../db";

type Cluster = "TECH" | "MED" | "BUS" | "SOC" | "EDU" | "SCI" | "LAW";
type ClusterScores = Record<Cluster, number>;
type ClusterWeights = Partial<ClusterScores>;
type JsonObject = Record<string, unknown>;

//rrd removed type QuizAnzwers 1 aug 6pm

type ProgramWithSchool = {
	id: string;
	name: string;
	description: string | null;
	levelRequired: string | null;
	duration: string | null;
	tuitionCost: string | null;
	careers: string | null;
	cluster: string;
	school: { id: string; name: string; shortName?: string | null };
};
type QuestionWithOptions = { id: string; [key: string]: unknown };
type QuizDatabase = {
	studyProgram: {
		findUnique(args: unknown): Promise<ProgramWithSchool | null>;
		findMany(args: unknown): Promise<ProgramWithSchool[]>;
	};
	quizResult: { create(args: unknown): Promise<{ id: string }> };
	question: { findMany(args: unknown): Promise<QuestionWithOptions[]> };
	answerOption: {
		findMany(args: unknown): Promise<{ id: string; weights: unknown }[]>;
	};
};

const db = prisma as unknown as QuizDatabase;
const quizRoutes = new Hono();

const isCluster = (value: string): value is Cluster =>
	["TECH", "MED", "BUS", "SOC", "EDU", "SCI", "LAW"].includes(value);

const readJsonBody = async (c: Context) =>
	(await c.req.json().catch(() => ({}))) as JsonObject;

//rrd removed const toStringArray and const toQuizAnswer 1 aug 6pm

const asJsonObject = (value: unknown): JsonObject =>
	value && typeof value === "object" && !Array.isArray(value)
		? (value as JsonObject)
		: {};

const createEmptyScores = (): ClusterScores => ({
	TECH: 0,
	MED: 0,
	BUS: 0,
	SOC: 0,
	EDU: 0,
	SCI: 0,
	LAW: 0,
});

// Quiz submission routes for Studie4SU
// Handles two endpoints:
//   POST /api/quiz/submit         ← OLD cluster-based format (kept for backwards compatibility)
//   POST /api/quiz/submit-profile ← NEW profile-based format from the updated quiz page

/* =============================================================
   HELPER: cluster weights for the OLD quiz format
============================================================= */
const answerWeights: Record<string, ClusterWeights> = {
	// These are from the original 10-question cluster quiz.
	// Kept here so the old format still works if needed.
	q1_a: { TECH: 3, MED: 0, BUS: 0, SOC: 0, EDU: 0, SCI: 1, LAW: 0 },
	q1_b: { TECH: 0, MED: 3, BUS: 0, SOC: 1, EDU: 0, SCI: 1, LAW: 0 },
	q1_c: { TECH: 0, MED: 0, BUS: 3, SOC: 0, EDU: 0, SCI: 0, LAW: 1 },
	q1_d: { TECH: 0, MED: 0, BUS: 0, SOC: 3, EDU: 1, SCI: 0, LAW: 0 },
	q1_e: { TECH: 0, MED: 0, BUS: 0, SOC: 0, EDU: 3, SCI: 0, LAW: 0 },
	q1_f: { TECH: 0, MED: 0, BUS: 0, SOC: 0, EDU: 0, SCI: 3, LAW: 0 },
	q1_g: { TECH: 0, MED: 0, BUS: 1, SOC: 0, EDU: 0, SCI: 0, LAW: 3 },
};

// Maps winning cluster → program ID that exists in the database
const clusterToProgramMap: Record<Cluster, string> = {
	TECH: "program_technology",
	MED: "program_medical",
	BUS: "program_business",
	SOC: "program_social_work",
	EDU: "program_education",
	SCI: "program_science",
	LAW: "program_law",
};

/* =============================================================
   POST /api/quiz/submit  ← OLD format
   Body: { answers: ["q1_a", "q2_b", ...], studentId?: string }
============================================================= */
quizRoutes.post("/submit", async (c) => {
	const req = { body: await readJsonBody(c) };
	try {
		const { answers, studentId } = req.body;

		if (!answers || !Array.isArray(answers)) {
			return c.json({ error: "answers must be an array" }, 400);
		}

		// Calculate cluster scores
		const scores = createEmptyScores();
		answers.forEach((answerId) => {
			const weights =
				typeof answerId === "string" ? answerWeights[answerId] : undefined;
			if (weights) {
				Object.entries(weights).forEach(([cluster, points]) => {
					if (isCluster(cluster)) scores[cluster] += points ?? 0;
				});
			}
		});

		// Find the top cluster
		const topCluster = (Object.keys(scores) as Cluster[]).reduce((a, b) =>
			scores[a] >= scores[b] ? a : b,
		);

		// Look up the recommended program
		const programId = clusterToProgramMap[topCluster];
		const program = await db.studyProgram.findUnique({
			where: { id: programId },
			include: { school: true },
		});

		if (!program) {
			return c.json({ error: "Program not found in database" }, 404);
		}

		// Save the result to the database
		// Note: scores is passed as a plain JS object (NOT JSON.stringify) — Prisma handles Json fields
		const result = await db.quizResult.create({
			data: {
				scores: scores, // plain object — Prisma's Json type needs this
				topCluster: topCluster,
				programId: program.id,
				studentId: studentId || null, // null for guest users
			},
		});

		return c.json({
			success: true,
			scores: scores,
			topCluster: topCluster,
			recommendation: {
				program: program.name,
				school: program.school.name,
				careers: program.careers,
			},
			resultId: result.id,
		});
	} catch (err) {
		console.error("Error in POST /api/quiz/submit:", err);
		return c.json(
			{ error: "Something went wrong saving the quiz result." },
			500,
		);
	}
});

/* =============================================================
   POST /api/quiz/submit-profile  ← NEW format from updated quiz
   Body: {
     answers: {
       diplomas: [],
       certificates: [],
       educationStatus: '',
       interests: [],
       subjectStrengths: [],
       learningStyle: '',
       preferredField: '',
       careerDirection: ''
     },
     topProgramId: 'program_technology',  // ID of the #1 match
     scores: { TECH: 85, MED: 40, ... },  // Match percentages from frontend
     studentId?: string
   }
============================================================= */
quizRoutes.post("/submit-profile", async (c) => {
	const req = { body: await readJsonBody(c) };
	try {
		const { answers, topProgramId, scores, studentId } = req.body;
		const scoreObject = asJsonObject(scores);

		// Validate required fields
		if (!topProgramId || !scores || !answers) {
			return c.json(
				{ error: "Missing required fields: answers, topProgramId, scores" },
				400,
			);
		}

		// Look up the recommended program in the database
		const program = await db.studyProgram.findUnique({
			where: { id: String(topProgramId) },
			include: { school: true },
		});

		if (!program) {
			// Don't crash — just return an error message
			return c.json(
				{ error: `Program "${String(topProgramId)}" not found in database` },
				404,
			);
		}

		// Find the top cluster from the scores object
		// scores looks like: { TECH: 85, MED: 40, BUS: 60, ... }
		const topCluster = Object.keys(scoreObject).reduce(
			(a, b) =>
				(Number(scoreObject[a]) || 0) >= (Number(scoreObject[b]) || 0) ? a : b,
			Object.keys(scoreObject)[0],
		);

		// Save the result to the database
		// We store the full answer profile in the scores field (it's a Json column)
		const result = await db.quizResult.create({
			data: {
				// Store both the cluster scores AND the profile answers in the Json column
				scores: {
					clusterScores: scoreObject,
					profileAnswers: answers, // the full profile answers
				},
				topCluster: topCluster,
				programId: program.id,
				studentId: studentId || null,
			},
		});

		return c.json({
			success: true,
			resultId: result.id,
			topCluster: topCluster,
			recommendation: {
				program: program.name,
				school: program.school.name,
			},
		});
	} catch (err) {
		console.error("Error in POST /api/quiz/submit-profile:", err);
		return c.json(
			{ error: "Something went wrong saving the quiz result." },
			500,
		);
	}
});
//raksha added new scoring endpoint here
/* =============================================================
   POST /api/quiz/recommend  ← NEW scoring endpoint
   Body: {
     answers: {
       diplomas:        string[],
       certificates:    string[],
       educationStatus: string,
       interests:       string[],
       subjectStrengths: string[],
       learningStyle:   string,
       preferredField:  string,
       careerDirection: string
     },
     lang: 'nl' | 'en'   (optional, for translated reason labels)
   }
   Returns: top 5 programs from DB with match % and reasons
============================================================= */

// rrd removed answer weights 1 aug 6 pm

// Reason labels per cluster, bilingual
const CLUSTER_REASONS: Record<"nl" | "en", Record<Cluster, string>> = {
	nl: {
		TECH: "Past bij jouw interesse in technologie en exacte vakken",
		MED: "Past bij jouw interesse in gezondheidszorg en biologie",
		BUS: "Past bij jouw interesse in economie en bedrijfskunde",
		SOC: "Past bij jouw sociale interesses en communicatieve vaardigheden",
		EDU: "Past bij jouw interesse in onderwijs en het werken met mensen",
		SCI: "Past bij jouw interesse in wetenschap en natuur",
		LAW: "Past bij jouw interesse in recht en bestuur",
	},
	en: {
		TECH: "Matches your interest in technology and exact sciences",
		MED: "Matches your interest in healthcare and biology",
		BUS: "Matches your interest in economics and business",
		SOC: "Matches your social interests and communication skills",
		EDU: "Matches your interest in education and working with people",
		SCI: "Matches your interest in science and nature",
		LAW: "Matches your interest in law and governance",
	},
};


//replaced by rrd 1 aug 6pm
quizRoutes.post("/recommend", async (c) => {
	const req = { body: await readJsonBody(c) };
	try {
		const { answers, lang = "nl" } = req.body;

		if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
			return c.json({ error: "answers is required" }, 400);
		}

		// ── 1. Calculate cluster scores from all answers ──────────
		// `answers` is { [questionKey]: optionId | optionId[] }. We
		// don't care which questionKey an answer came from — every
		// submitted option ID gets looked up directly against the
		// real AnswerOption rows, so any question (old or newly
		// added via the admin page) scores correctly with no
		// hardcoded key list to keep in sync.
		const submittedIds = Object.values(answers as Record<string, unknown>)
			.flatMap((value) => (Array.isArray(value) ? value : [value]))
			.filter(
				(value): value is string =>
					typeof value === "string" && value.length > 0,
			);

		if (submittedIds.length === 0) {
			return c.json({ error: "No answers were selected" }, 400);
		}

		const selectedOptions = await db.answerOption.findMany({
			where: { id: { in: submittedIds } },
		});

		const scores = createEmptyScores();
		for (const option of selectedOptions) {
			const weights = (option.weights ?? {}) as ClusterWeights;
			Object.entries(weights).forEach(([cluster, pts]) => {
				if (isCluster(cluster)) scores[cluster] += pts ?? 0;
			});
		}

		// ── 2. Rank clusters by score ─────────────────────────────
		const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
		const rankedClusters = (Object.entries(scores) as [Cluster, number][])
			.sort(([, a], [, b]) => b - a)
			.filter(([, score]) => score > 0);

		// If somehow all scores are 0 (all answers skipped), fall back to TECH
		if (rankedClusters.length === 0) {
			rankedClusters.push(["TECH", 1]);
		}

		// ── 3. Calculate how many slots each cluster gets (total 5) ──
		// Top cluster always gets at least 2 slots.
		// Rest are distributed proportionally by score.
		const TOTAL_SLOTS = 5;
		const clusterSlots: Partial<Record<Cluster, number>> = {};

		// Give top cluster its guaranteed minimum
		clusterSlots[rankedClusters[0][0]] = 2;
		const slotsLeft = TOTAL_SLOTS - 2;

		// Distribute remaining slots proportionally among runner-ups
		const runnerUps = rankedClusters.slice(1);
		const runnerUpTotal = runnerUps.reduce((sum, [, s]) => sum + s, 0) || 1;

		runnerUps.forEach(([cluster, score]) => {
			const share = Math.round((score / runnerUpTotal) * slotsLeft);
			clusterSlots[cluster] = share;
		});

		// Fix rounding: make sure total is exactly 5
		const assigned = Object.values(clusterSlots).reduce((a, b) => a + b, 0);
		if (assigned < TOTAL_SLOTS) {
			clusterSlots[rankedClusters[0][0]] =
				(clusterSlots[rankedClusters[0][0]] ?? 0) + TOTAL_SLOTS - assigned;
		}

		// ── 4. Fetch programs per cluster from DB ─────────────────
		const results: JsonObject[] = [];
		const usedIds = new Set<string>();

		for (const [cluster, slots] of Object.entries(clusterSlots) as [
			Cluster,
			number,
		][]) {
			if (slots <= 0) continue;

			const programs = await db.studyProgram.findMany({
				where: { cluster },
				include: {
					school: { select: { id: true, name: true, shortName: true } },
				},
				take: slots + 2, // fetch a few extra in case of duplicates
			});

			for (const program of programs) {
				if (usedIds.has(program.id)) continue;
				if (results.length >= TOTAL_SLOTS) break;
				usedIds.add(program.id);

				// Calculate match % for this program
				// Based on how dominant its cluster was
				const clusterScore = scores[cluster] || 0;
				const matchPct = Math.min(
					98,
					Math.round(40 + (clusterScore / totalScore) * 58),
				);

				const reasons =
					lang === "en"
						? [CLUSTER_REASONS.en[cluster] || "General match with your profile"]
						: [
								CLUSTER_REASONS.nl[cluster] ||
									"Algemene match met jouw profiel",
							];

				results.push({
					id: program.id,
					title: program.name,
					school: program.school.name,
					schoolId: program.school.id,
					description: program.description || "",
					requiredLevel: program.levelRequired || "",
					duration: program.duration || "",
					tuitionCost: program.tuitionCost || "",
					cluster: program.cluster,
					match: matchPct,
					reasons,
				});

				if (results.length >= TOTAL_SLOTS) break;
			}

			if (results.length >= TOTAL_SLOTS) break;
		}

		// ── 5. Return results ─────────────────────────────────────
		return c.json({
			success: true,
			scores,
			topCluster: rankedClusters[0][0],
			results,
		});
	} catch (err) {
		console.error("Error in POST /api/quiz/recommend:", err);
		return c.json(
			{ error: "Something went wrong calculating recommendations." },
			500,
		);
	}
});

/* =============================================================
   GET /api/quiz/questions
   ADDED: returns all active questions with their answer options,
   ordered by orderIndex. Used by quiz.js to load questions from
   DB instead of hardcoded questionsData.
   Returns a questionKey derived from the stable seed ID
   (e.g. 'q_interests' → 'interests') so quiz state keys match.
============================================================= */
quizRoutes.get("/questions", async (c) => {
	try {
		const questions = await db.question.findMany({
			where: { isActive: true },
			orderBy: { orderIndex: "asc" },
			include: {
				options: {
					select: {
						id: true,
						text: true,
						textEn: true,
					},
				},
			},
		});

		// Strip the 'q_' prefix from the seed ID to get the quiz state key
		// e.g. 'q_interests' → 'interests', 'q_preferredfield' → 'preferredfield'
		// quiz.js uses these as keys in quizState.answers
		const shaped = questions.map((q) => ({
			...q,
			questionKey: q.id.replace(/^q_/, ""),
		}));

		return c.json(shaped);
	} catch (err) {
		console.error("Error in GET /api/quiz/questions:", err);
		return c.json({ error: "Could not load questions." }, 500);
	}
});

export default quizRoutes;
