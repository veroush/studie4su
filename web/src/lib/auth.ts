import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '#/db'

// Docs: https://www.better-auth.com/docs/adapters/prisma
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  emailAndPassword: {
    enabled: true,
    // TODO: wire up a real sendResetPassword (e.g. reuse the
    // Nodemailer HTML template that currently lives in the old
    // src/server/routes/auth.ts forgot-password handler) once we
    // retire that route. Without this, "forgot password" has no
    // way to actually email the user.
    // sendResetPassword: async ({ user, url }) => { ... },
  },

  // Carries over the v1 User.role field so `session.user.role`
  // is available on both server and client.
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'student',
        input: false, // clients can't set their own role on sign-up
      },
      avatar: {
        type: 'string',
        defaultValue: 'graduate',
        input: true,
      },
      emailAnnouncements: {
        type: 'boolean',
        defaultValue: false,
        input: true,
      },
      emailResources: {
        type: 'boolean',
        defaultValue: false,
        input: true,
      },
      emailImportant: {
        type: 'boolean',
        defaultValue: true,
        input: true,
      },
      platformUpdates: {
        type: 'boolean',
        defaultValue: false,
        input: true,
      },
      platformAlerts: {
        type: 'boolean',
        defaultValue: true,
        input: true,
      },
    },
    deleteUser: {
      enabled: true,
    },
  },

  // rrd added 217
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  trustedOrigins: [process.env.WEB_URL ?? 'http://localhost:3000'],
  secret: process.env.BETTER_AUTH_SECRET,

  plugins: [tanstackStartCookies()],
})
