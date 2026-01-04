// server/auth.js
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";
import { prisma } from "./db/prisma.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  session: {
    // DURASI SESI PENDEK (Tanpa Remember Me)
    expiresIn: 15 * 60, // 15 Menit
    
    // Perbarui session di DB setiap 5 menit jika user aktif
    updateAge: 5 * 60, 

    cookieCache: {
      enabled: true,
      // DURASI SESI PANJANG (Jika Remember Me dicentang)
      maxAge: 60 * 60 * 24 * 30, // 30 Hari
    },
  },

  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",") || ["http://localhost:5173"],

  emailAndPassword: { enabled: true },

  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
    }),
  ],

  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "ORANG_TUA" },
      displayUsername: { type: "string", required: false },
      posyanduId: { type: "number", required: false },
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true, // required for sameSite: "none"
      httpOnly: true,
    },
  },
});