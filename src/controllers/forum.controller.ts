import type { Context } from "hono";
import {
  getAllForumsService,
  getForumByIdService,
  createForumService,
  updateForumService,
  deleteForumService,
  addCommentService,
  getForumCommentsService,
} from "../services/forum.service.js";
import { successResponse, errorResponse } from "../utils/response.helper.js";
import { uploadFile } from "../utils/file-upload.helper.js";

export const getAllForums = async (c: Context) => {
  try {
    const user = c.get("user");
    const page = Number(c.req.query("page")) || 1;
    const limit = Number(c.req.query("limit")) || 10;
    const search = c.req.query("search");
    const status = c.req.query("status");
    const posyanduId = c.req.query("posyanduId") 
      ? Number(c.req.query("posyanduId")) 
      : undefined;

    const result = await getAllForumsService(user, { 
      page, 
      limit, 
      search,
      status,
      posyanduId 
    });
    
    return successResponse(c, result.data, { meta: result.meta });
  } catch (error: any) {
    return errorResponse(c, error.message, { status: 500 });
  }
};

export const getForumById = async (c: Context) => {
  try {
    const id = parseInt(c.req.param("id"));
    const user = c.get("user");
    const forum = await getForumByIdService(id, user);
    return successResponse(c, forum);
  } catch (error: any) {
    const status = error.message.includes("tidak ditemukan") ? 404 : 403;
    return errorResponse(c, error.message, { status });
  }
};

export const getForumComments = async (c: Context) => {
  try {
    const id = parseInt(c.req.param("id"));
    const user = c.get("user");
    const page = Number(c.req.query("page")) || 1;
    const limit = Number(c.req.query("limit")) || 10;

    const result = await getForumCommentsService(id, user, { page, limit });
    return successResponse(c, result.data, { meta: result.meta });
  } catch (error: any) {
    const status = error.message.includes("tidak ditemukan") ? 404 : 403;
    return errorResponse(c, error.message, { status });
  }
};

export const createForum = async (c: Context) => {
  try {
    const user = c.get("user");
    
    const contentType = c.req.header("content-type") || "";
    let title: string;
    let content: string;
    let file: File | undefined;

    let attachmentUrl: string | undefined = undefined;
    let attachmentName: string | undefined = undefined;

    if (contentType.includes("multipart/form-data")) {
       const body = await c.req.parseBody();
       title = body["title"] as string;
       content = body["content"] as string;
       file = body["file"] as File | undefined;
       
       if (file && file instanceof File) {
         const uploadResult = await uploadFile(file);
         attachmentUrl = uploadResult.url;
         attachmentName = uploadResult.originalName;
       }
    } else {
       const body = await c.req.json();
       title = body.title;
       content = body.content;
    }

    const forumData = {
      title,
      content,
      attachmentUrl,
      attachmentName,
    };

    // Validasi manual karena Zod validator middleware mungkin sulit dengan form-data mixed
    if (!title || title.length < 5) throw new Error("Judul minimal 5 karakter");
    if (!content || content.length < 10) throw new Error("Konten minimal 10 karakter");

    const forum = await createForumService(forumData, user.id);
    return successResponse(c, forum, { status: 201 });
  } catch (error: any) {
    return errorResponse(c, error.message, { status: 400 });
  }
};

export const updateForum = async (c: Context) => {
  try {
    const id = parseInt(c.req.param("id"));
    const user = c.get("user");
    const body = await c.req.json();
    const forum = await updateForumService(id, body, user);
    return successResponse(c, forum);
  } catch (error: any) {
    const status = error.message.includes("tidak ditemukan") ? 404 : 403;
    return errorResponse(c, error.message, { status });
  }
};

export const deleteForum = async (c: Context) => {
  try {
    const id = parseInt(c.req.param("id"));
    const user = c.get("user");
    await deleteForumService(id, user);
    return successResponse(c, null, { message: "Forum berhasil dihapus" });
  } catch (error: any) {
    const status = error.message.includes("tidak ditemukan") ? 404 : 403;
    return errorResponse(c, error.message, { status });
  }
};

export const addComment = async (c: Context) => {
  try {
    const forumId = parseInt(c.req.param("id"));
    const user = c.get("user");
    const body = await c.req.json();
    const comment = await addCommentService(forumId, body, user);
    return successResponse(c, comment, { status: 201 });
  } catch (error: any) {
    const status = error.message.includes("tidak ditemukan") ? 404 : 403;
    return errorResponse(c, error.message, { status });
  }
};
