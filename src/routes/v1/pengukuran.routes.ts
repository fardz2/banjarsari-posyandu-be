// src/routes/v1/pengukuran.routes.ts

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  getAllPengukuran,
  getPengukuranById,
  getPengukuranByAnak,
  createPengukuran,
  updatePengukuran,
  deletePengukuran,
} from '../../controllers/pengukuran.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import {
  createPengukuranSchema,
  updatePengukuranSchema,
} from '../../utils/validations/pengukuran.validation.js';

const pengukuranRoutes = new Hono();

// Semua routes butuh authentication
pengukuranRoutes.use('*', authMiddleware);

// Read endpoints (semua authenticated user bisa akses, filtered by posyandu)
pengukuranRoutes.get('/', getAllPengukuran);
pengukuranRoutes.get('/anak/:nik', getPengukuranByAnak); // Orang tua bisa akses ini untuk anak sendiri
pengukuranRoutes.get('/:id', getPengukuranById);

// Create & Update (SUPER_ADMIN, ADMIN, TENAGA_KESEHATAN, KADER_POSYANDU)
pengukuranRoutes.post(
  '/',
  requireRole('SUPER_ADMIN', 'ADMIN', 'TENAGA_KESEHATAN', 'KADER_POSYANDU'),
  zValidator('json', createPengukuranSchema),
  createPengukuran
);
pengukuranRoutes.put(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMIN', 'TENAGA_KESEHATAN', 'KADER_POSYANDU'),
  zValidator('json', updatePengukuranSchema),
  updatePengukuran
);

// Delete (hanya SUPER_ADMIN dan ADMIN)
pengukuranRoutes.delete(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMIN'),
  deletePengukuran
);

export default pengukuranRoutes;
