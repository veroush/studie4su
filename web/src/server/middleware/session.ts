import type { MiddlewareHandler } from "hono";
import { auth } from "#/lib/auth";

export interface AuthVariables {
	user: Awaited<ReturnType<typeof auth.api.getSession>> extends infer S
		? S extends { user: infer U }
			? U | null
			: null
		: null;
	session: Awaited<ReturnType<typeof auth.api.getSession>> extends infer S
		? S extends { session: infer Se }
			? Se | null
			: null
		: null;
}

export type AuthMiddleware = MiddlewareHandler<{ Variables: AuthVariables }>;

// Reads the Better Auth session cookie (if any) and attaches
// `user`/`session` to context. Mount this once, near the top of
// app.ts, before any route that reads c.get("user").
export const attachSession: AuthMiddleware = async (c, next) => {
	const result = await auth.api.getSession({ headers: c.req.raw.headers });

	c.set("user", (result?.user ?? null) as AuthVariables["user"]);
	c.set("session", (result?.session ?? null) as AuthVariables["session"]);

	await next();
};

// Blocks requests without a valid Better Auth session.
export const requireAuth: AuthMiddleware = async (c, next) => {
	if (!c.get("user")) {
		return c.json({ error: "Login required" }, 401);
	}
	await next();
};

// Continues as a guest — actual session lookup happens in
// attachSession (mounted globally); this is just a passthrough
// marker kept for parity with the old middleware's route wiring.
export const optionalAuth: AuthMiddleware = async (_c, next) => {
	await next();
};

// Use after requireAuth (or attachSession) on admin-only routes.
export const adminOnly: AuthMiddleware = async (c, next) => {
	const user = c.get("user") as { role?: string } | null;
	if (!user || user.role !== "admin") {
		return c.json({ error: "Admin access required" }, 403);
	}
	await next();
};
