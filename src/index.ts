import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";
import { cors } from "hono/cors";
import routes from "./routes/index.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";

import { apiKeyMiddleware } from "./middlewares/api-key.middleware.js";

// Export app untuk Vercel (Serverless)
export const app = new Hono();

// CORS – WAJIB diatur dengan benar untuk Better Auth (cookie session)
app.use(
  "*",
  cors({
    origin: (origin) => {
      // Allow local development and production domains
      if (!origin) return "http://localhost:5173"; // Fallback
      if (
        origin === "http://localhost:5173" ||
        origin === "https://kms-banjarsari.vercel.app" || 
        origin.endsWith(".vercel.app") // Optional: Allow preview deployments
      ) {
        return origin;
      }
      return "http://localhost:5173"; // Block others or default
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization", "x-api-key"], 
    credentials: true, // PENTING agar cookie session terkirim
    maxAge: 600,
  })
);

// Apply API Key Middleware globally to /api/*
app.use("/api/*", apiKeyMiddleware);

// Mount semua routes (sudah termasuk /api/auth dan /api/v1)
app.route("/api", routes);

// Global error handler (harus paling akhir sebelum notFound)
app.onError(globalErrorHandler);

// Not found handler
app.notFound((c) => {
  return c.json({ success: false, message: "Route tidak ditemukan" }, 404);
});

// Jalankan server HANYA jika file ini dijalankan langsung (bukan diimport)
// Helper to check if file is main module (works for ES Modules)
import { fileURLToPath } from "url";
import path from "path";

const isMainModule = (metaUrl: string) => {
  if (!metaUrl) return false;
  const modulePath = fileURLToPath(metaUrl);
  const entryPath = process.argv[1];
  
  // Normalize paths for Windows/Unix compatibility
  return path.resolve(modulePath) === path.resolve(entryPath);
};

// Jalankan server HANYA jika file ini dijalankan langsung
if (isMainModule(import.meta.url)) {
  const port = Number(process.env.PORT) || 3001;
  serve(
    {
      fetch: app.fetch,
      port,
    },
    (info) => {
      console.log(`🚀 Server Posyandu berjalan di http://localhost:${info.port}`);
      console.log(`📡 API Version 1: http://localhost:${info.port}/api/v1`);
      console.log(
        `🔐 Auth endpoints: http://localhost:${info.port}/api/auth/...`
      );
    }
  );
}

