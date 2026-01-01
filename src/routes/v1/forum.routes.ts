import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import {
  createForumSchema,
  updateForumSchema,
  createCommentSchema,
} from "../../utils/validations/forum.validation.js";
import {
  getAllForums,
  getForumById,
  createForum,
  updateForum,
  deleteForum,
  addComment,
  getForumComments,
} from "../../controllers/forum.controller.js";

const forumRoutes = new Hono();

// All routes require authentication
forumRoutes.use("*", authMiddleware);

// Get all forums (ORANG_TUA sees own, TENAGA_KESEHATAN/ADMIN/SUPER_ADMIN sees all)
forumRoutes.get(
  "/",
  requireRole("ORANG_TUA", "TENAGA_KESEHATAN", "ADMIN", "SUPER_ADMIN"),
  getAllForums
);

// Get forum by ID
forumRoutes.get(
  "/:id",
  requireRole("ORANG_TUA", "TENAGA_KESEHATAN", "ADMIN", "SUPER_ADMIN"),
  getForumById
);

// Get forum comments (paginated)
forumRoutes.get(
  "/:id/comments",
  requireRole("ORANG_TUA", "TENAGA_KESEHATAN", "ADMIN", "SUPER_ADMIN"),
  getForumComments
);

// Create forum
forumRoutes.post(
  "/",
  requireRole("ORANG_TUA", "SUPER_ADMIN"),
  // zValidator removed because we use multipart/form-data and manual validation in controller
  createForum
);

// Update forum (creator only)
forumRoutes.put(
  "/:id",
  requireRole("ORANG_TUA", "SUPER_ADMIN"),
  zValidator("json", updateForumSchema),
  updateForum
);

// Delete forum (creator only)
forumRoutes.delete("/:id", requireRole("ORANG_TUA", "SUPER_ADMIN"), deleteForum);

// Add comment (both ORANG_TUA and TENAGA_KESEHATAN)
forumRoutes.post(
  "/:id/comments",
  requireRole("ORANG_TUA", "TENAGA_KESEHATAN", "SUPER_ADMIN"),
  zValidator("json", createCommentSchema),
  addComment
);

export default forumRoutes;
