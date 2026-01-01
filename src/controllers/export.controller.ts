/**
 * Export Controller
 * Handles export requests with validation and RBAC
 * Returns Excel files as downloadable attachments
 */


import type { Context } from "hono";
import { exportPengukuranService, exportAnakService } from "../services/export.service.js";

/**
 * Export Pengukuran Data
 * GET /api/v1/export/pengukuran
 * Query params: startDate, endDate, posyanduId (optional, SUPER_ADMIN only)
 * Returns: Excel file
 */
export const exportPengukuran = async (c: Context) => {
  const user = c.get("user");
  
  // RBAC: Only SUPER_ADMIN and ADMIN can export
  if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
    return c.json(
      {
        success: false,
        message: "Anda tidak memiliki izin untuk export data",
      },
      403
    );
  }
  
  // Get query parameters
  const startDate = c.req.query("startDate");
  const endDate = c.req.query("endDate");
  const posyanduId = c.req.query("posyanduId");

  // Validate date range
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return c.json(
        {
          success: false,
          message: "Tanggal mulai tidak boleh lebih besar dari tanggal akhir",
        },
        400
      );
    }
  }

  // Generate Excel file
  const buffer = await exportPengukuranService(user, {
    startDate,
    endDate,
    posyanduId,
  });

  // Generate filename
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const filename = `Pengukuran_${date}.xlsx`;

  // Set headers for file download
  c.header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  c.header("Content-Disposition", `attachment; filename="${filename}"`);
  c.header("Content-Length", buffer.length.toString());

  return c.body(buffer);
};

/**
 * Export Anak Data
 * GET /api/v1/export/anak
 * Query params: startDate, endDate, posyanduId (optional, SUPER_ADMIN only)
 * Returns: Excel file
 */
export const exportAnak = async (c: Context) => {
  const user = c.get("user");
  
  // RBAC: Only SUPER_ADMIN and ADMIN can export
  if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
    return c.json(
      {
        success: false,
        message: "Anda tidak memiliki izin untuk export data",
      },
      403
    );
  }
  
  // Get query parameters
  const startDate = c.req.query("startDate");
  const endDate = c.req.query("endDate");
  const posyanduId = c.req.query("posyanduId");

  // Validate date range
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return c.json(
        {
          success: false,
          message: "Tanggal mulai tidak boleh lebih besar dari tanggal akhir",
        },
        400
      );
    }
  }

  // Generate Excel file
  const buffer = await exportAnakService(user, {
    startDate,
    endDate,
    posyanduId,
  });

  // Generate filename
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const filename = `Data_Anak_${date}.xlsx`;

  // Set headers for file download
  c.header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  c.header("Content-Disposition", `attachment; filename="${filename}"`);
  c.header("Content-Length", buffer.length.toString());

  return c.body(buffer);
};
