// src/utils/permission.helper.ts

import { Role } from "@prisma/client";

export interface UserContext {
  id: string;
  role: Role;
  posyanduId: number | null;
}

/**
 * Check apakah role bisa akses semua posyandu (Super Admin & Nakes)
 * Note: Nakes hanya bisa VIEW, tapi view semua posyandu
 */
export const canAccessAllPosyandu = (role: Role): boolean => {
  return role === 'SUPER_ADMIN' || role === 'TENAGA_KESEHATAN';
};

/**
 * --- USER MANAGEMENT PERMISSIONS ---
 */

export const canCreateUser = (role: Role): boolean => {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'KADER_POSYANDU';
};

export const canUpdateUser = (role: Role): boolean => {
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
};

export const canDeleteUser = (role: Role): boolean => {
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
};

/**
 * --- MEDICAL DATA PERMISSIONS (Anak, Ibu Hamil) ---
 */

export const canCreateMedicalData = (role: Role): boolean => {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'KADER_POSYANDU';
};

export const canUpdateMedicalData = (role: Role): boolean => {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'KADER_POSYANDU';
};

export const canDeleteMedicalData = (role: Role): boolean => {
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
};

/**
 * --- PENGUKURAN PERMISSIONS ---
 */

export const canCreatePengukuran = (role: Role): boolean => {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'KADER_POSYANDU';
};

// Kader BISA update pengukuran
export const canUpdatePengukuran = (role: Role): boolean => {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'KADER_POSYANDU';
};

export const canDeletePengukuran = (role: Role): boolean => {
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
};

/**
 * --- POSYANDU MANAGEMENT ---
 */

export const canManagePosyandu = (role: Role): boolean => {
  return role === 'SUPER_ADMIN';
};

/**
 * --- FORUM PERMISSIONS ---
 */
export const canAnswerForum = (role: Role): boolean => {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'TENAGA_KESEHATAN';
};

/**
 * Check apakah user bisa akses posyandu tertentu
 */
export const canAccessPosyandu = (
  user: UserContext,
  posyanduId: number
): boolean => {
  // Super admin dan Tenaga Kesehatan bisa akses semua posyandu (Nakes read-only)
  if (user.role === 'SUPER_ADMIN' || user.role === 'TENAGA_KESEHATAN') {
    return true;
  }

  // Role lain hanya bisa akses posyandu sendiri
  return user.posyanduId === posyanduId;
};

/**
 * Get posyandu IDs yang bisa diakses oleh user
 */
export const getAccessiblePosyanduIds = (
  user: UserContext
): number[] | 'ALL' => {
  if (user.role === 'SUPER_ADMIN' || user.role === 'TENAGA_KESEHATAN') {
    return 'ALL';
  }

  if (user.posyanduId) {
    return [user.posyanduId];
  }

  return [];
};

/**
 * Filter query berdasarkan posyandu access
 * Returns Prisma where clause untuk posyandu filtering
 */
export const getPosyanduFilter = (user: UserContext) => {
  const accessibleIds = getAccessiblePosyanduIds(user);

  if (accessibleIds === 'ALL') {
    return {}; // No filter, akses semua
  }

  if (accessibleIds.length === 0) {
    // User tidak punya akses ke posyandu manapun
    return { posyanduId: -1 }; // Filter yang pasti tidak match
  }

  return {
    posyanduId: {
      in: accessibleIds,
    },
  };
};

/**
 * Check apakah user adalah owner dari resource
 */
export const isResourceOwner = (
  user: UserContext,
  resourceUserId: string | null
): boolean => {
  return user.id === resourceUserId;
};

/**
 * Validate user punya akses ke posyandu tertentu, throw error jika tidak
 */
export const requirePosyanduAccess = (
  user: UserContext,
  posyanduId: number,
  resourceName: string = 'resource'
): void => {
  if (!canAccessPosyandu(user, posyanduId)) {
    throw new Error(
      `Anda tidak memiliki akses ke ${resourceName} di posyandu ini`
    );
  }
};

/**
 * Validate user punya permission tertentu, throw error jika tidak
 */
export const requirePermission = (
  condition: boolean,
  message: string = 'Anda tidak memiliki permission untuk aksi ini'
): void => {
  if (!condition) {
    throw new Error(message);
  }
};
