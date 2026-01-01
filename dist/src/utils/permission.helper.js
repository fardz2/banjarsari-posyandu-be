// src/utils/permission.helper.ts
/**
 * Check apakah role bisa akses semua posyandu
 */
export const canAccessAllPosyandu = (role) => {
    return role === 'SUPER_ADMIN';
};
/**
 * Check apakah role bisa manage users (create, update, delete, assign role)
 */
export const canManageUsers = (role) => {
    return role === 'SUPER_ADMIN' || role === 'ADMIN';
};
/**
 * Check apakah role bisa manage posyandu (create, update, delete)
 */
export const canManagePosyandu = (role) => {
    return role === 'SUPER_ADMIN';
};
/**
 * Check apakah role bisa CRUD data medis (Anak, Pengukuran, IbuHamil, Pemeriksaan)
 */
export const canManageMedicalData = (role) => {
    return (role === 'SUPER_ADMIN' ||
        role === 'ADMIN' ||
        role === 'TENAGA_KESEHATAN' ||
        role === 'KADER_POSYANDU');
};
/**
 * Check apakah role bisa delete data
 */
export const canDeleteData = (role) => {
    return role === 'SUPER_ADMIN' || role === 'ADMIN';
};
/**
 * Check apakah role bisa view statistics
 */
export const canViewStatistics = (role) => {
    return role !== 'ORANG_TUA';
};
/**
 * Check apakah user bisa akses posyandu tertentu
 */
export const canAccessPosyandu = (user, posyanduId) => {
    // Super admin dan Tenaga Kesehatan bisa akses semua posyandu
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
