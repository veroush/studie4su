import { createRequire } from "node:module";
import type { MiddlewareHandler } from "hono";

const require = createRequire(import.meta.url);

interface JwtPayload {
	id?: string | number;
	role?: string;
}

interface JsonWebToken {
	verify(token: string, secret: string | undefined): string | JwtPayload;
}

export interface AuthVariables {
	userId?: string | number;
	userRole?: string;
}

export type AuthMiddleware = MiddlewareHandler<{ Variables: AuthVariables }>;

const jwt = require("jsonwebtoken") as JsonWebToken;

const getBearerToken = (authorization: string | undefined): string | null => {
	if (!authorization?.startsWith("Bearer ")) {
		return null;
	}

	return authorization.split(" ")[1] ?? "";
};

const attachUser = (
	set: <Key extends keyof AuthVariables>(key: Key, value: AuthVariables[Key]) => void,
	payload: string | JwtPayload,
) => {
	if (typeof payload === "string") {
		return;
	}

	set("userId", payload.id);
	set("userRole", payload.role);
};

// Blocks requests without a valid JWT, matching the legacy Express middleware.
export const requireAuth: AuthMiddleware = async (c, next) => {
	const token = getBearerToken(c.req.header("authorization"));

	if (token === null) {
		return c.json({ error: "Login required" }, 401);
	}

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		attachUser(c.set.bind(c), payload);
		await next();
	} catch {
		return c.json({ error: "Invalid or expired token" }, 401);
	}
};

// Continues as a guest when no valid JWT is present, matching legacy optional auth.
export const optionalAuth: AuthMiddleware = async (c, next) => {
	const token = getBearerToken(c.req.header("authorization"));

	if (!token) {
		await next();
		return;
	}

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		attachUser(c.set.bind(c), payload);
	} catch {
		// Invalid/expired token — continue as guest.
	}

	await next();
};

// Use after requireAuth on admin-only routes.
export const adminOnly: AuthMiddleware = async (c, next) => {
	if (c.get("userRole") !== "admin") {
		return c.json({ error: "Admin access required" }, 403);
	}

	await next();
};
