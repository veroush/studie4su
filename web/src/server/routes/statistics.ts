import { Hono } from "hono";
import { prisma } from "../../db";

const statisticsRoutes = new Hono();

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

// ── Quiz submission metrics ──────────────────────────────
statisticsRoutes.get("/quiz-submissions", async (c) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, thisMonth, clusters] = await Promise.all([
      prisma.quizResult.count(),
      prisma.quizResult.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.quizResult.groupBy({ by: ["topCluster"] }),
    ]);

    return c.json({ total, thisMonth, uniqueClusters: clusters.length });
  } catch (error) {
    return c.json({ error: getErrorMessage(error) }, 500);
  }
});

// ── Most favorited schools ───────────────────────────────
statisticsRoutes.get("/favorited-schools", async (c) => {
  try {
    const grouped = await prisma.favoriteSchool.groupBy({
      by: ["schoolId"],
      _count: { schoolId: true },
      orderBy: { _count: { schoolId: "desc" } },
      take: 5,
    });
    const schools = await prisma.school.findMany({
      where: { id: { in: grouped.map((g) => g.schoolId) } },
      select: { id: true, name: true },
    });
    const nameById = new Map(schools.map((s) => [s.id, s.name]));
    return c.json(
      grouped.map((g) => ({
        id: g.schoolId,
        name: nameById.get(g.schoolId) ?? "Unknown",
        count: g._count.schoolId,
      })),
    );
  } catch (error) {
    return c.json({ error: getErrorMessage(error) }, 500);
  }
});

// ── Most favorited programs ──────────────────────────────
statisticsRoutes.get("/favorited-programs", async (c) => {
  try {
    const grouped = await prisma.favoriteProgram.groupBy({
      by: ["programId"],
      _count: { programId: true },
      orderBy: { _count: { programId: "desc" } },
      take: 5,
    });
    const programs = await prisma.studyProgram.findMany({
      where: { id: { in: grouped.map((g) => g.programId) } },
      select: { id: true, name: true },
    });
    const nameById = new Map(programs.map((p) => [p.id, p.name]));
    return c.json(
      grouped.map((g) => ({
        id: g.programId,
        name: nameById.get(g.programId) ?? "Unknown",
        count: g._count.programId,
      })),
    );
  } catch (error) {
    return c.json({ error: getErrorMessage(error) }, 500);
  }
});

// ── Open house registrations ─────────────────────────────
statisticsRoutes.get("/openhouse-registrations", async (c) => {
  try {
    const grouped = await prisma.openHouseRegistration.groupBy({
      by: ["openHouseId"],
      _count: { openHouseId: true },
      orderBy: { _count: { openHouseId: "desc" } },
      take: 5,
    });
    const openHouses = await prisma.openHouse.findMany({
      where: { id: { in: grouped.map((g) => g.openHouseId) } },
      select: { id: true, title: true },
    });
    const titleById = new Map(openHouses.map((o) => [o.id, o.title]));
    return c.json(
      grouped.map((g) => ({
        id: g.openHouseId,
        title: titleById.get(g.openHouseId) ?? "Unknown",
        count: g._count.openHouseId,
      })),
    );
  } catch (error) {
    return c.json({ error: getErrorMessage(error) }, 500);
  }
});

// ── Most compared programs ───────────────────────────────
statisticsRoutes.get("/compared-programs", async (c) => {
  try {
    const comparisons = await prisma.programComparison.findMany({
      select: { programIds: true },
    });

    const countMap = new Map<string, number>();
    for (const row of comparisons) {
      const ids = row.programIds as string[];
      for (const id of ids) {
        countMap.set(id, (countMap.get(id) ?? 0) + 1);
      }
    }

    const topIds = [...countMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const programs = await prisma.studyProgram.findMany({
      where: { id: { in: topIds } },
      select: { id: true, name: true },
    });
    const nameById = new Map(programs.map((p) => [p.id, p.name]));

    return c.json(
      topIds.map((id) => ({
        id,
        name: nameById.get(id) ?? "Unknown",
        count: countMap.get(id) ?? 0,
      })),
    );
  } catch (error) {
    return c.json({ error: getErrorMessage(error) }, 500);
  }
});

// ── Platform activity over time (last 30 days) ───────────
statisticsRoutes.get("/activity", async (c) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const rows = await prisma.$queryRaw<{ day: Date; type: string; count: bigint }[]>`
      SELECT date_trunc('day', "createdAt") AS day, "type", COUNT(*)::bigint AS count
      FROM "PageView"
      WHERE "createdAt" >= ${since}
      GROUP BY day, "type"
      ORDER BY day ASC
    `;

    const byDay = new Map<string, { date: string; visits: number; favorites: number }>();
    for (const row of rows) {
      const key = row.day.toISOString().slice(0, 10);
      const entry = byDay.get(key) ?? { date: key, visits: 0, favorites: 0 };
      if (row.type === "visit") entry.visits = Number(row.count);
      if (row.type === "favorite") entry.favorites = Number(row.count);
      byDay.set(key, entry);
    }

    return c.json([...byDay.values()].sort((a, b) => a.date.localeCompare(b.date)));
  } catch (error) {
    return c.json({ error: getErrorMessage(error) }, 500);
  }
});

export default statisticsRoutes;