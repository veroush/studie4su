import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-workers";
import { auth } from "#/lib/auth";
import { adminOnly, attachSession, optionalAuth, requireAuth } from "./middleware/session";
import type { AuthVariables } from "./middleware/session";
import aboutRoutes from "./routes/about";
import adminRoutes from "./routes/admin";
import adminSettingsRoutes from "./routes/admin-settings";
import favoritesRoutes from "./routes/favorites";
import openHouseRoutes from "./routes/open-houses";
import programRoutes from "./routes/programs";
import quizRoutes from "./routes/quiz";
import schoolRoutes from "./routes/schools";

const app = new Hono<{ Variables: AuthVariables }>();

app.use("*", attachSession);
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/api/quiz", quizRoutes);

app.use("/api/admin/*", requireAuth, adminOnly);
app.route("/api/admin", adminRoutes);
app.route("/api/admin/settings", adminSettingsRoutes);

app.use("/api/openhouses", optionalAuth);
app.use("/api/openhouses/:id", optionalAuth);
app.use("/api/openhouses/:id/register", requireAuth);
app.route("/api/openhouses", openHouseRoutes);
app.route("/api/admin/openhouses", openHouseRoutes);

app.route("/api/schools", schoolRoutes);
app.route("/api/programs", programRoutes);
app.route("/api/favorites", favoritesRoutes);
app.route("/api/about", aboutRoutes);

app.use("/*", serveStatic({ root: "./public" }));

app.onError((error, c) => {
	console.error(error);
	return c.json({ error: "Internal server error" }, 500);
});

export default app;