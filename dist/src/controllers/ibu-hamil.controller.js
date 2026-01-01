// src/controllers/ibu-hamil.controller.ts
import { successResponse, errorResponse } from '../utils/response.helper.js';
import { getAllIbuHamilService, getIbuHamilByIdService, createIbuHamilService, updateIbuHamilService, deleteIbuHamilService, } from '../services/ibu-hamil.service.js';
export const getAllIbuHamil = async (c) => {
    try {
        const user = c.get('user');
        const posyanduId = c.req.query('posyanduId');
        const rw = c.req.query('rw');
        const filters = {
            posyanduId: posyanduId ? parseInt(posyanduId) : undefined,
            rw: rw || undefined,
        };
        const ibuHamil = await getAllIbuHamilService(user, filters);
        return successResponse(c, ibuHamil, {
            message: 'Daftar ibu hamil berhasil diambil',
            meta: { count: ibuHamil.length },
        });
    }
    catch (error) {
        console.error('Error getAllIbuHamil:', error);
        return errorResponse(c, 'Gagal mengambil data ibu hamil', { status: 500 });
    }
};
export const getIbuHamilById = async (c) => {
    try {
        const id = parseInt(c.req.param('id'));
        const user = c.get('user');
        if (isNaN(id)) {
            return errorResponse(c, 'ID ibu hamil tidak valid', { status: 400 });
        }
        const ibuHamil = await getIbuHamilByIdService(id, user);
        return successResponse(c, ibuHamil, {
            message: 'Data ibu hamil berhasil diambil',
        });
    }
    catch (error) {
        console.error('Error getIbuHamilById:', error);
        const status = error.message.includes('tidak ditemukan') ? 404 : 403;
        return errorResponse(c, error.message || 'Gagal mengambil data ibu hamil', {
            status,
        });
    }
};
export const createIbuHamil = async (c) => {
    try {
        const user = c.get('user');
        const body = await c.req.json();
        if (!body.nama || !body.posyanduId) {
            return errorResponse(c, 'Nama dan posyandu wajib diisi', { status: 400 });
        }
        const ibuHamil = await createIbuHamilService(body, user);
        return successResponse(c, ibuHamil, {
            message: 'Data ibu hamil berhasil ditambahkan',
            status: 201,
        });
    }
    catch (error) {
        console.error('Error createIbuHamil:', error);
        const status = error.message.includes('permission') ? 403 : 400;
        return errorResponse(c, error.message || 'Gagal menambahkan data ibu hamil', {
            status,
        });
    }
};
export const updateIbuHamil = async (c) => {
    try {
        const id = parseInt(c.req.param('id'));
        const user = c.get('user');
        const body = await c.req.json();
        if (isNaN(id)) {
            return errorResponse(c, 'ID ibu hamil tidak valid', { status: 400 });
        }
        const ibuHamil = await updateIbuHamilService(id, body, user);
        return successResponse(c, ibuHamil, {
            message: 'Data ibu hamil berhasil diupdate',
        });
    }
    catch (error) {
        console.error('Error updateIbuHamil:', error);
        const status = error.message.includes('permission') ? 403 : 400;
        return errorResponse(c, error.message || 'Gagal update data ibu hamil', {
            status,
        });
    }
};
export const deleteIbuHamil = async (c) => {
    try {
        const id = parseInt(c.req.param('id'));
        const user = c.get('user');
        if (isNaN(id)) {
            return errorResponse(c, 'ID ibu hamil tidak valid', { status: 400 });
        }
        await deleteIbuHamilService(id, user);
        return successResponse(c, null, {
            message: 'Data ibu hamil berhasil dihapus',
        });
    }
    catch (error) {
        console.error('Error deleteIbuHamil:', error);
        const status = error.message.includes('Admin') ? 403 : 400;
        return errorResponse(c, error.message || 'Gagal delete data ibu hamil', {
            status,
        });
    }
};
