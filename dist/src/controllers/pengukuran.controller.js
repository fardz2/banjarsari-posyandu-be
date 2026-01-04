// src/controllers/pengukuran.controller.ts
import { successResponse, errorResponse } from '../utils/response.helper.js';
import { getAllPengukuranService, getPengukuranByIdService, getPengukuranByAnakService, createPengukuranService, updatePengukuranService, deletePengukuranService, } from '../services/pengukuran.service.js';
// GET /api/v1/pengukuran
export const getAllPengukuran = async (c) => {
    try {
        const user = c.get('user');
        const anakNik = c.req.query('anakNik');
        const startDate = c.req.query('startDate');
        const endDate = c.req.query('endDate');
        const filters = {
            anakNik: anakNik || undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        };
        const pengukuran = await getAllPengukuranService(user, filters);
        return successResponse(c, pengukuran, {
            message: 'Daftar pengukuran berhasil diambil',
            meta: {
                count: pengukuran.length,
            },
        });
    }
    catch (error) {
        console.error('Error getAllPengukuran:', error);
        return errorResponse(c, 'Gagal mengambil data pengukuran', {
            status: 500,
        });
    }
};
// GET /api/v1/pengukuran/:id
export const getPengukuranById = async (c) => {
    try {
        const id = parseInt(c.req.param('id'));
        const user = c.get('user');
        if (isNaN(id)) {
            return errorResponse(c, 'ID pengukuran tidak valid', { status: 400 });
        }
        const pengukuran = await getPengukuranByIdService(id, user);
        return successResponse(c, pengukuran, {
            message: 'Data pengukuran berhasil diambil',
        });
    }
    catch (error) {
        console.error('Error getPengukuranById:', error);
        const status = error.message.includes('tidak ditemukan') ? 404 : 403;
        return errorResponse(c, error.message || 'Gagal mengambil data pengukuran', { status });
    }
};
// GET /api/v1/pengukuran/anak/:nik
export const getPengukuranByAnak = async (c) => {
    try {
        const nik = c.req.param('nik');
        const user = c.get('user');
        const pengukuran = await getPengukuranByAnakService(nik, user);
        return successResponse(c, pengukuran, {
            message: 'Riwayat pengukuran anak berhasil diambil',
            meta: {
                count: pengukuran.length,
            },
        });
    }
    catch (error) {
        console.error('Error getPengukuranByAnak:', error);
        const status = error.message.includes('tidak ditemukan') ? 404 : 403;
        return errorResponse(c, error.message || 'Gagal mengambil riwayat pengukuran', { status });
    }
};
// POST /api/v1/pengukuran
export const createPengukuran = async (c) => {
    try {
        const user = c.get('user');
        const body = await c.req.json();
        if (!body.anakNik || !body.tglUkur || !body.berat || !body.tinggi) {
            return errorResponse(c, 'NIK anak, tanggal ukur, berat, dan tinggi wajib diisi', { status: 400 });
        }
        const pengukuran = await createPengukuranService(body, user);
        return successResponse(c, pengukuran, {
            message: 'Data pengukuran berhasil ditambahkan',
            status: 201,
        });
    }
    catch (error) {
        console.error('Error createPengukuran:', error);
        const status = error.message.includes('permission') ? 403 : 400;
        return errorResponse(c, error.message || 'Gagal menambahkan data pengukuran', { status });
    }
};
// PUT /api/v1/pengukuran/:id
export const updatePengukuran = async (c) => {
    try {
        const id = parseInt(c.req.param('id'));
        const user = c.get('user');
        const body = await c.req.json();
        if (isNaN(id)) {
            return errorResponse(c, 'ID pengukuran tidak valid', { status: 400 });
        }
        const pengukuran = await updatePengukuranService(id, body, user);
        return successResponse(c, pengukuran, {
            message: 'Data pengukuran berhasil diupdate',
        });
    }
    catch (error) {
        console.error('Error updatePengukuran:', error);
        const status = error.message.includes('permission') ? 403 : 400;
        return errorResponse(c, error.message || 'Gagal update data pengukuran', {
            status,
        });
    }
};
// DELETE /api/v1/pengukuran/:id
export const deletePengukuran = async (c) => {
    try {
        const id = parseInt(c.req.param('id'));
        const user = c.get('user');
        if (isNaN(id)) {
            return errorResponse(c, 'ID pengukuran tidak valid', { status: 400 });
        }
        await deletePengukuranService(id, user);
        return successResponse(c, null, {
            message: 'Data pengukuran berhasil dihapus',
        });
    }
    catch (error) {
        console.error('Error deletePengukuran:', error);
        const status = error.message.includes('Admin') ? 403 : 400;
        return errorResponse(c, error.message || 'Gagal delete data pengukuran', {
            status,
        });
    }
};
