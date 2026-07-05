import { createHash, randomBytes } from "node:crypto";
import { createRequire } from "node:module";

import { Hono } from "hono";
import type { Context } from "hono";

import { prisma } from "../../db";

const require = createRequire(import.meta.url);

const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = "7d";
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

interface BcryptModule {
	hash(data: string, saltOrRounds: number): Promise<string>;
	compare(data: string, encrypted: string): Promise<boolean>;
}

interface JsonWebTokenModule {
	sign(
		payload: Record<string, string | number>,
		secretOrPrivateKey: string | undefined,
		options: { expiresIn: string },
	): string;
}

interface MailTransporter {
	sendMail(message: {
		from: string;
		to: string;
		subject: string;
		html: string;
	}): Promise<unknown>;
}

interface NodemailerModule {
	createTransport(options: {
		host: string | undefined;
		port: number;
		secure: boolean;
		auth: {
			user: string | undefined;
			pass: string | undefined;
		};
	}): MailTransporter;
}

interface UserRecord {
	id: number;
	name: string;
	email: string;
	password: string;
	role: string;
}

interface PasswordResetTokenRecord {
	id: string;
	token: string;
	userId: number;
	expiresAt: Date;
	used: boolean;
}

interface AuthDatabase {
	user: {
		findUnique(args: { where: { email: string } }): Promise<UserRecord | null>;
		create(args: {
			data: { name: string; email: string; password: string };
		}): Promise<UserRecord>;
		update(args: {
			where: { id: number };
			data: { password: string };
		}): Promise<UserRecord>;
	};
	passwordResetToken: {
		updateMany(args: {
			where: { userId: number; used: boolean };
			data: { used: boolean };
		}): Promise<unknown>;
		create(args: {
			data: { id: string; token: string; userId: number; expiresAt: Date };
		}): Promise<PasswordResetTokenRecord>;
		findUnique(args: {
			where: { token: string };
		}): Promise<PasswordResetTokenRecord | null>;
		update(args: {
			where: { id: string };
			data: { used: boolean };
		}): Promise<PasswordResetTokenRecord>;
	};
}

interface AuthBody {
	name?: string;
	email?: string;
	password?: string;
	token?: string;
	lang?: string;
}

const bcrypt = require("bcrypt") as BcryptModule;
const jwt = require("jsonwebtoken") as JsonWebTokenModule;
const nodemailer = require("nodemailer") as NodemailerModule;
const db = prisma as unknown as AuthDatabase;

const authRoutes = new Hono();

const readBody = async (c: Context) =>
	(await c.req.json().catch(() => ({}))) as AuthBody;

const makeTransporter = () =>
	nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: parseInt(process.env.SMTP_PORT || "587"),
		secure: process.env.SMTP_SECURE === "true",
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS,
		},
	});

const sendResetEmail = async (
	toEmail: string,
	toName: string,
	resetUrl: string,
	lang = "nl",
) => {
	const transporter = makeTransporter();

	const subject =
		lang === "nl"
			? "Wachtwoord opnieuw instellen — Studie4SU"
			: "Reset your password — Studie4SU";

	const html =
		lang === "nl"
			? `
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:520px;margin:0 auto;background:#0d2b1f;color:#f0f0f0;border-radius:12px;overflow:hidden;">
      <div style="padding:32px 32px 24px;border-bottom:1px solid rgba(232,184,75,0.2);">
        <span style="font-family:'Georgia',serif;font-size:1.4rem;color:#e8b84b;font-weight:700;">Studie<span style="color:#fff;">4SU</span></span>
      </div>
      <div style="padding:32px;">
        <h2 style="margin:0 0 12px;font-size:1.3rem;">Hoi ${toName},</h2>
        <p style="color:rgba(255,255,255,0.75);line-height:1.6;margin:0 0 24px;">
          We hebben een verzoek ontvangen om het wachtwoord van je Studie4SU-account opnieuw in te stellen.
          Klik op de knop hieronder om een nieuw wachtwoord te kiezen.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#e8b84b;color:#0d2b1f;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:0.95rem;">
          Wachtwoord opnieuw instellen
        </a>
        <p style="color:rgba(255,255,255,0.45);font-size:0.8rem;margin:24px 0 0;line-height:1.5;">
          Deze link is 1 uur geldig. Als jij dit niet hebt aangevraagd, kun je deze e-mail negeren.
        </p>
      </div>
    </div>`
			: `
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:520px;margin:0 auto;background:#0d2b1f;color:#f0f0f0;border-radius:12px;overflow:hidden;">
      <div style="padding:32px 32px 24px;border-bottom:1px solid rgba(232,184,75,0.2);">
        <span style="font-family:'Georgia',serif;font-size:1.4rem;color:#e8b84b;font-weight:700;">Studie<span style="color:#fff;">4SU</span></span>
      </div>
      <div style="padding:32px;">
        <h2 style="margin:0 0 12px;font-size:1.3rem;">Hi ${toName},</h2>
        <p style="color:rgba(255,255,255,0.75);line-height:1.6;margin:0 0 24px;">
          We received a request to reset the password for your Studie4SU account.
          Click the button below to choose a new password.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#e8b84b;color:#0d2b1f;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:0.95rem;">
          Reset my password
        </a>
        <p style="color:rgba(255,255,255,0.45);font-size:0.8rem;margin:24px 0 0;line-height:1.5;">
          This link is valid for 1 hour. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    </div>`;

	await transporter.sendMail({
		from: process.env.SMTP_FROM || `"Studie4SU" <${process.env.SMTP_USER}>`,
		to: toEmail,
		subject,
		html,
	});
};

