// src/middlewares/auth.middleware.ts
import { auth } from "../auth.js";
import { createMiddleware } from "hono/factory";

export const authMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  console.log(session);

  if (!session) {
    return c.json({ success: false, message: "Unauthorized: Silakan login terlebih dahulu" }, 401);
  }

  // Simpan data session ke dalam context agar bisa digunakan di controller jika butuh
  c.set("user", session.user);
  c.set("session", session.session);
  
  await next();
});