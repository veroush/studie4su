import { type Context, Hono } from "hono";

import { prisma } from "../../db";

type Cluster = "TECH" | "MED" | "BUS" | "SOC" | "EDU" | "SCI" | "LAW";
type ClusterScores = Record<Cluster, number>;
type ClusterWeights = Partial<ClusterScores>;
type JsonObject = Record<string, unknown>;
type QuizAnswers = {
	interests?: string[];
	subjectStrengths?: string[];
	certificates?: string[];
	preferredField?: string;
	careerDirection?: string;
	learningStyle?: string;
};
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
};

const db = prisma as unknown as QuizDatabase;
const quizRoutes = new Hono();

const isCluster = (value: string): value is Cluster =>
	["TECH", "MED", "BUS", "SOC", "EDU", "SCI", "LAW"].includes(value);

const readJsonBody = async (c: Context) =>
	(await c.req.json().catch(() => ({}))) as JsonObject;

const toStringArray = (value: unknown): string[] =>
	Array.isArray(value)
		? value.filter((item): item is string => typeof item === "string")
		: [];

const toQuizAnswers = (value: unknown): QuizAnswers => {
	const input = (value && typeof value === "object" ? value : {}) as JsonObject;
	return {
		interests: toStringArray(input.interests),
		subjectStrengths: toStringArray(input.subjectStrengths),
		certificates: toStringArray(input.certificates),
		preferredField:
			typeof input.preferredField === "string" ? input.preferredField : "",
		careerDirection:
			typeof input.careerDirection === "string" ? input.careerDirection : "",
		learningStyle:
			typeof input.learningStyle === "string" ? input.learningStyle : "",
	};
};

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

