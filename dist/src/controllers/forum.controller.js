import { getAllForumsService, getForumByIdService, createForumService, updateForumService, deleteForumService, addCommentService, getForumCommentsService, } from "../services/forum.service.js";
import { successResponse, errorResponse } from "../utils/response.helper.js";
import { uploadFile } from "../utils/file-upload.helper.js";
export const getAllForums = async (c) => {
    try {
        const user = c.get("user");
        const page = Number(c.req.query("page")) || 1;
        const limit = Number(c.req.query("limit")) || 10;
        const search = c.req.query("search");
        const result = await getAllForumsService(user, { page, limit, search });
        return successResponse(c, result.data, { meta: result.meta });
    }
    catch (error) {
        return errorResponse(c, error.message, { status: 500 });
    }
};
export const getForumById = async (c) => {
    try {
        const id = parseInt(c.req.param("id"));
        const user = c.get("user");
        const forum = await getForumByIdService(id, user);
        return successResponse(c, forum);
    }
    catch (error) {
        const status = error.message.includes("tidak ditemukan") ? 404 : 403;
        return errorResponse(c, error.message, { status });
    }
};
export const getForumComments = async (c) => {
    try {
        const id = parseInt(c.req.param("id"));
        const user = c.get("user");
        const page = Number(c.req.query("page")) || 1;
        const limit = Number(c.req.query("limit")) || 10;
        const result = await getForumCommentsService(id, user, { page, limit });
        return successResponse(c, result.data, { meta: result.meta });
    }
    catch (error) {
        const status = error.message.includes("tidak ditemukan") ? 404 : 403;
        return errorResponse(c, error.message, { status });
    }
};
export const createForum = async (c) => {
    try {
        const user = c.get("user");
        const contentType = c.req.header("content-type") || "";
        let title;
        let content;
        let file;
        let attachmentUrl = undefined;
        let attachmentName = undefined;
        if (contentType.includes("multipart/form-data")) {
            const body = await c.req.parseBody();
            title = body["title"];
            content = body["content"];
            file = body["file"];
            if (file && file instanceof File) {
                const uploadResult = await uploadFile(file);
                attachmentUrl = uploadResult.url;
                attachmentName = uploadResult.originalName;
            }
        }
        else {
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
        if (!title || title.length < 5)
            throw new Error("Judul minimal 5 karakter");
        if (!content || content.length < 10)
            throw new Error("Konten minimal 10 karakter");
        const forum = await createForumService(forumData, user.id);
        return successResponse(c, forum, { status: 201 });
    }
    catch (error) {
        return errorResponse(c, error.message, { status: 400 });
    }
};
export const updateForum = async (c) => {
    try {
        const id = parseInt(c.req.param("id"));
        const user = c.get("user");
        const body = await c.req.json();
        const forum = await updateForumService(id, body, user);
        return successResponse(c, forum);
    }
    catch (error) {
        const status = error.message.includes("tidak ditemukan") ? 404 : 403;
        return errorResponse(c, error.message, { status });
    }
};
export const deleteForum = async (c) => {
    try {
        const id = parseInt(c.req.param("id"));
        const user = c.get("user");
        await deleteForumService(id, user);
        return successResponse(c, null, { message: "Forum berhasil dihapus" });
    }
    catch (error) {
        const status = error.message.includes("tidak ditemukan") ? 404 : 403;
        return errorResponse(c, error.message, { status });
    }
};
export const addComment = async (c) => {
    try {
        const forumId = parseInt(c.req.param("id"));
        const user = c.get("user");
        const body = await c.req.json();
        const comment = await addCommentService(forumId, body, user);
        return successResponse(c, comment, { status: 201 });
    }
    catch (error) {
        const status = error.message.includes("tidak ditemukan") ? 404 : 403;
        return errorResponse(c, error.message, { status });
    }
};
