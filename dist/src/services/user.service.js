// src/services/user.service.ts
import { prisma } from '../db/prisma.js';
import { canAccessAllPosyandu, canManageUsers, getPosyanduFilter, requirePermission, } from '../utils/permission.helper.js';
import { auth } from '../auth.js';
// SERVICE: Create user baru
export const createUserService = async (data, requestingUser) => {
    // Only admin and super admin can create users
    requirePermission(canManageUsers(requestingUser.role), 'Anda tidak memiliki permission untuk membuat user');
    // Admin hanya bisa create user untuk posyandu sendiri
    if (requestingUser.role === 'ADMIN') {
        if (data.posyanduId && data.posyanduId !== requestingUser.posyanduId) {
            throw new Error('Admin hanya bisa membuat user untuk posyandu sendiri');
        }
        // Set posyanduId ke posyandu admin jika tidak diisi
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
        },
        select: {
            id: true,
            username: true,
            email: true,
            name: true,
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
export const getAllUsersService = async (requestingUser) => {
    const posyanduFilter = getPosyanduFilter(requestingUser);
    const users = await prisma.user.findMany({
        where: posyanduFilter,
        select: {
            id: true,
            username: true,
            email: true,
            name: true,
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
export const getUserByIdService = async (userId, requestingUser) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            name: true,
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
    // Check permission: super admin bisa lihat semua, admin hanya bisa lihat user di posyandu sendiri
    if (!canAccessAllPosyandu(requestingUser.role)) {
        if (user.posyanduId !== requestingUser.posyanduId) {
            throw new Error('Anda tidak memiliki akses ke user ini');
        }
    }
    return user;
};
// SERVICE: Update user
export const updateUserService = async (userId, data, requestingUser) => {
    // Get existing user
    const existingUser = await getUserByIdService(userId, requestingUser);
    // Only admin and super admin can update users
    requirePermission(canManageUsers(requestingUser.role), 'Anda tidak memiliki permission untuk update user');
    // Update user
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            name: data.name,
            username: data.username,
            posyanduId: data.posyanduId,
        },
        select: {
            id: true,
            username: true,
            email: true,
            name: true,
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
// SERVICE: Delete user (soft delete by setting posyanduId to null or hard delete)
export const deleteUserService = async (userId, requestingUser) => {
    // Get existing user
    await getUserByIdService(userId, requestingUser);
    // Only admin and super admin can delete users
    requirePermission(canManageUsers(requestingUser.role), 'Anda tidak memiliki permission untuk delete user');
    // Hard delete user
    await prisma.user.delete({
        where: { id: userId },
    });
};
// SERVICE: Assign role to user (super admin only)
export const assignRoleService = async (userId, role, requestingUser) => {
    // Only super admin can assign roles
    requirePermission(requestingUser.role === 'SUPER_ADMIN', 'Hanya Super Admin yang bisa assign role');
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: {
            id: true,
            username: true,
            email: true,
            name: true,
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
export const getUserProfileService = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            name: true,
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
export const updateUserProfileService = async (userId, data) => {
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
