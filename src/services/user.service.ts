// src/services/user.service.ts

import { prisma } from '../db/prisma.js';
import { Role } from "@prisma/client";
import {
  canAccessAllPosyandu,
  canCreateUser,
  canUpdateUser,
  canDeleteUser,
  getPosyanduFilter,
  requirePermission,
  type UserContext,
} from '../utils/permission.helper.js';
import type {
  UserResponse,
  CreateUserInput,
  UpdateUserInput,
} from '../utils/interfaces/user.interface.js';
import { auth } from '../auth.js';

// SERVICE: Create user baru
export const createUserService = async (
  data: CreateUserInput,
  requestingUser: UserContext
): Promise<UserResponse> => {
  // Check granular permission
  requirePermission(
    canCreateUser(requestingUser.role),
    'Anda tidak memiliki permission untuk membuat user'
  );

  // Special restriction for KADER_POSYANDU: Can only create ORANG_TUA
  if (requestingUser.role === 'KADER_POSYANDU') {
    if (data.role && data.role !== 'ORANG_TUA') {
      throw new Error('Kader hanya bisa membuat user dengan role Orang Tua');
    }
    // Force role to ORANG_TUA if not specified (though validation might require it)
    if (!data.role) data.role = 'ORANG_TUA';
  }

  // Admin & Kader hanya bisa create user untuk posyandu sendiri
  if (requestingUser.role === 'ADMIN' || requestingUser.role === 'KADER_POSYANDU') {
    if (data.posyanduId && data.posyanduId !== requestingUser.posyanduId) {
      throw new Error('Anda hanya bisa membuat user untuk posyandu sendiri');
    }
    // Set posyanduId ke posyandu user jika tidak diisi
    if (!data.posyanduId) {
      data.posyanduId = requestingUser.posyanduId || undefined;
    }
  }

  // Create user menggunakan Better Auth
  const result = await auth.api.signUpEmail({
    body: {
      email: data.email,
      password: data.password,
      name: data.name,
      username: data.username,
    },
  });

  if (!result || !result.user) {
    throw new Error('Gagal membuat user');
  }

  // Update role dan posyanduId jika ada
  const updatedUser = await prisma.user.update({
    where: { id: result.user.id },
    data: {
      role: data.role || 'ORANG_TUA',
      posyanduId: data.posyanduId || null,
      jenisKelamin: data.jenisKelamin,
    },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      jenisKelamin: true,
      role: true,
      posyanduId: true,
      posyandu: {
        select: {
          id: true,
          nama: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

// SERVICE: Ambil semua user (filtered by permission)
export const getAllUsersService = async (
  requestingUser: UserContext,
  filters?: { 
    role?: string; // Comma-separated roles for multiselect
    posyanduId?: string; // Comma-separated posyandu IDs for multiselect
    unassignedOrtu?: boolean; 
    jenisKelamin?: string 
  }
): Promise<UserResponse[]> => {
  const posyanduFilter = getPosyanduFilter(requestingUser);

  // Build where clause with filters
  const where: any = { ...posyanduFilter };

  // Apply role filter if provided (support comma-separated values)
  if (filters?.role) {
    const roles = filters.role.split(',').map(r => r.trim()) as Role[];
    if (roles.length === 1) {
      where.role = roles[0];
    } else {
      where.role = { in: roles };
    }
  }

  // Filter unassigned users (users NOT in Ortu table as Ayah OR Ibu)
  if (filters?.unassignedOrtu) {
    where.ortuAsAyah = { none: {} };
    where.ortuAsIbu = { none: {} };
  }

  // Apply posyandu filter if provided (only for SUPER_ADMIN)
  // Support comma-separated values for multiselect
  // ADMIN/KADER/NAKES already filtered by getPosyanduFilter
  if (filters?.posyanduId && canAccessAllPosyandu(requestingUser.role)) {
    const posyanduIds = filters.posyanduId.split(',').map(id => parseInt(id.trim()));
    if (posyanduIds.length === 1) {
      where.posyanduId = posyanduIds[0];
    } else {
      where.posyanduId = { in: posyanduIds };
    }
  }

  // Filter by gender
  if (filters?.jenisKelamin) {
    where.jenisKelamin = filters.jenisKelamin;
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      jenisKelamin: true,
      role: true,
      posyanduId: true,
      posyandu: {
        select: {
          id: true,
          nama: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return users;
};

// SERVICE: Get user by ID
export const getUserByIdService = async (
  userId: string,
  requestingUser: UserContext
): Promise<UserResponse> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      jenisKelamin: true,
      role: true,
      posyanduId: true,
      posyandu: {
        select: {
          id: true,
          nama: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error('User tidak ditemukan');
  }

  // Check permission: super admin bisa lihat semua, others scoped
  if (!canAccessAllPosyandu(requestingUser.role)) {
    if (user.posyanduId !== requestingUser.posyanduId) {
      throw new Error('Anda tidak memiliki akses ke user ini');
    }
  }

  return user;
};

// SERVICE: Update user
export const updateUserService = async (
  userId: string,
  data: UpdateUserInput,
  requestingUser: UserContext
): Promise<UserResponse> => {
  // Get existing user
  const existingUser = await getUserByIdService(userId, requestingUser);

  // Permission check
  requirePermission(
    canUpdateUser(requestingUser.role),
    'Anda tidak memiliki permission untuk update user'
  );

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      username: data.username,
      posyanduId: data.posyanduId,
      jenisKelamin: data.jenisKelamin,
    },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      jenisKelamin: true,
      role: true,
      posyanduId: true,
      posyandu: {
        select: {
          id: true,
          nama: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

// SERVICE: Delete user
export const deleteUserService = async (
  userId: string,
  requestingUser: UserContext
): Promise<boolean> => {
  // Get existing user
  await getUserByIdService(userId, requestingUser);

  requirePermission(
    canDeleteUser(requestingUser.role),
    'Anda tidak memiliki permission untuk menghapus user'
  );

  await prisma.user.delete({
    where: { id: userId },
  });

  return true;
};

// SERVICE: Assign role to user (super admin only)
export const assignRoleService = async (
  userId: string,
  role: Role,
  requestingUser: UserContext
): Promise<UserResponse> => {
  // Only super admin can assign roles
  requirePermission(
    requestingUser.role === 'SUPER_ADMIN',
    'Hanya Super Admin yang bisa assign role'
  );

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      jenisKelamin: true,
      role: true,
      posyanduId: true,
      posyandu: {
        select: {
          id: true,
          nama: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

// SERVICE: Get current user profile
export const getUserProfileService = async (
  userId: string
): Promise<UserResponse> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      jenisKelamin: true,
      role: true,
      posyanduId: true,
      posyandu: {
        select: {
          id: true,
          nama: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error('User tidak ditemukan');
  }

  return user;
};

// SERVICE: Update current user profile
export const updateUserProfileService = async (
  userId: string,
  data: { name?: string; username?: string }
): Promise<UserResponse> => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      username: data.username,
    },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      jenisKelamin: true,
      role: true,
      posyanduId: true,
      posyandu: {
        select: {
          id: true,
          nama: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

