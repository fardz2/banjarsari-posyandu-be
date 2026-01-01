// src/routes/index.ts
import { Hono } from "hono";
import v1 from "./v1/index.js";
import authRoutes from "./auth.routes.js"; // ← baru, kita buat nanti

const routes = new Hono();

// Mount Better Auth di luar versioning
// Endpoint: /api/auth/sign-in/email, /api/auth/sign-up/email, dll.
routes.route("/auth", authRoutes);

// Mount semua routes versi 1
routes.route("/v1", v1);

export default routes;