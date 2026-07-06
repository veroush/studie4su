import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-workers";

import { adminOnly, optionalAuth, requireAuth } from "./middleware/auth";
import type { AuthVariables } from "./middleware/auth";
import aboutRoutes from "./routes/about";
import adminRoutes from "./routes/admin";
import adminSettingsRoutes from "./routes/admin-settings";
import authRoutes from "./routes/auth";
import favoritesRoutes from "./routes/favorites";
import openHouseRoutes from "./routes/open-houses";
import programRoutes from "./routes/programs";
import quizRoutes from "./routes/quiz";
import schoolRoutes from "./routes/schools";

const app = new Hono<{ Variables: AuthVariables }>();

app.use("/*", serveStatic({ root: "./public" }));

app.route("/auth", authRoutes);
app.route("/api/quiz", quizRoutes);

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
app.route("/api/about", aboutRoutes);

app.onError((error, c) => {
	console.error(error);
	return c.json({ error: "Internal server error" }, 500);
});

export default app;