// Maps each answer value to cluster point weights.
// Every question contributes to one or more clusters.
// CHANGED: removed all hardcoded program data — scoring is now
// driven purely by cluster weights against real DB programs.
const ANSWER_WEIGHTS: Record<string, ClusterWeights> = {
	// ── interests ──────────────────────────────────────────────
	// NL
	"Technologie en computers": { TECH: 3 },
	"Gezondheidszorg en medisch": { MED: 3 },
	"Economie en business": { BUS: 3 },
	"Onderwijs en jongeren": { EDU: 3 },
	"Natuur en milieu": { SCI: 3 },
	"Recht en bestuur": { LAW: 3 },
	"Kunst en creatief": { SOC: 2 },
	"Landbouw en biologie": { SCI: 2, TECH: 1 },
	"Sociale wetenschappen en hulpverlening": { SOC: 3 },
	// EN
	"Technology and computers": { TECH: 3 },
	"Healthcare and medical": { MED: 3 },
	"Economics and business": { BUS: 3 },
	"Education and youth": { EDU: 3 },
	"Nature and environment": { SCI: 3 },
	"Law and governance": { LAW: 3 },
	"Art and creative work": { SOC: 2 },
	"Agriculture and biology": { SCI: 2, TECH: 1 },
	"Social sciences and welfare": { SOC: 3 },

	// ── subjectStrengths ───────────────────────────────────────
	// NL
	Wiskunde: { TECH: 2, SCI: 2, BUS: 1 },
	"Informatica / Computer Science": { TECH: 3 },
	Biologie: { MED: 2, SCI: 3 },
	Scheikunde: { SCI: 3, MED: 1 },
	"Natuur- en Scheikunde": { TECH: 2, SCI: 2 },
	Economie: { BUS: 3 },
	Geschiedenis: { SOC: 2, LAW: 1 },
	"Talen (Nederlands, Engels)": { SOC: 2, EDU: 2, LAW: 1 },
	Aardrijkskunde: { SCI: 2 },
	Maatschappijleer: { SOC: 2, LAW: 2, EDU: 1 },
	// EN
	Mathematics: { TECH: 2, SCI: 2, BUS: 1 },
	"Computer Science / ICT": { TECH: 3 },
	Biology: { MED: 2, SCI: 3 },
	Chemistry: { SCI: 3, MED: 1 },
	Physics: { TECH: 2, SCI: 2 },
	Economics: { BUS: 3 },
	History: { SOC: 2, LAW: 1 },
	"Languages (Dutch, English)": { SOC: 2, EDU: 2, LAW: 1 },
	Geography: { SCI: 2 },
	"Social Studies": { SOC: 2, LAW: 2, EDU: 1 },

	// ── preferredField ─────────────────────────────────────────
	// NL
	"ICT en Technologie": { TECH: 5 },
	"Gezondheidszorg en Medisch": { MED: 5 },
	"Business en Economie": { BUS: 5 },
	"Onderwijs en Pedagogie": { EDU: 5 },
	"Natuur- en Milieuwetenschappen": { SCI: 5 },
	"Recht en Bestuur": { LAW: 5 },
	"Landbouw en Biologie": { SCI: 4, TECH: 1 },
	"Sociale Wetenschappen": { SOC: 5 },
	// EN
	"ICT and Technology": { TECH: 5 },
	"Healthcare and Medical": { MED: 5 },
	"Business and Economics": { BUS: 5 },
	"Education and Pedagogy": { EDU: 5 },
	"Natural and Environmental Sciences": { SCI: 5 },
	"Law and Governance": { LAW: 5 },
	"Agriculture and Biology": { SCI: 4, TECH: 1 },
	"Social Sciences": { SOC: 5 },

	// ── certificates ───────────────────────────────────────────
	// NL
	"ICT certificaten (bijv. CISCO, CompTIA)": { TECH: 2 },
	"Talenopleidingen (bijv. Engels, Spaans)": { SOC: 1, EDU: 1 },
	"Bedrijfskunde / Management cursus": { BUS: 2 },
	"Gezondheidszorg cursus": { MED: 2 },
	"Technische cursus (bijv. lassen, elektra)": { TECH: 2 },
	"Landbouw / Natuur cursus": { SCI: 2 },
	"Juridische / Bestuurskunde cursus": { LAW: 2 },
	"Onderwijscursus / Pedagogie": { EDU: 2 },
	// EN
	"ICT certificates (e.g. CISCO, CompTIA)": { TECH: 2 },
	"Language courses (e.g. English, Spanish)": { SOC: 1, EDU: 1 },
	"Business / Management course": { BUS: 2 },
	"Healthcare course": { MED: 2 },
	"Technical course (e.g. welding, electrical)": { TECH: 2 },
	"Agriculture / Nature course": { SCI: 2 },
	"Legal / Public Administration course": { LAW: 2 },
	"Education course / Pedagogy": { EDU: 2 },

	// ── careerDirection ────────────────────────────────────────
	// NL
	"Hoog salaris en carrièremogelijkheden": { BUS: 2, TECH: 1 },
	"Mensen helpen en sociaal werk doen": { MED: 2, SOC: 2 },
	"Creatief en innovatief werk": { TECH: 1, SOC: 1 },
	"Maatschappelijke impact maken": { SOC: 2, EDU: 1, LAW: 1 },
	"Stabiliteit en zekerheid": { EDU: 1, LAW: 1, BUS: 1 },
	"Ondernemerschap en vrijheid": { BUS: 2 },
	// EN
	"High salary and career opportunities": { BUS: 2, TECH: 1 },
	"Helping people and social work": { MED: 2, SOC: 2 },
	"Creative and innovative work": { TECH: 1, SOC: 1 },
	"Making a social impact": { SOC: 2, EDU: 1, LAW: 1 },
	"Stability and security": { EDU: 1, LAW: 1, BUS: 1 },
	"Entrepreneurship and freedom": { BUS: 2 },

	// ── learningStyle ──────────────────────────────────────────
	// NL
	"Praktisch: met mijn handen werken en direct toepassen": { TECH: 1, MED: 1 },
	"Theoretisch: lezen, schrijven en analyseren": { SOC: 1, LAW: 1, SCI: 1 },
	"Mix van theorie en praktijk": { BUS: 1, EDU: 1 },
	"Door samenwerken in groepsverband": { SOC: 1, EDU: 1 },
	"Door opdrachten zelfstandig uit te voeren": { TECH: 1, SCI: 1 },
	// EN
	"Practically: hands-on and direct application": { TECH: 1, MED: 1 },
	"Theoretically: reading, writing and analysis": { SOC: 1, LAW: 1, SCI: 1 },
	"Mix of theory and practice": { BUS: 1, EDU: 1 },
	"Through collaboration in groups": { SOC: 1, EDU: 1 },
	"By completing tasks independently": { TECH: 1, SCI: 1 },
};

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

