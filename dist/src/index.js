import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";
import { cors } from "hono/cors";
import routes from "./routes/index.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
const app = new Hono();
// CORS – WAJIB diatur dengan benar untuk Better Auth (cookie session)
app.use("*", cors({
    origin: "http://localhost:5173",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true, // PENTING agar cookie session terkirim
    maxAge: 600,
}));
// Mount semua routes (sudah termasuk /api/auth dan /api/v1)
app.route("/api", routes);
// Global error handler (harus paling akhir sebelum notFound)
app.onError(globalErrorHandler);
// Not found handler
app.notFound((c) => {
    return c.json({ success: false, message: "Route tidak ditemukan" }, 404);
});
// Jalankan server
const port = Number(process.env.PORT) || 3001;
serve({
    fetch: app.fetch,
    port,
}, (info) => {
    console.log(`🚀 Server Posyandu berjalan di http://localhost:${info.port}`);
    console.log(`📡 API Version 1: http://localhost:${info.port}/api/v1`);
    console.log(`🔐 Auth endpoints: http://localhost:${info.port}/api/auth/...`);
});
