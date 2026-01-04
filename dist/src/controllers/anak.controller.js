// src/controllers/anak.controller.ts
import { successResponse, errorResponse } from '../utils/response.helper.js';
import { getAllAnakService, getAnakByNikService, getMyChildrenService, createAnakService, updateAnakService, deleteAnakService, } from '../services/anak.service.js';
// GET /api/v1/anak
export const getAllAnak = async (c) => {
    try {
        const user = c.get('user');
        const posyanduId = c.req.query('posyanduId');
        const rw = c.req.query('rw');
        const filters = {
            posyanduId: posyanduId ? parseInt(posyanduId) : undefined,
            rw: rw || undefined,
        };
        const anak = await getAllAnakService(user, filters);
        return successResponse(c, anak, {
            message: 'Daftar anak berhasil diambil',
            meta: {
                count: anak.length,
            },
        });
    }
    catch (error) {
        console.error('Error getAllAnak:', error);
        return errorResponse(c, 'Gagal mengambil data anak', { status: 500 });
    }
};
// GET /api/v1/anak/my-children (untuk ORANG_TUA)
export const getMyChildren = async (c) => {
    try {
        const user = c.get('user');
        const children = await getMyChildrenService(user);
        return successResponse(c, children, {
            message: 'Daftar anak Anda berhasil diambil',
            meta: {
                count: children.length,
            },
        });
    }
    catch (error) {
        console.error('Error getMyChildren:', error);
        return errorResponse(c, 'Gagal mengambil data anak', { status: 500 });
    }
};
// GET /api/v1/anak/:nik
export const getAnakByNik = async (c) => {
    try {
        const nik = c.req.param('nik');
        const user = c.get('user');
        const anak = await getAnakByNikService(nik, user);
        return successResponse(c, anak, {
            message: 'Data anak berhasil diambil',
        });
    }
    catch (error) {
        console.error('Error getAnakByNik:', error);
        const status = error.message.includes('tidak ditemukan') ? 404 : 403;
        return errorResponse(c, error.message || 'Gagal mengambil data anak', {
            status,
        });
    }
};
// POST /api/v1/anak
export const createAnak = async (c) => {
    try {
        const user = c.get('user');
        const body = await c.req.json();
        if (!body.nik || !body.nama || !body.jenisKelamin || !body.tglLahir || !body.posyanduId) {
            return errorResponse(c, 'NIK, nama, jenis kelamin, tanggal lahir, dan posyandu wajib diisi', {
                status: 400,
            });
        }
        const anak = await createAnakService(body, user);
        return successResponse(c, anak, {
            message: 'Data anak berhasil ditambahkan',
            status: 201,
        });
    }
    catch (error) {
        console.error('Error createAnak:', error);
        const status = error.message.includes('permission') ? 403 : 400;
        return errorResponse(c, error.message || 'Gagal menambahkan data anak', {
            status,
        });
    }
};
// PUT /api/v1/anak/:nik
export const updateAnak = async (c) => {
    try {
        const nik = c.req.param('nik');
        const user = c.get('user');
        const body = await c.req.json();
        const anak = await updateAnakService(nik, body, user);
        return successResponse(c, anak, {
            message: 'Data anak berhasil diupdate',
        });
    }
    catch (error) {
        console.error('Error updateAnak:', error);
        const status = error.message.includes('permission') ? 403 : 400;
        return errorResponse(c, error.message || 'Gagal update data anak', {
            status,
        });
    }
};
// DELETE /api/v1/anak/:nik
export const deleteAnak = async (c) => {
    try {
        const nik = c.req.param('nik');
        const user = c.get('user');
        await deleteAnakService(nik, user);
        return successResponse(c, null, {
            message: 'Data anak berhasil dihapus',
        });
    }
    catch (error) {
        console.error('Error deleteAnak:', error);
        const status = error.message.includes('Admin') ? 403 : 400;
        return errorResponse(c, error.message || 'Gagal delete data anak', {
            status,
        });
    }
};
