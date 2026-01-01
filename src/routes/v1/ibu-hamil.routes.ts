// src/routes/v1/ibu-hamil.routes.ts

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  getAllIbuHamil,
  getIbuHamilById,
  createIbuHamil,
  updateIbuHamil,
  deleteIbuHamil,
} from '../../controllers/ibu-hamil.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import {
  createIbuHamilSchema,
  updateIbuHamilSchema,
} from '../../utils/validations/ibu-hamil.validation.js';

const ibuHamilRoutes = new Hono();

ibuHamilRoutes.use('*', authMiddleware);

// Read endpoints
ibuHamilRoutes.get(
  '/',
  requireRole('SUPER_ADMIN', 'ADMIN', 'TENAGA_KESEHATAN', 'KADER_POSYANDU'),
  getAllIbuHamil
);
ibuHamilRoutes.get(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMIN', 'TENAGA_KESEHATAN', 'KADER_POSYANDU'),
  getIbuHamilById
);

// Create & Update
ibuHamilRoutes.post(
  '/',
  requireRole('SUPER_ADMIN', 'ADMIN', 'TENAGA_KESEHATAN', 'KADER_POSYANDU'),
  zValidator('json', createIbuHamilSchema),
  createIbuHamil
);
ibuHamilRoutes.put(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMIN', 'TENAGA_KESEHATAN', 'KADER_POSYANDU'),
  zValidator('json', updateIbuHamilSchema),
  updateIbuHamil
);

// Delete
ibuHamilRoutes.delete('/:id', requireRole('SUPER_ADMIN', 'ADMIN'), deleteIbuHamil);

export default ibuHamilRoutes;
