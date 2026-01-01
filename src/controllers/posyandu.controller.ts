// src/controllers/posyandu.controller.ts

import type { Context } from 'hono';
import { successResponse, errorResponse } from '../utils/response.helper.js';
import {
  getAllPosyanduService,
  getPosyanduByIdService,
  createPosyanduService,
  updatePosyanduService,
  deletePosyanduService,
} from '../services/posyandu.service.js';
import type {
  CreatePosyanduInput,
  UpdatePosyanduInput,
} from '../utils/interfaces/posyandu.interface.js';
import type { UserContext } from '../utils/permission.helper.js';

// GET /api/v1/posyandu
export const getAllPosyandu = async (c: Context) => {
  try {
    const user = c.get('user') as UserContext;
    const posyandu = await getAllPosyanduService(user);

    return successResponse(c, posyandu, {
      message: 'Daftar posyandu berhasil diambil',
      meta: {
        count: posyandu.length,
      },
    });
  } catch (error: any) {
    console.error('Error getAllPosyandu:', error);
    return errorResponse(c, 'Gagal mengambil data posyandu', { status: 500 });
  }
};

// GET /api/v1/posyandu/:id
export const getPosyanduById = async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    const user = c.get('user') as UserContext;

    if (isNaN(id)) {
      return errorResponse(c, 'ID posyandu tidak valid', { status: 400 });
    }

    const posyandu = await getPosyanduByIdService(id, user);

    return successResponse(c, posyandu, {
      message: 'Posyandu berhasil diambil',
    });
  } catch (error: any) {
    console.error('Error getPosyanduById:', error);
    const status = error.message.includes('tidak ditemukan') ? 404 : 403;
    return errorResponse(c, error.message || 'Gagal mengambil data posyandu', {
      status,
    });
  }
};

// POST /api/v1/posyandu
export const createPosyandu = async (c: Context) => {
  try {
    const user = c.get('user') as UserContext;
    const body = await c.req.json<CreatePosyanduInput>();

    if (!body.nama) {
      return errorResponse(c, 'Nama posyandu wajib diisi', { status: 400 });
    }

    const posyandu = await createPosyanduService(body, user);

    return successResponse(c, posyandu, {
      message: 'Posyandu berhasil dibuat',
      status: 201,
    });
  } catch (error: any) {
    console.error('Error createPosyandu:', error);
    const status = error.message.includes('Super Admin') ? 403 : 400;
    return errorResponse(c, error.message || 'Gagal membuat posyandu', {
      status,
    });
  }
};

// PUT /api/v1/posyandu/:id
export const updatePosyandu = async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    const user = c.get('user') as UserContext;
    const body = await c.req.json<UpdatePosyanduInput>();

    if (isNaN(id)) {
      return errorResponse(c, 'ID posyandu tidak valid', { status: 400 });
    }

    const posyandu = await updatePosyanduService(id, body, user);

    return successResponse(c, posyandu, {
      message: 'Posyandu berhasil diupdate',
    });
  } catch (error: any) {
    console.error('Error updatePosyandu:', error);
    const status = error.message.includes('Super Admin') ? 403 : 400;
    return errorResponse(c, error.message || 'Gagal update posyandu', {
      status,
    });
  }
};

// DELETE /api/v1/posyandu/:id
export const deletePosyandu = async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    const user = c.get('user') as UserContext;

    if (isNaN(id)) {
      return errorResponse(c, 'ID posyandu tidak valid', { status: 400 });
    }

    await deletePosyanduService(id, user);

    return successResponse(c, null, {
      message: 'Posyandu berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deletePosyandu:', error);
    const status = error.message.includes('Super Admin')
      ? 403
      : error.message.includes('masih memiliki data')
      ? 409
      : 400;
    return errorResponse(c, error.message || 'Gagal delete posyandu', {
      status,
    });
  }
};