const signUserToken = (user: UserRecord) =>
	jwt.sign(
		{ id: user.id, name: user.name, email: user.email, role: user.role },
		process.env.JWT_SECRET,
		{ expiresIn: JWT_EXPIRES_IN },
	);

authRoutes.post("/register", async (c) => {
	const { name, email, password } = await readBody(c);
	if (!name || !email || !password) {
		return c.json({ error: "All fields required" }, 400);
	}

	try {
		const existing = await db.user.findUnique({ where: { email } });
		if (existing) {
			return c.json({ error: "Email already in use" }, 409);
		}

		const hashed = await bcrypt.hash(password, SALT_ROUNDS);
		const user = await db.user.create({
			data: { name, email, password: hashed },
		});

		const token = signUserToken(user);
		return c.json({ token }, 201);
	} catch (error) {
		console.error("[register]", error);
		return c.json({ error: "Server error" }, 500);
	}
});

authRoutes.post("/login", async (c) => {
	const { email, password } = await readBody(c);
	if (!email || !password) {
		return c.json({ error: "Email and password required" }, 400);
	}

	try {
		const user = await db.user.findUnique({ where: { email } });
		if (!user) {
			return c.json({ error: "Invalid credentials" }, 401);
		}

		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			return c.json({ error: "Invalid credentials" }, 401);
		}

		const token = signUserToken(user);
		return c.json({ token });
	} catch (error) {
		console.error("[login]", error);
		return c.json({ error: "Server error" }, 500);
	}
});

authRoutes.post("/forgot-password", async (c) => {
	const { email, lang = "nl" } = await readBody(c);

	if (!email) {
		return c.json({ error: "Email required" }, 400);
	}

	try {
		const user = await db.user.findUnique({ where: { email } });

		if (!user) {
			console.log(
				`[forgotPassword] No user found for ${email} — returning silent success`,
			);
			return c.json({ success: true });
		}

		await db.passwordResetToken.updateMany({
			where: { userId: user.id, used: false },
			data: { used: true },
		});

		const rawToken = randomBytes(32).toString("hex");
		const hashedToken = createHash("sha256").update(rawToken).digest("hex");
		const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

		await db.passwordResetToken.create({
			data: {
				id: randomBytes(16).toString("hex"),
				token: hashedToken,
				userId: user.id,
				expiresAt,
			},
		});

		const baseUrl = process.env.APP_URL || "http://localhost:3000";
		const resetUrl = `${baseUrl}/reset-password.html?token=${rawToken}`;

		console.log(`[forgotPassword] Sending reset email to ${user.email}`);
		await sendResetEmail(user.email, user.name, resetUrl, lang);
		console.log("[forgotPassword] Email sent OK");

		return c.json({ success: true });
	} catch (error) {
		console.error(
			"[forgotPassword] ERROR:",
			error instanceof Error ? error.message : error,
		);
		return c.json({ error: "Server error" }, 500);
	}
});

authRoutes.post("/reset-password", async (c) => {
	const { token, password } = await readBody(c);

	if (!token || !password) {
		return c.json({ error: "Token and password required" }, 400);
	}
	if (password.length < 8) {
		return c.json({ error: "Password must be at least 8 characters" }, 400);
	}

	try {
		const hashedToken = createHash("sha256").update(token).digest("hex");

		const record = await db.passwordResetToken.findUnique({
			where: { token: hashedToken },
		});

		if (!record) {
			return c.json({ error: "Invalid or expired reset link" }, 400);
		}
		if (record.used) {
			return c.json({ error: "This link has already been used" }, 400);
		}
		if (record.expiresAt < new Date()) {
			return c.json({ error: "This link has expired" }, 400);
		}

		const hashed = await bcrypt.hash(password, SALT_ROUNDS);

		await db.user.update({
			where: { id: record.userId },
			data: { password: hashed },
		});

		await db.passwordResetToken.update({
			where: { id: record.id },
			data: { used: true },
		});

		return c.json({ success: true });
	} catch (error) {
		console.error("[resetPassword]", error);
		return c.json({ error: "Server error" }, 500);
	}
});

authRoutes.get("/validate-reset-token", async (c) => {
	const token = c.req.query("token");
	if (!token) {
		return c.json({ valid: false }, 400);
	}

	try {
		const hashedToken = createHash("sha256").update(token).digest("hex");
		const record = await db.passwordResetToken.findUnique({
			where: { token: hashedToken },
		});

		if (!record || record.used || record.expiresAt < new Date()) {
			return c.json({ valid: false });
		}

		return c.json({ valid: true });
	} catch (error) {
		console.error("[validateResetToken]", error);
		return c.json({ valid: false }, 500);
	}
});

export default authRoutes;
