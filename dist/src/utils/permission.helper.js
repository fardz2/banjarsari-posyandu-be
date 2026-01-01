// src/utils/permission.helper.ts
/**
 * Check apakah role bisa akses semua posyandu (Super Admin & Nakes)
 * Note: Nakes hanya bisa VIEW, tapi view semua posyandu
 */
export const canAccessAllPosyandu = (role) => {
    return role === 'SUPER_ADMIN' || role === 'TENAGA_KESEHATAN';
};
/**
 * --- USER MANAGEMENT PERMISSIONS ---
 */
export const canCreateUser = (role) => {
    return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'KADER_POSYANDU';
};
export const canUpdateUser = (role) => {
    return role === 'SUPER_ADMIN' || role === 'ADMIN';
};
export const canDeleteUser = (role) => {
    return role === 'SUPER_ADMIN' || role === 'ADMIN';
};
/**
 * --- MEDICAL DATA PERMISSIONS (Anak, Ibu Hamil) ---
 */
export const canCreateMedicalData = (role) => {
    return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'KADER_POSYANDU';
};
export const canUpdateMedicalData = (role) => {
    return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'KADER_POSYANDU';
};
export const canDeleteMedicalData = (role) => {
    return role === 'SUPER_ADMIN' || role === 'ADMIN';
};
/**
 * --- PENGUKURAN PERMISSIONS ---
 */
export const canCreatePengukuran = (role) => {
    return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'KADER_POSYANDU';
};
// Kader BISA update pengukuran
export const canUpdatePengukuran = (role) => {
    return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'KADER_POSYANDU';
};
export const canDeletePengukuran = (role) => {
    return role === 'SUPER_ADMIN' || role === 'ADMIN';
};
/**
 * --- POSYANDU MANAGEMENT ---
 */
export const canManagePosyandu = (role) => {
    return role === 'SUPER_ADMIN';
};
/**
 * --- FORUM PERMISSIONS ---
 */
export const canAnswerForum = (role) => {
    return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'TENAGA_KESEHATAN';
};
/**
 * Check apakah user bisa akses posyandu tertentu
 */
export const canAccessPosyandu = (user, posyanduId) => {
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
export const getAccessiblePosyanduIds = (user) => {
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
export const getPosyanduFilter = (user) => {
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
export const isResourceOwner = (user, resourceUserId) => {
    return user.id === resourceUserId;
};
/**
 * Validate user punya akses ke posyandu tertentu, throw error jika tidak
 */
export const requirePosyanduAccess = (user, posyanduId, resourceName = 'resource') => {
    if (!canAccessPosyandu(user, posyanduId)) {
        throw new Error(`Anda tidak memiliki akses ke ${resourceName} di posyandu ini`);
    }
};
/**
 * Validate user punya permission tertentu, throw error jika tidak
 */
export const requirePermission = (condition, message = 'Anda tidak memiliki permission untuk aksi ini') => {
    if (!condition) {
        throw new Error(message);
    }
};
