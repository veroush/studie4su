import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '#/db'
import { sendResetPasswordEmail } from './email/send-reset-password-email'

// Docs: https://www.better-auth.com/docs/adapters/prisma
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

    telemetry: { enabled: false },

  emailAndPassword: {
    enabled: true,
    resetPasswordTokenExpiresIn: 3600, // 1 hour — matches v1's RESET_TOKEN_TTL_MS
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail(user.email, user.name, url)
    },
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
