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

const app = new Hono<{ Variables: AuthVariables }>().basePath('/api')

app.use("*", attachSession);
app.on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw));

app.route("/quiz", quizRoutes);

app.use("/admin/*", requireAuth, adminOnly);
app.route("/admin", adminRoutes);
app.route("/admin/settings", adminSettingsRoutes);

app.use("/openhouses", optionalAuth);
app.use("/openhouses/:id", optionalAuth);
app.use("/openhouses/:id/register", requireAuth);
app.route("/openhouses", openHouseRoutes);
app.route("/admin/openhouses", openHouseRoutes);

app.route("/schools", schoolRoutes);
app.route("/programs", programRoutes);
app.route("/favorites", favoritesRoutes);
app.route("/about", aboutRoutes);

app.use("/*", serveStatic({ root: "./public" }));

app.onError((error, c) => {
	console.error(error);
	return c.json({ error: "Internal server error" }, 500);
});

export default app;