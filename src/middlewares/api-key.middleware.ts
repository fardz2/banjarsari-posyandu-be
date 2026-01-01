
import type { Context, Next } from "hono";
export const apiKeyMiddleware = async (c: Context, next: Next) => {
  // Skip check for public routes if needed, but for "double protection" we usually want it everywhere except maybe webhooks if any.
  // We'll apply it globally for /api routes.
  
  // Skip for auth routes if they are called from browser directly without API key? 
  // Ideally FE sends API key for everything.
  
  const apiKey = c.req.header("x-api-key");
  const envApiKeys = process.env.API_KEY;

  if (!envApiKeys) {
    console.warn("API_KEY is not set in environment variables!");
    return c.json({ success: false, message: "Server misconfiguration: API Key missing" }, 500);
  }

  // Support multiple keys for rotation (comma separated)
  const validKeys = envApiKeys.split(",").map((k) => k.trim());

  if (!apiKey || !validKeys.includes(apiKey)) {
    return c.json({ success: false, message: "Invalid or missing API Key" }, 403);
  }

  await next();
};
