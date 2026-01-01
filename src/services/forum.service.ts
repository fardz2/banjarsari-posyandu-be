import { prisma } from "../db/prisma.js";
import type { User } from "../utils/interfaces/user.interface.js";
import type {
  CreateForumInput,
  UpdateForumInput,
  CreateCommentInput,
} from "../utils/interfaces/forum.interface.js";

/**
 * Get all forums (filtered by role)
 * - ORANG_TUA: Only see their own forums
 * - TENAGA_KESEHATAN: See all forums
 * - ADMIN/SUPER_ADMIN: See all forums
 */
export const getForumCommentsService = async (
  forumId: number,
  user: User,
  params?: { page?: number; limit?: number }
) => {
  // Check if forum exists and user has access (using existing service check)
  // We can't use getForumByIdService directly if we want to avoid double fetching,
  // but for access control it's safest.
  // Ideally we should extract access control logic, but reusing is fine for now.
  // However, getForumByIdService fetches ALL comments, which is heavy. 
  // Let's implement a lighter check.
  
  const forum = await prisma.forum.findUnique({
    where: { id: forumId },
    select: { id: true, createdById: true }
  });

  if (!forum) {
    throw new Error("Forum tidak ditemukan");
  }

  // ORANG_TUA can only access their own forums
  if (user.role === "ORANG_TUA" && forum.createdById !== user.id) {
    throw new Error("Tidak memiliki akses ke forum ini");
  }

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    prisma.forumComment.findMany({
      where: { forumId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "asc" },
    }),
    prisma.forumComment.count({ where: { forumId } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: comments,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

export const getAllForumsService = async (
  user: User,
  params?: { page?: number; limit?: number; search?: string }
) => {
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const search = params?.search;
  const skip = (page - 1) * limit;

  const where: any = {};

  // ORANG_TUA can only see their own forums
  if (user.role === "ORANG_TUA") {
    where.createdById = user.id;
  }
  // TENAGA_KESEHATAN, ADMIN, SUPER_ADMIN can see all forums

  // Search filter
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  const [forums, total] = await Promise.all([
    prisma.forum.findMany({
      where,
      skip,
      take: limit,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.forum.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: forums,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

/**
 * Get forum by ID with all comments
 */
export const getForumByIdService = async (id: number, user: User) => {
  const forum = await prisma.forum.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
              },
            },
          },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!forum) {
    throw new Error("Forum tidak ditemukan");
  }

  // ORANG_TUA can only access their own forums
  if (user.role === "ORANG_TUA" && forum.createdById !== user.id) {
    throw new Error("Tidak memiliki akses ke forum ini");
  }

  return forum;
};

/**
 * Create forum (ORANG_TUA only)
 */
export const createForumService = async (
  data: CreateForumInput,
  userId: string
) => {
  const forum = await prisma.forum.create({
    data: {
      title: data.title,
      content: data.content,
      attachmentUrl: data.attachmentUrl || null,
      attachmentName: data.attachmentName || null,
      createdById: userId,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
      _count: {
        select: {
          comments: true,
          },
        },
      },
  });

  return forum;
};

/**
 * Update forum (creator only)
 */
export const updateForumService = async (
  id: number,
  data: UpdateForumInput,
  user: User
) => {
  const forum = await prisma.forum.findUnique({
    where: { id },
  });

  if (!forum) {
    throw new Error("Forum tidak ditemukan");
  }

  // Only creator can update
  if (forum.createdById !== user.id) {
    throw new Error("Tidak memiliki akses untuk mengubah forum ini");
  }

  const updated = await prisma.forum.update({
    where: { id },
    data,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
      _count: {
        select: {
          comments: true,
          },
        },
      },
  });

  return updated;
};

/**
 * Delete forum (creator only)
 */
export const deleteForumService = async (id: number, user: User) => {
  const forum = await prisma.forum.findUnique({
    where: { id },
  });

  if (!forum) {
    throw new Error("Forum tidak ditemukan");
  }

  // Only creator can delete
  if (forum.createdById !== user.id) {
    throw new Error("Tidak memiliki akses untuk menghapus forum ini");
  }

  // Delete forum (comments will be cascade deleted)
  await prisma.forum.delete({
    where: { id },
  });

  // TODO: Delete attached file if exists
  // if (forum.attachmentUrl) {
  //   await deleteFile(forum.attachmentUrl);
  // }
};

/**
 * Add comment to forum
 */
export const addCommentService = async (
  forumId: number,
  data: CreateCommentInput,
  user: User
) => {
  // Verify forum exists and user has access
  const forum = await getForumByIdService(forumId, user);

  const comment = await prisma.forumComment.create({
    data: {
      content: data.content,
      forumId,
      userId: user.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  // Auto-update forum status to ANSWERED if comment is from TENAGA_KESEHATAN
  if (user.role === "TENAGA_KESEHATAN" && forum.status === "OPEN") {
    await prisma.forum.update({
      where: { id: forumId },
      data: { status: "ANSWERED" },
    });
  }

  return comment;
};
