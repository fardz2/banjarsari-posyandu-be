// src/routes/auth.routes.ts
import { Hono } from "hono";
import { auth } from "../auth.js";
const authRoutes = new Hono();
// Better Auth handler otomatis menangani semua endpoint auth
// Contoh endpoint yang otomatis tersedia:
// POST  /api/auth/sign-up/email
// POST  /api/auth/sign-in/email
// POST  /api/auth/sign-out
// GET   /api/auth/session
// POST  /api/auth/forgot-password
// dll.
authRoutes.on(["GET", "POST", "PUT", "DELETE"], "/*", async (c) => {
    return auth.handler(c.req.raw);
});
export default authRoutes;