// Keywords used to re-rank programs *within* a cluster by how closely
// their name/description match the specific field the student picked.
// Clusters are coarse (e.g. TECH covers ICT, civil engineering, and
// agriculture), so without this, an unrelated program tagged with the
// same cluster can outrank the actual best match.
const PREFERRED_FIELD_KEYWORDS: Record<string, string[]> = {
	"ICT en Technologie": ["ict", "informatica", "computer", "software", "technologie", "communicatie"],
	"ICT and Technology": ["ict", "informatica", "computer", "software", "technologie", "communicatie"],
	"Gezondheidszorg en Medisch": ["gezondheid", "medisch", "geneeskunde", "fysiotherapie", "zorg"],
	"Healthcare and Medical": ["gezondheid", "medisch", "geneeskunde", "fysiotherapie", "zorg", "health"],
	"Business en Economie": ["economie", "bedrijfskunde", "business", "management", "finance", "accounting", "marketing"],
	"Business and Economics": ["economie", "bedrijfskunde", "business", "management", "finance", "accounting", "marketing"],
	"Onderwijs en Pedagogie": ["onderwijs", "pedagogi", "leraren", "educat"],
	"Education and Pedagogy": ["onderwijs", "pedagogi", "leraren", "educat"],
	"Natuur- en Milieuwetenschappen": ["milieu", "natuurkunde", "scheikunde", "biologie", "wetenschap"],
	"Natural and Environmental Sciences": ["milieu", "natuurkunde", "scheikunde", "biologie", "wetenschap", "science"],
	"Recht en Bestuur": ["recht", "rechtswetenschap", "bestuur", "governance"],
	"Law and Governance": ["recht", "rechtswetenschap", "bestuur", "governance", "law"],
	"Landbouw en Biologie": ["landbouw", "agrarisch", "agro", "biologie"],
	"Agriculture and Biology": ["landbouw", "agrarisch", "agro", "biologie", "agri"],
	"Sociale Wetenschappen": ["sociolog", "psycholog", "sociaal", "maatschapp"],
	"Social Sciences": ["sociolog", "psycholog", "sociaal", "maatschapp", "social"],
};

// Counts how many of the preferred field's keywords appear in a program's
// name or description (case-insensitive). Higher = more relevant.
function computeProgramRelevance(
	program: { name: string; description: string | null },
	preferredField: string | undefined,
): number {
	if (!preferredField) return 0;
	const keywords = PREFERRED_FIELD_KEYWORDS[preferredField];
	if (!keywords || keywords.length === 0) return 0;

	const haystack = `${program.name} ${program.description ?? ""}`.toLowerCase();
	return keywords.reduce(
		(count, kw) => (haystack.includes(kw) ? count + 1 : count),
		0,
	);
}

quizRoutes.post("/recommend", async (c) => {
	const req = { body: await readJsonBody(c) };
	try {
		const { answers, lang = "nl" } = req.body;
		const quizAnswers = toQuizAnswers(answers);

		if (!answers) {
			return c.json({ error: "answers is required" }, 400);
		}

		// ── 1. Calculate cluster scores from all answers ──────────
		const scores = createEmptyScores();

		// Collect all answer values into one flat array
		const allAnswers = [
			...(quizAnswers.interests || []),
			...(quizAnswers.subjectStrengths || []),
			...(quizAnswers.certificates || []),
			quizAnswers.preferredField || "",
			quizAnswers.careerDirection || "",
			quizAnswers.learningStyle || "",
		].filter(Boolean);

		// Add points for each answer
		allAnswers.forEach((answer) => {
			const weights = ANSWER_WEIGHTS[answer];
			if (weights) {
				Object.entries(weights).forEach(([cluster, pts]) => {
					if (isCluster(cluster)) scores[cluster] += pts ?? 0;
				});
			}
		});

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

			const clusterPrograms = await db.studyProgram.findMany({
				where: { cluster },
				include: {
					school: { select: { id: true, name: true, shortName: true } },
				},
				take: 50, // fetch a wide pool so relevance sorting below has room to work
			});

			// Re-rank by relevance to the student's specific preferred field —
			// the cluster alone isn't precise enough (e.g. TECH spans ICT,
			// civil engineering, and agriculture).
			const programs = [...clusterPrograms].sort(
				(a, b) =>
					computeProgramRelevance(b, quizAnswers.preferredField) -
					computeProgramRelevance(a, quizAnswers.preferredField),
			);

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

const QUESTION_KEY_MAP: Record<string, string> = {
	q_diplomas: "diplomas",
	q_certificates: "certificates",
	q_educationstatus: "educationStatus",
	q_interests: "interests",
	q_subjectstrengths: "subjectStrengths",
	q_learningstyle: "learningStyle",
	q_preferredfield: "preferredField",
	q_careerdirection: "careerDirection",
};

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
			questionKey: QUESTION_KEY_MAP[q.id] ?? q.id.replace(/^q_/, ""),
		}));

		return c.json(shaped);
	} catch (err) {
		console.error("Error in GET /api/quiz/questions:", err);
		return c.json({ error: "Could not load questions." }, 500);
	}
});

export default quizRoutes;
