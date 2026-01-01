import { z } from "zod";

export const createForumSchema = z.object({
  title: z
    .string()
    .min(5, "Judul minimal 5 karakter")
    .max(200, "Judul maksimal 200 karakter"),
  content: z.string().min(10, "Konten minimal 10 karakter"),
  attachmentUrl: z.string().url().optional(),
  attachmentName: z.string().optional(),
});

export const updateForumSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  content: z.string().min(10).optional(),
  status: z.enum(["OPEN", "ANSWERED", "CLOSED"]).optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, "Komentar tidak boleh kosong"),
});
