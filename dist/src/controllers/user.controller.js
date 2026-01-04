import { successResponse, errorResponse } from '../utils/response.helper.js';
import { createUserService, getAllUsersService, getUserByIdService, updateUserService, deleteUserService, assignRoleService, getUserProfileService, updateUserProfileService, } from '../services/user.service.js';
import { Role } from "@prisma/client";
// POST /api/v1/users
export const createUser = async (c) => {
    try {
        const requestingUser = c.get('user');
        const body = await c.req.json();
        const newUser = await createUserService(body, requestingUser);
        return successResponse(c, newUser, {
            message: 'User berhasil dibuat',
            status: 201,
        });
    }
    catch (error) {
        console.error('Error createUser:', error);
        const status = error.message.includes('permission') ? 403 : 400;
        return errorResponse(c, error.message || 'Gagal membuat user', { status });
    }
};
// GET /api/v1/users
export const getAllUsers = async (c) => {
    try {
        const user = c.get('user');
        // Extract filter query params
        const role = c.req.query('role');
        const posyanduIdStr = c.req.query('posyanduId');
        const posyanduId = posyanduIdStr ? parseInt(posyanduIdStr, 10) : undefined;
        // Pass filters to service
        const filters = {
            role,
            posyanduId: posyanduId && !isNaN(posyanduId) ? posyanduId : undefined,
        };
        const users = await getAllUsersService(user, filters);
        return successResponse(c, users, {
            message: 'Daftar user berhasil diambil',
            meta: {
                count: users.length,
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error('Error getAllUsers:', error);
        return errorResponse(c, 'Gagal mengambil data user', { status: 500 });
    }
};
// GET /api/v1/users/:id
export const getUserById = async (c) => {
    try {
        const userId = c.req.param('id');
        const requestingUser = c.get('user');
        const user = await getUserByIdService(userId, requestingUser);
        return successResponse(c, user, {
            message: 'User berhasil diambil',
        });
    }
    catch (error) {
        console.error('Error getUserById:', error);
        const status = error.message.includes('tidak ditemukan') ? 404 : 403;
        return errorResponse(c, error.message || 'Gagal mengambil data user', {
            status,
        });
    }
};
// PUT /api/v1/users/:id
export const updateUser = async (c) => {
    try {
        const userId = c.req.param('id');
        const requestingUser = c.get('user');
        const body = await c.req.json();
        const updatedUser = await updateUserService(userId, body, requestingUser);
        return successResponse(c, updatedUser, {
            message: 'User berhasil diupdate',
        });
    }
    catch (error) {
        console.error('Error updateUser:', error);
        const status = error.message.includes('permission') ? 403 : 400;
        return errorResponse(c, error.message || 'Gagal update user', { status });
    }
};
// DELETE /api/v1/users/:id
export const deleteUser = async (c) => {
    try {
        const userId = c.req.param('id');
        const requestingUser = c.get('user');
        await deleteUserService(userId, requestingUser);
        return successResponse(c, null, {
            message: 'User berhasil dihapus',
        });
    }
    catch (error) {
        console.error('Error deleteUser:', error);
        const status = error.message.includes('permission') ? 403 : 400;
        return errorResponse(c, error.message || 'Gagal delete user', { status });
    }
};
// PATCH /api/v1/users/:id/role
export const assignRole = async (c) => {
    try {
        const userId = c.req.param('id');
        const requestingUser = c.get('user');
        const { role } = await c.req.json();
        if (!role) {
            return errorResponse(c, 'Role wajib diisi', { status: 400 });
        }
        const updatedUser = await assignRoleService(userId, role, requestingUser);
        return successResponse(c, updatedUser, {
            message: `Role berhasil diubah menjadi ${role}`,
        });
    }
    catch (error) {
        console.error('Error assignRole:', error);
        const status = error.message.includes('Super Admin') ? 403 : 400;
        return errorResponse(c, error.message || 'Gagal assign role', { status });
    }
};
// GET /api/v1/users/me
export const getUserProfile = async (c) => {
    try {
        const user = c.get('user');
        const profile = await getUserProfileService(user.id);
        return successResponse(c, profile, {
            message: 'Profile berhasil diambil',
        });
    }
    catch (error) {
        console.error('Error getUserProfile:', error);
        return errorResponse(c, error.message || 'Gagal mengambil profile', {
            status: 500,
        });
    }
};
// PUT /api/v1/users/me
export const updateUserProfile = async (c) => {
    try {
        const user = c.get('user');
        const body = await c.req.json();
        const updatedProfile = await updateUserProfileService(user.id, body);
        return successResponse(c, updatedProfile, {
            message: 'Profile berhasil diupdate',
        });
    }
    catch (error) {
        console.error('Error updateUserProfile:', error);
        return errorResponse(c, error.message || 'Gagal update profile', {
            status: 400,
        });
    }
};
