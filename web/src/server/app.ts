import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-workers";

import aboutRoutes from "./routes/about";
import authRoutes from "./routes/auth";
import programRoutes from "./routes/programs";
import schoolRoutes from "./routes/schools";

const app = new Hono();

app.use("/*", serveStatic({ root: "./public" }));

app.route("/auth", authRoutes);

// TODO: migrate quiz routes to Hono
// import quizRoutes from "./routes/quiz";
// app.route("/api/quiz", quizRoutes);

// TODO: migrate requireAuth and adminOnly middleware to Hono before mounting admin routes
// TODO: migrate admin routes to Hono
// import adminRoutes from "./routes/admin";
// app.route("/admin", adminRoutes);

// TODO: migrate admin settings routes to Hono
// import adminSettingsRoutes from "./routes/admin-settings";
// app.route("/admin/settings", adminSettingsRoutes);

// TODO: migrate open house routes to Hono
// import openHouseRoutes from "./routes/open-houses";
// app.route("/openhouses", openHouseRoutes);
// app.route("/admin/openhouses", openHouseRoutes);

app.route("/schools", schoolRoutes);

app.route("/programs", programRoutes);

// TODO: migrate favorites routes to Hono
// import favoritesRoutes from "./routes/favorites";
// app.route("/favorites", favoritesRoutes);

app.route("/api/about", aboutRoutes);

app.onError((error, c) => {
	console.error(error);
	return c.json({ error: "Internal server error" }, 500);
});

export default app;
