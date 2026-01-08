// src/controllers/ortu.controller.ts
import { successResponse, errorResponse } from '../utils/response.helper.js';
import { getAllOrtuService, getOrtuByIdService, getMyOrtuProfileService, createOrtuService, updateOrtuService, updateMyOrtuProfileService, deleteOrtuService, } from '../services/ortu.service.js';
export const createOrtu = async (c) => {
    try {
        const user = c.get('user');
        const body = await c.req.json();
        const ortu = await createOrtuService(body, user);
        return successResponse(c, ortu, {
            message: 'Data orang tua berhasil dibuat',
            status: 201,
        });
    }
    catch (error) {
        console.error('Error createOrtu:', error);
        const status = error.message.includes('permission') ? 403 : 400;
        return errorResponse(c, error.message || 'Gagal membuat data orang tua', {
            status,
        });
    }
};
export const getAllOrtu = async (c) => {
    try {
        const user = c.get('user');
        const ortu = await getAllOrtuService(user);
        return successResponse(c, ortu, {
            message: 'Daftar orang tua berhasil diambil',
            meta: { count: ortu.length },
        });
    }
    catch (error) {
        console.error('Error getAllOrtu:', error);
        return errorResponse(c, 'Gagal mengambil data orang tua', { status: 500 });
    }
};
export const getOrtuById = async (c) => {
    try {
        const id = parseInt(c.req.param('id'));
        const user = c.get('user');
        if (isNaN(id)) {
            return errorResponse(c, 'ID orang tua tidak valid', { status: 400 });
        }
        const ortu = await getOrtuByIdService(id, user);
        return successResponse(c, ortu, {
            message: 'Data orang tua berhasil diambil',
        });
    }
    catch (error) {
        console.error('Error getOrtuById:', error);
        const status = error.message.includes('tidak ditemukan') ? 404 : 403;
        return errorResponse(c, error.message || 'Gagal mengambil data orang tua', {
            status,
        });
    }
};
export const getMyOrtuProfile = async (c) => {
    try {
        const user = c.get('user');
        const ortu = await getMyOrtuProfileService(user);
        return successResponse(c, ortu, {
            message: 'Profile orang tua berhasil diambil',
        });
    }
    catch (error) {
        console.error('Error getMyOrtuProfile:', error);
        return errorResponse(c, 'Gagal mengambil profile orang tua', { status: 500 });
    }
};
export const updateOrtu = async (c) => {
    try {
        const id = parseInt(c.req.param('id'));
        const user = c.get('user');
        const body = await c.req.json();
        if (isNaN(id)) {
            return errorResponse(c, 'ID orang tua tidak valid', { status: 400 });
        }
        const ortu = await updateOrtuService(id, body, user);
        return successResponse(c, ortu, {
            message: 'Data orang tua berhasil diupdate',
        });
    }
    catch (error) {
        console.error('Error updateOrtu:', error);
        const status = error.message.includes('permission') ? 403 : 400;
        return errorResponse(c, error.message || 'Gagal update data orang tua', {
            status,
        });
    }
};
export const updateMyOrtuProfile = async (c) => {
    try {
        const user = c.get('user');
        const body = await c.req.json();
        const ortu = await updateMyOrtuProfileService(body, user);
        return successResponse(c, ortu, {
            message: 'Profile orang tua berhasil diupdate',
        });
    }
    catch (error) {
        console.error('Error updateMyOrtuProfile:', error);
        return errorResponse(c, error.message || 'Gagal update profile orang tua', {
            status: 400,
        });
    }
};
export const deleteOrtu = async (c) => {
    try {
        const id = parseInt(c.req.param('id'));
        const user = c.get('user');
        if (isNaN(id)) {
            return errorResponse(c, 'ID orang tua tidak valid', { status: 400 });
        }
        await deleteOrtuService(id, user);
        return successResponse(c, null, {
            message: 'Data orang tua berhasil dihapus',
        });
    }
    catch (error) {
        console.error('Error deleteOrtu:', error);
        const status = error.message.includes('Admin')
            ? 403
            : error.message.includes('masih memiliki')
                ? 409
                : 400;
        return errorResponse(c, error.message || 'Gagal delete data orang tua', {
            status,
        });
    }
};
