import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-workers";

const app = new Hono();

app.use("/*", serveStatic({ root: "./public" }));

// TODO: migrate auth routes to Hono
// import authRoutes from "./routes/auth";
// app.route("/auth", authRoutes);

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

// TODO: migrate school routes to Hono
// import schoolRoutes from "./routes/schools";
// app.route("/schools", schoolRoutes);

// TODO: migrate program routes to Hono
// import programRoutes from "./routes/programs";
// app.route("/programs", programRoutes);

// TODO: migrate favorites routes to Hono
// import favoritesRoutes from "./routes/favorites";
// app.route("/favorites", favoritesRoutes);

app.get("/api/about", (c) =>
	c.json(
		{
			error:
				"About content is unavailable until AdminSettings persistence is migrated to the TanStack Start app.",
		},
		501,
	),
);

app.onError((error, c) => {
	console.error(error);
	return c.json({ error: "Internal server error" }, 500);
});

export default app;
