/**
 * Export Routes
 * Routes for data export functionality
 */

import { Hono } from "hono";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { exportPengukuran, exportAnak } from "../../controllers/export.controller.js";

const exportRoutes = new Hono();

// Apply auth middleware to all routes
exportRoutes.use("*", authMiddleware);

/**
 * Export Pengukuran Data
 * GET /api/v1/export/pengukuran
 * Roles: SUPER_ADMIN, ADMIN
 */
exportRoutes.get("/pengukuran", exportPengukuran);

/**
 * Export Anak Data
 * GET /api/v1/export/anak
 * Roles: SUPER_ADMIN, ADMIN
 */
exportRoutes.get("/anak", exportAnak);

export default exportRoutes;
